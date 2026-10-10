#!/usr/bin/env node
/**
 * Claude Code 공식 문서(한국어)를 로컬에 동기화한다.
 *
 * 1. docs/_llms/ko.md 인덱스를 받아 그룹/서브그룹/슬러그/제목 트리를 파싱한다.
 * 2. 각 docs/ko/<slug>.md 를 동시성 제한을 두고 받아 content/docs/<slug>.md 로 저장한다.
 * 3. content/docs-index.json 에 {slug, title, group, subgroup, headings, chars, fetchedAt} 목록을 쓴다.
 *
 * 재배포하지 않는다 — 이 디렉터리는 .gitignore 되어 있고, 앱은 항상 출처 링크를 표시한다.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'

const DOCS_BASE = 'https://code.claude.com/docs'
const INDEX_URL = `${DOCS_BASE}/_llms/ko.md`
// public/ 아래 두면 Vite가 dev/build 모두에서 그대로 정적 서빙한다 (/content/docs-index.json 등).
const CONTENT_DIR = path.resolve('public/content')
const DOCS_DIR = path.join(CONTENT_DIR, 'docs')
const INDEX_FILE = path.join(CONTENT_DIR, 'docs-index.json')
const CORPUS_FILE = path.join(CONTENT_DIR, 'search-corpus.json')
const CONCURRENCY = 6

/**
 * 실제 _llms/ko.md 형식:
 *   ### 그룹명          (예: "시작하기", "구성", "에이전트 SDK")
 *   #### 서브그룹명      (예: "핵심 개념")
 *   ##### 더 세부 서브그룹 (일부 섹션만, 예: "클라우드의 Claude Code")
 *   - [제목](https://code.claude.com/docs/ko/slug.md): 설명
 */
function parseLlmsIndex(md) {
  const lines = md.split('\n')
  const pages = []
  let group = '기타'
  let subgroup = null

  const itemRe = /^-\s+\[(.+?)\]\(https:\/\/code\.claude\.com\/docs\/ko\/([\w./-]+?)\.md\)(?::\s*(.*))?$/

  for (const line of lines) {
    const h3 = /^###\s+(.+)$/.exec(line)
    const h4 = /^####\s+(.+)$/.exec(line)
    const h5 = /^#####\s+(.+)$/.exec(line)
    const item = itemRe.exec(line)

    if (h3) {
      group = h3[1].trim()
      subgroup = null
      continue
    }
    if (h4) {
      subgroup = h4[1].trim()
      continue
    }
    if (h5) {
      subgroup = h5[1].trim()
      continue
    }
    if (item) {
      const title = item[1].trim()
      const slug = item[2]
      const description = item[3]?.trim()
      pages.push({ slug, title, group, subgroup, description })
    }
  }
  return pages
}

const UA = { 'User-Agent': 'cc-dojo-doc-sync/1.0' }

/**
 * code.claude.com/docs/ko/<slug>.md 는 정상일 때 Content-Type: text/markdown 을 준다.
 * 일부 문서(changelog → GitHub blob, claude-tag → Mintlify 페이지 등)는 외부 사이트로 리다이렉트되는데,
 * 그 사이트가 .md 경로를 모르면 렌더링된 HTML 페이지로 200을 준다 — fetch()는 리다이렉트를 그대로
 * 따라가므로 그 HTML이 마크다운인 양 저장되어 버린다. text/html 이 오면 복구를 시도한다:
 * GitHub blob 페이지면 raw.githubusercontent.com으로, 그 외에는 최종 URL에 .md를 붙여 재시도한다
 * (Mintlify 등 상당수가 페이지 URL + .md 로 원문 마크다운을 그대로 서빙한다).
 */
async function fetchText(url) {
  const res = await fetch(url, { headers: UA })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html')) return res.text()

  const blobMatch = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/.exec(res.url)
  const retryUrl = blobMatch
    ? `https://raw.githubusercontent.com/${blobMatch[1]}/${blobMatch[2]}/${blobMatch[3]}`
    : `${res.url.replace(/\/$/, '')}.md`

  const retryRes = await fetch(retryUrl, { headers: UA })
  if (!retryRes.ok) throw new Error(`${retryRes.status} ${retryRes.statusText} for ${retryUrl} (원래 ${url} 가 HTML을 반환함)`)
  const retryType = retryRes.headers.get('content-type') ?? ''
  if (retryType.includes('text/html')) throw new Error(`${retryUrl} 도 HTML을 반환함 — 마크다운을 찾지 못함 (원래 ${url})`)
  return retryRes.text()
}

/** 검색 코퍼스용: HTML/마크다운 기호를 걷어낸 대략적인 평문으로 변환한다 (완벽한 변환 불필요, 토큰화 품질만 중요). */
function toPlainText(md) {
  return md
    .replace(/<[^>]+>/g, ' ') // HTML/MDX 태그
    .replace(/```[\s\S]*?```/g, ' ') // 코드 펜스 전체 (주석이 헤딩처럼 보이는 문제와 동일한 이유로 검색 노이즈도 줄인다)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크 텍스트만 남김
    .replace(/[#*_`>|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\wㄱ-힝\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/**
 * 문서 본문은 평범한 마크다운이 아니라 MDX다: 최상단 제목만 `# 제목`이고,
 * 나머지 섹션 헤딩은 `<h2 id="...">텍스트</h2>` / `<h3 id="...">텍스트</h3>` 형태로 들어있다.
 * id는 소스가 이미 부여한 값을 그대로 쓴다 (앵커 링크 `/docs/ko/slug#id`의 진짜 값).
 */
function extractHeadings(md) {
  const headings = []
  let inFence = false
  /** @type {{level:number, id:string, buffer:string[]} | null} */
  let collecting = null

  const flush = () => {
    if (!collecting) return
    const text = collecting.buffer.join(' ').replace(/<[^>]+>/g, '').replace(/[`*_]/g, '').trim()
    if (text) headings.push({ level: collecting.level, text, id: collecting.id })
    collecting = null
  }

  for (const line of md.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    if (collecting) {
      const closeIdx = line.indexOf(`</h${collecting.level}>`)
      if (closeIdx !== -1) {
        collecting.buffer.push(line.slice(0, closeIdx))
        flush()
      } else {
        collecting.buffer.push(line)
      }
      continue
    }

    const openMatch = /<h([1-4])\s+id="([^"]+)"\s*>(.*)$/.exec(line)
    if (openMatch) {
      const level = Number(openMatch[1])
      const id = openMatch[2]
      const rest = openMatch[3]
      const closeIdx = rest.indexOf(`</h${level}>`)
      if (closeIdx !== -1) {
        const text = rest.slice(0, closeIdx).replace(/<[^>]+>/g, '').replace(/[`*_]/g, '').trim()
        if (text) headings.push({ level, text, id })
      } else {
        collecting = { level, id, buffer: rest ? [rest] : [] }
      }
      continue
    }

    const h1 = /^#\s+(.+)$/.exec(line.trim())
    if (h1) {
      const text = h1[1].replace(/[`*_]/g, '').trim()
      headings.push({ level: 1, text, id: slugify(text) })
    }
  }
  flush()
  return headings
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

async function main() {
  console.log(`[fetch-docs] 인덱스 받는 중: ${INDEX_URL}`)
  const indexMd = await fetchText(INDEX_URL)
  const pages = parseLlmsIndex(indexMd)
  console.log(`[fetch-docs] ${pages.length}개 한국어 문서 페이지 발견`)

  if (pages.length === 0) {
    console.error('[fetch-docs] 페이지를 하나도 찾지 못했습니다. llms.txt 형식이 바뀌었을 수 있습니다.')
    process.exit(1)
  }

  await mkdir(DOCS_DIR, { recursive: true })

  let ok = 0
  let failed = 0
  const entries = await mapWithConcurrency(pages, CONCURRENCY, async (page) => {
    const url = `${DOCS_BASE}/ko/${page.slug}.md`
    try {
      const md = await fetchText(url)
      const outPath = path.join(DOCS_DIR, `${page.slug}.md`)
      await mkdir(path.dirname(outPath), { recursive: true })
      await writeFile(outPath, md, 'utf8')
      ok++
      return {
        slug: page.slug,
        title: page.title,
        group: page.group,
        subgroup: page.subgroup,
        description: page.description ?? null,
        headings: extractHeadings(md),
        chars: md.length,
        fetchedAt: new Date().toISOString(),
        sourceUrl: `${DOCS_BASE}/ko/${page.slug}`,
      }
    } catch (e) {
      failed++
      console.warn(`[fetch-docs] 실패: ${page.slug} (${e.message})`)
      return null
    }
  })

  const validEntries = entries.filter(Boolean)
  await writeFile(INDEX_FILE, JSON.stringify(validEntries, null, 2), 'utf8')

  // 검색 코퍼스는 별도 1개 파일로 묶어, 클라이언트가 221개를 따로 fetch하지 않고 한 번에 받게 한다.
  const corpus = await Promise.all(
    validEntries.map(async (e) => {
      const md = await readFile(path.join(DOCS_DIR, `${e.slug}.md`), 'utf8')
      return { id: e.slug, title: e.title, group: e.group, body: toPlainText(md).slice(0, 20000) }
    }),
  )
  await writeFile(CORPUS_FILE, JSON.stringify(corpus), 'utf8')

  console.log(`[fetch-docs] 완료: 성공 ${ok}, 실패 ${failed}. 인덱스: ${INDEX_FILE}, 검색 코퍼스: ${CORPUS_FILE}`)
}

main().catch((e) => {
  console.error('[fetch-docs] 치명적 오류:', e)
  process.exit(1)
})

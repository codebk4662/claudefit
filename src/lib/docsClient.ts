/**
 * 빌드 시 `npm run sync:docs`(scripts/fetch-docs.mjs)가 public/content/ 에 받아둔
 * 공식 문서 캐시를 런타임에 읽어오는 얇은 클라이언트. 네트워크 요청은 메모이즈한다.
 */

export interface DocHeading {
  level: number
  text: string
  id: string
}

export interface DocIndexEntry {
  slug: string
  title: string
  group: string
  subgroup: string | null
  description: string | null
  headings: DocHeading[]
  chars: number
  fetchedAt: string
  sourceUrl: string
}

export interface SearchCorpusEntry {
  id: string
  title: string
  group: string
  body: string
}

async function fetchJson<T>(url: string, notFoundHint: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${notFoundHint} (HTTP ${res.status})`)
  return res.json() as Promise<T>
}

/**
 * 원문 그대로라 학습자에게는 노이즈만 되는 문서. 라이브러리 목록·검색에서는 숨기지만
 * /docs/:slug 직접 접근과 loadDocMarkdown은 그대로 둬서 레퍼런스로는 계속 열어볼 수 있다.
 * 큐레이션된 버전 히스토리는 features/updates 를 따로 둔다.
 */
const HIDDEN_FROM_BROWSE = new Set(['changelog'])

let indexPromise: Promise<DocIndexEntry[]> | null = null
export function loadDocsIndex(): Promise<DocIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetchJson<DocIndexEntry[]>('/content/docs-index.json', '문서 인덱스를 불러올 수 없습니다. `npm run sync:docs`를 실행했는지 확인하세요.').then((entries) =>
      entries.filter((e) => !HIDDEN_FROM_BROWSE.has(e.slug)),
    )
  }
  return indexPromise
}

let corpusPromise: Promise<SearchCorpusEntry[]> | null = null
export function loadSearchCorpus(): Promise<SearchCorpusEntry[]> {
  if (!corpusPromise) {
    corpusPromise = fetchJson<SearchCorpusEntry[]>('/content/search-corpus.json', '검색 코퍼스를 불러올 수 없습니다. `npm run sync:docs`를 실행했는지 확인하세요.').then((entries) =>
      entries.filter((e) => !HIDDEN_FROM_BROWSE.has(e.id)),
    )
  }
  return corpusPromise
}

const mdCache = new Map<string, Promise<string>>()
export function loadDocMarkdown(slug: string): Promise<string> {
  let p = mdCache.get(slug)
  if (!p) {
    p = fetch(`/content/docs/${slug}.md`).then((res) => {
      if (!res.ok) throw new Error(`문서를 찾을 수 없습니다: ${slug}`)
      return res.text()
    })
    mdCache.set(slug, p)
  }
  return p
}

export function docUrl(entry: Pick<DocIndexEntry, 'sourceUrl'>): string {
  return entry.sourceUrl
}

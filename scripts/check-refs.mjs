#!/usr/bin/env node
/**
 * 커리큘럼(모듈/문항/실습)의 모든 docRef가 실제 content/docs-index.json 에 존재하는지 검증한다.
 * 문서가 바뀌어 모듈이 썩는 것을 잡아내는 장치. `npm run sync:docs` 후 반드시 실행한다.
 *
 * 이 스크립트는 .ts 소스를 esbuild 없이 가볍게 읽기 위해, src/curriculum/registry.ts 가
 * 모든 DocRef를 모아 export하는 `ALL_DOC_REFS`를 vite-node 로 평가해서 가져온다.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

async function loadAllDocRefs() {
  const server = await createServer({ server: { middlewareMode: 'ssr' }, logLevel: 'error' })
  try {
    const mod = await server.ssrLoadModule('/src/curriculum/registry.ts')
    return mod.collectAllDocRefs()
  } finally {
    await server.close()
  }
}

async function main() {
  const indexFile = path.resolve('public/content/docs-index.json')
  if (!existsSync(indexFile)) {
    console.error('[check-refs] public/content/docs-index.json 이 없습니다. 먼저 `npm run sync:docs` 를 실행하세요.')
    process.exit(1)
  }
  const docsIndex = JSON.parse(await readFile(indexFile, 'utf8'))
  const docsBySlug = new Map(docsIndex.map((d) => [d.slug, d]))

  const refs = await loadAllDocRefs()
  console.log(`[check-refs] 검사할 docRef: ${refs.length}개`)

  let brokenSlug = 0
  let brokenAnchor = 0

  for (const { ref, source } of refs) {
    const doc = docsBySlug.get(ref.slug)
    if (!doc) {
      console.error(`✗ [${source}] 존재하지 않는 slug: "${ref.slug}"`)
      brokenSlug++
      continue
    }
    if (ref.anchor) {
      const found = doc.headings.some((h) => h.id === ref.anchor)
      if (!found) {
        console.error(`✗ [${source}] slug "${ref.slug}" 에 앵커 "#${ref.anchor}" 없음`)
        brokenAnchor++
      }
    }
  }

  if (brokenSlug + brokenAnchor === 0) {
    console.log(`[check-refs] 통과: 끊긴 참조 0건`)
    process.exit(0)
  } else {
    console.error(`[check-refs] 실패: slug 오류 ${brokenSlug}건, 앵커 오류 ${brokenAnchor}건`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('[check-refs] 치명적 오류:', e)
  process.exit(1)
})

#!/usr/bin/env node
/** predev 훅: content/docs-index.json 이 없으면 최초 1회 문서를 동기화한다. */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const indexFile = path.resolve('public/content/docs-index.json')

if (existsSync(indexFile)) {
  console.log('[ensure-docs] public/content/docs-index.json 이미 존재 — 건너뜀 (갱신하려면 npm run sync:docs)')
  process.exit(0)
}

console.log('[ensure-docs] 문서 캐시가 없습니다. 최초 동기화를 실행합니다…')
const result = spawnSync(process.execPath, [path.resolve('scripts/fetch-docs.mjs')], { stdio: 'inherit' })
process.exit(result.status ?? 1)

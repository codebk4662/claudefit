#!/usr/bin/env node
/** adb screencap으로 찍은 스크린샷(RGBA)을 플레이스토어 규격(알파 채널 없는 24비트 PNG)으로 변환한다. */
import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

const DIR = path.resolve(import.meta.dirname, '..', 'store-assets', 'screenshots')

async function main() {
  const files = (await readdir(DIR)).filter((f) => f.endsWith('.png'))
  for (const f of files) {
    const p = path.join(DIR, f)
    const img = sharp(p)
    const meta = await img.metadata()
    if (meta.hasAlpha) {
      const buf = await sharp(p).flatten({ background: '#FBF8F1' }).png().toBuffer()
      await sharp(buf).toFile(p)
      console.log(`  ✓ ${f} — 알파 채널 제거 (${meta.width}×${meta.height})`)
    } else {
      console.log(`  - ${f} — 이미 알파 없음 (${meta.width}×${meta.height})`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

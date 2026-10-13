#!/usr/bin/env node
/** 플레이스토어 피처 그래픽(1024×500)을 브랜드 마크 + 워드마크로 생성한다. 아이콘과 같은 주황 브랜드 톤. */
import sharp from 'sharp'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'store-assets', 'feature-graphic.png')

const ORANGE = '#D97757' // scripts/generate-icons.mjs 의 BRAND_ORANGE와 동일 — 아이콘·스토어 자산 간 톤 일치
const CREAM = '#FDF6EC'

function rays(count, cx, cy, innerR, outerR, width) {
  let out = ''
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i
    out += `<rect x="${(cx - width / 2).toFixed(2)}" y="${(cy - outerR).toFixed(2)}" width="${width.toFixed(2)}" height="${(outerR - innerR).toFixed(2)}" rx="${(width / 2).toFixed(2)}" fill="${CREAM}" opacity="0.3" transform="rotate(${angle} ${cx} ${cy})" />`
  }
  return out
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <rect width="1024" height="500" fill="${ORANGE}" />
  <g>${rays(18, 192, 250, 60, 300, 7)}</g>

  <!-- 코드 바벨 마크 (1024 기준 좌표를 0.234375배로 축소해 240x240 박스에 배치) -->
  <g transform="translate(72,130) scale(0.234375)">
    <rect x="352" y="462" width="320" height="100" rx="50" fill="${CREAM}" />
    <path d="M 352 402 L 242 512 L 352 622" fill="none" stroke="${CREAM}" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 672 402 L 782 512 L 672 622" fill="none" stroke="${CREAM}" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <text x="368" y="276" font-family="serif" font-size="96" fill="${CREAM}">ClaudeFit</text>
  <rect x="368" y="302" width="420" height="2" fill="${CREAM}" opacity="0.5" />
  <text x="368" y="356" font-family="sans-serif" font-size="34" fill="${CREAM}">Claude Code 학습 트레이닝</text>
</svg>`

await sharp(Buffer.from(svg)).flatten({ background: ORANGE }).png().toFile(OUT)
console.log(`✓ ${path.relative(ROOT, OUT)} (1024×500)`)

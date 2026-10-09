#!/usr/bin/env node
/** 플레이스토어 피처 그래픽(1024×500)을 브랜드 마크 + 워드마크로 생성한다. */
import sharp from 'sharp'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'store-assets', 'feature-graphic.png')

const GOLD = '#C9A24B'
const BG = '#14130F'
const TEXT = '#F3EEDF'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <radialGradient id="glow" cx="18%" cy="50%" r="55%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.14" />
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1024" height="500" fill="${BG}" />
  <rect width="1024" height="500" fill="url(#glow)" />

  <!-- 코드 바벨 마크 (1024 기준 좌표를 0.234375배로 축소해 240x240 박스에 배치) -->
  <g transform="translate(72,130) scale(0.234375)">
    <rect x="352" y="462" width="320" height="100" rx="50" fill="${GOLD}" />
    <path d="M 352 402 L 242 512 L 352 622" fill="none" stroke="${GOLD}" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 672 402 L 782 512 L 672 622" fill="none" stroke="${GOLD}" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <text x="368" y="276" font-family="serif" font-size="96" fill="${TEXT}">클로드핏</text>
  <rect x="368" y="302" width="420" height="2" fill="${GOLD}" opacity="0.4" />
  <text x="368" y="356" font-family="sans-serif" font-size="34" fill="${GOLD}">Claude Code 학습 트레이닝</text>
</svg>`

await sharp(Buffer.from(svg)).flatten({ background: BG }).png().toFile(OUT)
console.log(`✓ ${path.relative(ROOT, OUT)} (1024×500)`)

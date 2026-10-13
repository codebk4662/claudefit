#!/usr/bin/env node
/**
 * store-assets/screenshots/raw/*.png (adb로 찍은 날것의 캡처)에 스픽(Speak) 류 언어학습 앱
 * 플레이스토어 스크린샷처럼 짧은 헤드라인 카피를 입혀 store-assets/screenshots/*.png 로 합성한다.
 * "하루 몇 분이면 충분한 습관"이라는 톤 — 실제 앱 안의 "약 7분" 같은 숫자를 그대로 가져와 과장하지 않는다.
 *
 * 출력 1080×1920 (9:16, 플레이스토어 허용 비율 안전권). 상단 주황 헤드라인 밴드 + 아래 스크린샷(여백 포함,
 * 잘리는 부분 없음, 모서리만 둥글게).
 */
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const RAW_DIR = path.join(ROOT, 'store-assets', 'screenshots', 'raw')
const OUT_DIR = path.join(ROOT, 'store-assets', 'screenshots')

const ORANGE = '#D97757'
const ORANGE_DEEP = '#C2643F'
const CREAM = '#FDF6EC'

const W = 1080
const H = 1920
const HEADER_H = 300
const PAD_X = 64
const PAD_TOP = 40
const PAD_BOTTOM = 56

/** 파일명 · 2줄 헤드라인 — 각 화면의 실제 문구/숫자를 그대로 가져와 과장 없이 짧게 */
const SLIDES = [
  { file: '01-dashboard.png', lines: ['하루 약 7분,', 'Claude Code 습관 만들기'] },
  { file: '02-practice.png', lines: ['진짜 터미널처럼,', '손으로 직접 실습'] },
  { file: '03-learn.png', lines: ['입문부터 숙련까지', '5개 트랙으로 차근차근'] },
  { file: '04-drill.png', lines: ['매일 조금씩,', '오늘의 드릴로 꾸준하게'] },
  { file: '05-docs.png', lines: ['헷갈릴 땐 검색 한 번,', '공식 문서 220페이지'] },
]

function raysSvg(count, cx, cy, innerR, outerR, width) {
  let out = ''
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i
    out += `<rect x="${(cx - width / 2).toFixed(2)}" y="${(cy - outerR).toFixed(2)}" width="${width.toFixed(2)}" height="${(outerR - innerR).toFixed(2)}" rx="${(width / 2).toFixed(2)}" fill="${CREAM}" opacity="0.16" transform="rotate(${angle} ${cx} ${cy})" />`
  }
  return out
}

function barbellMarkSmall(cx, cy, scale) {
  // scripts/generate-icons.mjs의 barbellMark(1024 기준)을 중심 cx,cy에 scale로 축소 배치
  return `<g transform="translate(${cx - 512 * scale},${cy - 512 * scale}) scale(${scale})">
    <rect x="352" y="462" width="320" height="100" rx="50" fill="${CREAM}" />
    <path d="M 352 402 L 242 512 L 352 622" fill="none" stroke="${CREAM}" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 672 402 L 782 512 L 672 622" fill="none" stroke="${CREAM}" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" />
  </g>`
}

function headerSvg(lines) {
  const [l1, l2] = lines
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${ORANGE}" />
        <stop offset="100%" stop-color="${ORANGE_DEEP}" />
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${CREAM}" />
    <rect width="${W}" height="${HEADER_H}" fill="url(#bg)" />
    ${raysSvg(16, 90, 90, 20, 170, 5)}
    ${barbellMarkSmall(90, 90, 0.052)}
    <text x="${PAD_X}" y="168" font-family="serif" font-weight="700" font-size="56" fill="${CREAM}">${l1}</text>
    <text x="${PAD_X}" y="236" font-family="serif" font-weight="700" font-size="56" fill="${CREAM}">${l2}</text>
  </svg>`
}

function roundedMaskSvg(w, h, r) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#fff" /></svg>`
}

async function buildOne({ file, lines }) {
  const rawPath = path.join(RAW_DIR, file)
  const outPath = path.join(OUT_DIR, file)

  const raw = sharp(await readFile(rawPath))
  const meta = await raw.metadata()

  const contentW = W - PAD_X * 2
  const contentH = H - HEADER_H - PAD_TOP - PAD_BOTTOM
  const scale = Math.min(contentW / meta.width, contentH / meta.height)
  const shotW = Math.round(meta.width * scale)
  const shotH = Math.round(meta.height * scale)
  const shotX = Math.round((W - shotW) / 2)
  const shotY = HEADER_H + PAD_TOP

  const resizedShot = await raw.resize(shotW, shotH).png().toBuffer()
  const radius = 28
  const mask = Buffer.from(roundedMaskSvg(shotW, shotH, radius))
  const roundedShot = await sharp(resizedShot).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()

  const base = Buffer.from(headerSvg(lines))

  await sharp(base)
    .composite([{ input: roundedShot, left: shotX, top: shotY }])
    .png()
    .toFile(outPath)

  console.log(`  ✓ ${path.relative(ROOT, outPath)} (${W}×${H})`)
}

async function main() {
  console.log('[screenshots] 헤드라인 합성')
  for (const slide of SLIDES) await buildOne(slide)
  console.log('[screenshots] 완료')
}

main().catch((e) => {
  console.error('[screenshots] 실패:', e)
  process.exit(1)
})

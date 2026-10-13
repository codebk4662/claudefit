#!/usr/bin/env node
/**
 * 앱 아이콘(런처/파비콘/스토어)과 스플래시 소스를 렌더링한다.
 * - 아이콘: 주황 배경 + 방사형(선버스트) 패턴 + 코드 바벨 마크(`<`/`>` 모양 플레이트를 단 역기).
 *   Claude 공식 앱의 "주황 배경 + 방사형" 톤은 참고하되, 레이 개수/마크는 이 앱 고유의 디자인이다
 *   (공식 로고를 그대로 복제하면 비공식 앱이 공식으로 오인될 수 있어 피함).
 * - 스플래시: 기존 다크/라이트 테마 그대로(인앱 실제 배색과 맞춰야 콜드 스타트가 자연스럽다) — 아이콘과는 분리된 소스.
 * 안드로이드 SDK 없이 순수 Node(sharp)만으로 동작 — @capacitor/assets가 나중에
 * assets/icon.png, icon-foreground.png, icon-background.png, splash*.png 를 읽어
 * 안드로이드 전체 밀도별/적응형 아이콘·스플래시를 추가로 생성한다.
 */
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const ASSETS = path.join(ROOT, 'assets')
const PUBLIC = path.join(ROOT, 'public')

const GOLD_DARK = '#C9A24B' // 다크 테마 악센트(샴페인 골드) — 스플래시용, 인앱 실제 배색과 동일
const GOLD_LIGHT = '#96722A' // 라이트 테마 악센트(딥 골드) — 스플래시용
const BG_DARK = '#14130F'
const BG_LIGHT = '#FBF8F1'

const BRAND_ORANGE = '#D97757' // 아이콘 전용 포인트 컬러(테라코타 오렌지) — 인앱 테마(골드/다크)와는 별개, 런처·스토어 아이콘에만 쓴다
const ICON_CREAM = '#FDF6EC' // 방사형 레이·바벨 마크 색

/** 바벨 마크(플레이트 2개 + 바)만 그리는 도형 조각 — 배경은 호출하는 쪽에서 합성한다. */
function barbellMark({ stroke, size = 1024 }) {
  const c = size / 2
  const sw = size * 0.09765625 // 1024 기준 100 — 바/플레이트 공통 굵기(두꺼울수록 "꺾쇠"보다 "플레이트"로 읽힌다)
  const barHalf = size * 0.15625 // 1024 기준 160 — 중앙에서 바 끝까지
  const halfH = size * 0.107421875 // 1024 기준 110 — 플레이트(꺾쇠) 반높이: 짧게 눌러 화살표가 아닌 역기 플레이트로 보이게 함
  const innerX = c - barHalf
  const outerX = innerX - halfH
  const innerXR = c + barHalf
  const outerXR = innerXR + halfH
  const barY = c - sw / 2
  return `
    <rect x="${innerX.toFixed(1)}" y="${barY.toFixed(1)}" width="${(barHalf * 2).toFixed(1)}" height="${sw.toFixed(1)}" rx="${(sw / 2).toFixed(1)}" fill="${stroke}" />
    <path d="M ${innerX.toFixed(1)} ${(c - halfH).toFixed(1)} L ${outerX.toFixed(1)} ${c.toFixed(1)} L ${innerX.toFixed(1)} ${(c + halfH).toFixed(1)}"
      fill="none" stroke="${stroke}" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M ${innerXR.toFixed(1)} ${(c - halfH).toFixed(1)} L ${outerXR.toFixed(1)} ${c.toFixed(1)} L ${innerXR.toFixed(1)} ${(c + halfH).toFixed(1)}"
      fill="none" stroke="${stroke}" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" />
  `
}

function barbellSvg({ bg, stroke, size = 1024 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${bg}" />
    ${barbellMark({ stroke, size })}
  </svg>`
}

/** 중앙을 비워둔 채 바깥으로 뻗는 방사형 레이 — 마크를 가리지 않도록 안쪽 반지름부터 시작한다. */
function sunburstRays({ size, color, opacity = 0.38, count = 20 }) {
  const c = size / 2
  const innerR = size * 0.235
  const outerR = size * 0.5
  const rayW = size * 0.021
  let rays = ''
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i
    rays += `<rect x="${(c - rayW / 2).toFixed(2)}" y="${(c - outerR).toFixed(2)}" width="${rayW.toFixed(2)}" height="${(outerR - innerR).toFixed(2)}" rx="${(rayW / 2).toFixed(2)}" fill="${color}" opacity="${opacity}" transform="rotate(${angle} ${c} ${c})" />`
  }
  return rays
}

/** 런처/스토어 아이콘: 주황 배경 + 방사형 레이 + 바벨 마크. bg:false 면 배경 없이 레이+마크만(적응형 아이콘 전경용 X — 전경은 마크만 따로 씀). */
function brandIconSvg({ size = 1024, bg = true } = {}) {
  const bgRect = bg ? `<rect width="${size}" height="${size}" fill="${BRAND_ORANGE}" />` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    ${bgRect}
    ${sunburstRays({ size, color: ICON_CREAM })}
    ${barbellMark({ stroke: ICON_CREAM, size })}
  </svg>`
}

/** 적응형 아이콘 배경 레이어: 주황 + 레이만(마크 없음 — 마크는 전경 레이어가 따로 얹는다). */
function brandBackgroundSvg({ size = 1024 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${BRAND_ORANGE}" />
    ${sunburstRays({ size, color: ICON_CREAM })}
  </svg>`
}

/** 브라우저 탭 파비콘용 — 아이콘 마스터를 둥근 사각형(squircle)으로 잘라낸 SVG 그대로 쓴다(래스터화 불필요). */
function brandFaviconSvg({ size = 1024, rx = 192 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <defs><clipPath id="squircle"><rect width="${size}" height="${size}" rx="${rx}" /></clipPath></defs>
    <g clip-path="url(#squircle)">
      <rect width="${size}" height="${size}" fill="${BRAND_ORANGE}" />
      ${sunburstRays({ size, color: ICON_CREAM })}
      ${barbellMark({ stroke: ICON_CREAM, size })}
    </g>
  </svg>`
}

async function toPng(svgString, size, outPath) {
  await sharp(Buffer.from(svgString)).resize(size, size).png().toFile(outPath)
  console.log(`  ✓ ${path.relative(ROOT, outPath)} (${size}×${size})`)
}

async function main() {
  await mkdir(PUBLIC, { recursive: true })
  await mkdir(ASSETS, { recursive: true })

  // 아이콘 마스터(주황 배경 + 방사형 + 골드 코드 바벨) — 파비콘, PWA 아이콘, Apple touch icon, Capacitor 아이콘 소스
  const iconSvg = brandIconSvg()

  console.log('[icons] PWA / 파비콘 세트')
  await writeFile(path.join(PUBLIC, 'favicon.svg'), brandFaviconSvg(), 'utf8')
  console.log(`  ✓ ${path.relative(ROOT, path.join(PUBLIC, 'favicon.svg'))}`)
  await toPng(iconSvg, 192, path.join(PUBLIC, 'pwa-192.png'))
  await toPng(iconSvg, 512, path.join(PUBLIC, 'pwa-512.png'))
  await toPng(iconSvg, 512, path.join(PUBLIC, 'pwa-maskable-512.png')) // 이미 안전 영역 안에 그려져 있어 그대로 사용 가능
  await toPng(iconSvg, 180, path.join(PUBLIC, 'apple-touch-icon.png'))

  console.log('[icons] Capacitor 아이콘 소스 (assets/) — @capacitor/assets generate 가 나중에 읽는다')
  await toPng(iconSvg, 1024, path.join(ASSETS, 'icon.png'))
  await toPng(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${barbellMark({ stroke: ICON_CREAM, size: 1024 })}</svg>`, 1024, path.join(ASSETS, 'icon-foreground.png'))
  await toPng(brandBackgroundSvg(), 1024, path.join(ASSETS, 'icon-background.png'))

  console.log('[icons] Capacitor 스플래시 소스 (assets/) — 인앱 실제 다크/라이트 배색 그대로, 아이콘과 무관')
  await toPng(barbellSvg({ bg: BG_DARK, stroke: GOLD_DARK }), 2732, path.join(ASSETS, 'splash.png'))
  await toPng(barbellSvg({ bg: BG_DARK, stroke: GOLD_DARK }), 2732, path.join(ASSETS, 'splash-dark.png'))
  await toPng(barbellSvg({ bg: BG_LIGHT, stroke: GOLD_LIGHT }), 2732, path.join(ASSETS, 'splash-light.png'))

  console.log('[icons] 완료')
}

main().catch((e) => {
  console.error('[icons] 실패:', e)
  process.exit(1)
})

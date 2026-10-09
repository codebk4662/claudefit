/** 코드 바벨 마크(`<`/`>` 모양 플레이트를 단 역기) — 앱 아이콘(assets/icon-flat.svg)과 동일한 형태의 인라인 SVG. 다크/라이트 어느 배경에도 고정된 배색을 유지한다(브랜드 마크 관례). */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true" className="shrink-0">
      <rect width="1024" height="1024" rx="224" fill="#14130F" />
      <rect x="352" y="462" width="320" height="100" rx="50" fill="#C9A24B" />
      <path d="M 352 402 L 242 512 L 352 622" fill="none" stroke="#C9A24B" strokeWidth="100" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 672 402 L 782 512 L 672 622" fill="none" stroke="#C9A24B" strokeWidth="100" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

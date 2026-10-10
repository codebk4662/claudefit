// 클로드코드 CLI 시작화면의 픽셀아트 캐릭터를 16x12 그리드로 재현 — 각 행은 채워진 칼럼 구간([시작, 끝))의 목록.
// 위에서부터: 안테나 2개 · 눈(구멍) 2개 · 몸통 · 옆 돌기(몸통과 같은 줄에 합쳐짐) · 다리 4개.
const PIXEL_ROWS: [number, number][][] = [
  [[4, 6], [10, 12]],
  [[4, 6], [10, 12]],
  [[2, 14]],
  [[2, 5], [6, 10], [11, 14]],
  [[2, 5], [6, 10], [11, 14]],
  [[2, 14]],
  [[0, 16]],
  [[0, 16]],
  [[2, 14]],
  [[2, 14]],
  [[3, 4], [6, 7], [9, 10], [12, 13]],
  [[3, 4], [6, 7], [9, 10], [12, 13]],
]

const PIXEL_COLOR = '#D97757'

/** 터미널 실습에 생동감을 주는 클로드코드 CLI 캐릭터 — 단계를 통과하면 잠깐 "응답 중"처럼 빛난다. */
export function ClaudeAvatar({ thinking = false }: { thinking?: boolean }) {
  return (
    <span className="relative inline-flex items-center justify-center w-9 h-7 shrink-0" aria-hidden>
      {thinking && <span className="claude-avatar-ping absolute inset-0 rounded-full" style={{ background: PIXEL_COLOR }} />}
      <svg
        viewBox="0 0 16 12"
        width="36"
        height="27"
        shapeRendering="crispEdges"
        className={`relative transition-transform duration-300 ${thinking ? 'scale-110' : 'scale-100'}`}
      >
        {PIXEL_ROWS.map((ranges, y) => ranges.map(([x0, x1], i) => <rect key={`${y}-${i}`} x={x0} y={y} width={x1 - x0} height={1} fill={PIXEL_COLOR} />))}
      </svg>
    </span>
  )
}

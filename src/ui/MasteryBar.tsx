/**
 * 스킬 숙련도 미터. dataviz 스킬 처방: "단일 비율 대 한계치" → Meter(같은 램프의 트랙+채움),
 * 시퀀셜 1-hue, 값은 끝에 직접 라벨(단일 시리즈라 범례 불필요), 텍스트는 데이터 색을 입지 않음.
 */
export function MasteryBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--text-dim)] w-36 shrink-0 truncate" title={label}>
        {label}
      </span>
      {/* 라벨/수치 글씨를 14px 이상으로 키운 만큼, 막대는 h-3→h-2로 가늘게 눌러 균형을 맞춘다 */}
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--viz-track)' }} role="img" aria-label={`${label} 숙련도 ${value}%`}>
        <div
          className="h-2"
          style={{
            width: `${Math.max(value === 0 ? 0 : 3, value)}%`,
            background: 'var(--viz-fill)',
            borderRadius: '0 4px 4px 0', // 4px 둥근 데이터 끝 + 기준선(좌측)은 각지게
          }}
        />
      </div>
      <span className="text-sm tabular-nums w-10 text-right text-[var(--text-dim)]">{value}%</span>
    </div>
  )
}

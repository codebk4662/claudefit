import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ALL_ITEMS } from '@/curriculum/items'
import { pickDailyDrillItems } from '@/engine/scheduler'
import { useProgress, computeMasteryBySkill } from '@/store/progress'
import { Card, PageHeader, PrimaryButton } from '@/ui/common'
import { QuizRunner, QuizSummary } from '@/features/quiz/QuizRunner'

export function DrillPage() {
  const navigate = useNavigate()
  const { srs, itemAttempts, labAttempts } = useProgress()
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)
  const [runKey, setRunKey] = useState(0)

  const masteryBySkill = useMemo(() => computeMasteryBySkill({ itemAttempts, labAttempts }), [itemAttempts, labAttempts])
  const itemIds = useMemo(
    () => pickDailyDrillItems({ allItems: ALL_ITEMS, srsByItemId: srs, masteryBySkill, limit: 10 }),
    // runKey가 바뀌면("다시 풀기") 그 시점의 최신 SRS 상태로 다시 뽑는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runKey],
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/" className="text-sm text-[var(--accent)] hover:underline">
        ← 대시보드
      </Link>
      <PageHeader title="오늘의 드릴" description="복습 기한이 지난 문항과 약점 스킬의 신규 문항을 섞었습니다." />

      {itemIds.length === 0 ? (
        <Card>
          <p className="font-medium mb-2">오늘 복습할 문항이 없습니다 🎉</p>
          <p className="text-sm text-[var(--text-dim)] mb-4">학습 트랙에서 새 모듈을 진행하면 드릴에 문항이 쌓입니다.</p>
          <PrimaryButton onClick={() => navigate('/learn')}>학습 트랙으로 →</PrimaryButton>
        </Card>
      ) : result ? (
        <QuizSummary
          correct={result.correct}
          total={result.total}
          retryLabel="새 드릴 받기"
          onRestart={() => {
            setResult(null)
            setRunKey((k) => k + 1)
          }}
        />
      ) : (
        <QuizRunner key={runKey} itemIds={itemIds} onFinish={setResult} />
      )}
    </div>
  )
}

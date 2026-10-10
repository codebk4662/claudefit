import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ALL_ITEMS } from '@/curriculum/items'
import { ALL_LABS, scenarioById, forgeTaskById } from '@/curriculum/registry'
import { pickDailyDrillItems, pickDailyDrillLabs } from '@/engine/scheduler'
import { useProgress, computeMasteryBySkill } from '@/store/progress'
import { Card, PageHeader, PrimaryButton, SecondaryButton } from '@/ui/common'
import { hapticSelect } from '@/lib/haptics'
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
  const labPicks = useMemo(
    () => pickDailyDrillLabs({ allLabs: ALL_LABS, srsByItemId: srs, masteryBySkill, limit: 2 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runKey],
  )

  const labCards = labPicks
    .map((pick) => {
      const lab = pick.kind === 'terminal' ? scenarioById.get(pick.id) : forgeTaskById.get(pick.id)
      if (!lab) return null
      const to = pick.kind === 'terminal' ? `/terminal/${pick.id}` : `/forge/${pick.id}`
      return { ...pick, title: lab.title, to }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/" className="text-sm text-[var(--accent)] hover:underline">
        ← 대시보드
      </Link>
      <PageHeader title="오늘의 드릴" description="복습 기한이 지난 문항·실습과 약점 스킬의 신규 문항을 섞었습니다." />

      {itemIds.length === 0 && labCards.length === 0 ? (
        <Card>
          <p className="font-medium mb-2">오늘 복습할 항목이 없습니다 🎉</p>
          <p className="text-sm text-[var(--text-dim)] mb-4">학습 트랙에서 새 모듈을 진행하면 드릴에 문항과 실습이 쌓입니다.</p>
          <PrimaryButton onClick={() => navigate('/learn')}>학습 트랙으로 →</PrimaryButton>
        </Card>
      ) : (
        <>
          {itemIds.length === 0 ? null : result ? (
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

          {labCards.length > 0 && (
            <Card className="mt-6">
              <h2 className="font-semibold mb-1">오늘의 실습</h2>
              <p className="text-sm text-[var(--text-dim)] mb-3">복습 기한이 지났거나 아직 안 해본 실습입니다. 눌러서 바로 이어서 풀어보세요.</p>
              <div className="flex flex-col gap-2">
                {labCards.map((c) => (
                  <SecondaryButton
                    key={c.id}
                    onClick={() => {
                      hapticSelect()
                      navigate(c.to)
                    }}
                  >
                    {c.kind === 'terminal' ? '🖥️' : '🛠️'} {c.title}
                  </SecondaryButton>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

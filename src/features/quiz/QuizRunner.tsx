import { useMemo, useState } from 'react'
import { itemById } from '@/curriculum/items'
import { skillLabel } from '@/curriculum/skills'
import { gradeItem } from '@/engine/quizGrade'
import { useProgress } from '@/store/progress'
import { Card, Pill, PrimaryButton, SecondaryButton, DocRefLink, ProgressBar } from '@/ui/common'
import { hapticSuccess, hapticFailure } from '@/lib/haptics'
import type { Item } from '@/curriculum/types'

function shuffledIndices(n: number, seed: string): number[] {
  // 문항 id를 시드로 쓰는 결정론적 셔플 — 같은 문항은 매번 같은 순서로 섞여 테스트하기 쉽다.
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const idx = Array.from({ length: n }, (_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0
    const j = h % (i + 1)
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx
}

interface QuizRunnerProps {
  itemIds: string[]
  onFinish: (result: { correct: number; total: number }) => void
}

export function QuizRunner({ itemIds, onFinish }: QuizRunnerProps) {
  const recordItemAttempt = useProgress((s) => s.recordItemAttempt)
  const [step, setStep] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)

  const items = useMemo(() => itemIds.map((id) => itemById.get(id)).filter((i): i is Item => !!i), [itemIds])
  const item = items[step]

  if (!item) return <p className="text-sm text-[var(--text-dim)]">이 모듈에는 아직 퀴즈 문항이 없습니다.</p>

  const handleAnswered = (correct: boolean) => {
    setWasCorrect(correct)
    setRevealed(true)
    setCorrectCount((c) => c + (correct ? 1 : 0))
    recordItemAttempt(item.id, item.difficulty, correct)
    if (correct) hapticSuccess()
    else hapticFailure()
  }

  const handleNext = () => {
    setRevealed(false)
    if (step + 1 >= items.length) {
      onFinish({ correct: correctCount, total: items.length })
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-[var(--text-dim)] mb-2">
        <span>
          {step + 1} / {items.length}
        </span>
        <span>정답 {correctCount}개</span>
      </div>
      <ProgressBar value={step} max={items.length} />

      <Card className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Pill>난이도 {item.difficulty}</Pill>
          {item.skills.slice(0, 2).map((s) => (
            <Pill key={s} tone="accent">
              {skillLabel(s)}
            </Pill>
          ))}
        </div>

        <p className="font-medium mb-4">{item.stem}</p>

        {!revealed ? (
          // key로 문항이 바뀔 때마다 완전히 새로 마운트해, mc/multi/order가 서로 다른 모양의
          // useState를 쓰더라도 이전 문항의 훅 상태가 새 문항에 새어 들어가지 않게 한다.
          <ItemAnswerForm key={item.id} item={item} onAnswered={handleAnswered} />
        ) : (
          <div>
            <p className={`font-medium ${wasCorrect ? 'text-[var(--good)]' : 'text-[var(--bad)]'}`}>{wasCorrect ? '✓ 정답' : '✗ 오답'}</p>
            <div className="prose-doc text-sm mt-2">{item.explainMd}</div>
            <div className="mt-3">
              <DocRefLink docRef={item.docRef} />
            </div>
            <div className="mt-4">
              <PrimaryButton onClick={handleNext}>{step + 1 >= items.length ? '결과 보기' : '다음 문항 →'}</PrimaryButton>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function ItemAnswerForm({ item, onAnswered }: { item: Item; onAnswered: (correct: boolean) => void }) {
  // 세 가지 훅을 항상 무조건 호출한다 (rules-of-hooks) — item.type에 따라 그중 하나만 실제로 쓰인다.
  // 부모가 문항마다 key={item.id}로 이 컴포넌트를 재마운트시키므로 매 문항 깨끗한 상태로 시작한다.
  const [selected, setSelected] = useState<number | null>(null)
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set())
  const [order, setOrder] = useState<number[]>(() => (item.type === 'order' ? shuffledIndices(item.choices.length, item.id) : []))

  if (item.type === 'mc' || item.type === 'cloze') {
    return (
      <div>
        <div className="flex flex-col gap-2">
          {item.choices.map((choice, i) => (
            <label key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${selected === i ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)]'}`}>
              <input type="radio" name="mc" checked={selected === i} onChange={() => setSelected(i)} className="accent-[var(--accent)]" />
              {choice}
            </label>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton disabled={selected === null} onClick={() => onAnswered(gradeItem(item, selected as number))}>
            제출
          </PrimaryButton>
        </div>
      </div>
    )
  }

  if (item.type === 'multi') {
    const toggle = (i: number) =>
      setMultiSelected((prev) => {
        const next = new Set(prev)
        if (next.has(i)) next.delete(i)
        else next.add(i)
        return next
      })
    return (
      <div>
        <p className="text-xs text-[var(--text-dim)] mb-2">여러 개를 고를 수 있습니다.</p>
        <div className="flex flex-col gap-2">
          {item.choices.map((choice, i) => (
            <label key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${multiSelected.has(i) ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)]'}`}>
              <input type="checkbox" checked={multiSelected.has(i)} onChange={() => toggle(i)} className="accent-[var(--accent)]" />
              {choice}
            </label>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton disabled={multiSelected.size === 0} onClick={() => onAnswered(gradeItem(item, [...multiSelected]))}>
            제출
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // order
  const move = (pos: number, dir: -1 | 1) => {
    setOrder((prev) => {
      const next = [...prev]
      const target = pos + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[pos], next[target]] = [next[target], next[pos]]
      return next
    })
  }

  return (
    <div>
      <p className="text-xs text-[var(--text-dim)] mb-2">화살표로 올바른 순서로 재배열하세요.</p>
      <div className="flex flex-col gap-2">
        {order.map((origIdx, pos) => (
          <div key={origIdx} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] text-sm">
            <span className="text-[var(--text-dim)] w-5">{pos + 1}.</span>
            <span className="flex-1">{item.choices[origIdx]}</span>
            <button type="button" onClick={() => move(pos, -1)} disabled={pos === 0} className="disabled:opacity-30 px-1">
              ↑
            </button>
            <button type="button" onClick={() => move(pos, 1)} disabled={pos === order.length - 1} className="disabled:opacity-30 px-1">
              ↓
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <PrimaryButton onClick={() => onAnswered(gradeItem(item, order))}>제출</PrimaryButton>
      </div>
    </div>
  )
}

export function QuizSummary({ correct, total, onRestart, retryLabel = '다시 풀기' }: { correct: number; total: number; onRestart?: () => void; retryLabel?: string }) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
  return (
    <Card>
      <p className="text-lg font-semibold mb-1">결과: {pct}%</p>
      <p className="text-sm text-[var(--text-dim)] mb-4">
        {total}문항 중 {correct}개 정답
      </p>
      {onRestart && <SecondaryButton onClick={onRestart}>{retryLabel}</SecondaryButton>}
    </Card>
  )
}

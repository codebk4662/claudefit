/**
 * SM-2 축약형 간격 반복(SRS). 문항(Item)과 실습(Lab) 모두 같은 카드로 취급한다.
 */

const DAY_MS = 24 * 60 * 60 * 1000
const STEPS_DAYS = [1, 3, 7, 16, 35]

export interface SrsCard {
  ease: number // 1.3 ~ 2.8
  intervalDays: number
  dueAt: number // epoch ms
  reps: number
  lastResult: 'correct' | 'incorrect' | null
}

export function initialSrsCard(now = Date.now()): SrsCard {
  return { ease: 2.5, intervalDays: 0, dueAt: now, reps: 0, lastResult: null }
}

export function reviewCard(card: SrsCard, correct: boolean, now = Date.now()): SrsCard {
  if (!correct) {
    return {
      ease: Math.max(1.3, round2(card.ease - 0.2)),
      intervalDays: 1,
      dueAt: now + 1 * DAY_MS,
      reps: 0,
      lastResult: 'incorrect',
    }
  }
  const nextReps = card.reps + 1
  const baseDays = STEPS_DAYS[Math.min(nextReps - 1, STEPS_DAYS.length - 1)]
  const intervalDays = round2(baseDays * (card.ease / 2.5))
  const ease = Math.min(2.8, round2(card.ease + 0.05))
  return { ease, intervalDays, dueAt: now + intervalDays * DAY_MS, reps: nextReps, lastResult: 'correct' }
}

export function isDue(card: SrsCard, now = Date.now()): boolean {
  return card.dueAt <= now
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

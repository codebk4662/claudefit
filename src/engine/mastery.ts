/**
 * 스킬별 숙련도(0~100) 계산.
 * mastery = 0.6 * 퀴즈 정답률(최근·난이도 가중) + 0.4 * 실습 통과율
 */

export interface AttemptRecord {
  correct: boolean
  difficulty: 1 | 2 | 3
  at: number
}

export interface LabAttemptRecord {
  passed: boolean
  at: number
}

/** 최근 기록에 더 큰 가중치 + 난이도가 높을수록 가중치 증가. 결과는 0~1. */
export function weightedAccuracy(attempts: AttemptRecord[], recentWindow = 8): number {
  if (attempts.length === 0) return 0
  const recent = attempts.slice(-recentWindow)
  let num = 0
  let denom = 0
  recent.forEach((a, i) => {
    const recencyWeight = Math.pow(1.15, i) // 배열 뒤쪽(최근)일수록 큼
    const w = recencyWeight * a.difficulty
    num += w * (a.correct ? 1 : 0)
    denom += w
  })
  return denom === 0 ? 0 : num / denom
}

export function labPassRate(attempts: LabAttemptRecord[], recentWindow = 5): number {
  if (attempts.length === 0) return 0
  const recent = attempts.slice(-recentWindow)
  const passed = recent.filter((a) => a.passed).length
  return passed / recent.length
}

export interface MasteryInputs {
  quizAttempts: AttemptRecord[]
  labAttempts: LabAttemptRecord[]
}

/** 둘 중 하나가 비어 있으면 있는 쪽만으로 계산한다 (실습이 없는 스킬도 점수가 나오도록) */
export function computeSkillMastery({ quizAttempts, labAttempts }: MasteryInputs): number {
  const hasQuiz = quizAttempts.length > 0
  const hasLab = labAttempts.length > 0
  if (!hasQuiz && !hasLab) return 0

  const quizScore = weightedAccuracy(quizAttempts)
  const labScore = labPassRate(labAttempts)

  if (hasQuiz && hasLab) return Math.round((0.6 * quizScore + 0.4 * labScore) * 100)
  if (hasQuiz) return Math.round(quizScore * 100)
  return Math.round(labScore * 100)
}

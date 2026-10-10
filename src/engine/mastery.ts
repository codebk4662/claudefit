/**
 * 스킬별 숙련도(0~100) = 완료율.
 * 그 스킬에 연결된 퀴즈 문항 + 실습 각각에 대해, "가장 최근 시도"가 정답/통과였는지만 본다.
 * 즉 관련 문항·실습을 한 번씩 맞혀서 "진행"하면 바로 100%에 도달해 성취감을 주고,
 * SRS 간격 반복(scheduler.ts)이 그 뒤로도 계속 복습을 유도하는 역할을 별도로 맡는다.
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

function isLatestSuccess<T extends { at: number }>(attempts: T[], wasSuccess: (a: T) => boolean): boolean {
  if (attempts.length === 0) return false
  const latest = attempts.reduce((a, b) => (b.at >= a.at ? b : a))
  return wasSuccess(latest)
}

export interface MasteryInputs {
  /** 스킬에 연결된 퀴즈 문항 각각의 시도 기록 (한 번도 안 풀었으면 빈 배열) */
  quizAttemptsByItem: AttemptRecord[][]
  /** 스킬에 연결된 실습 각각의 시도 기록 */
  labAttemptsByLab: LabAttemptRecord[][]
}

export function computeSkillMastery({ quizAttemptsByItem, labAttemptsByLab }: MasteryInputs): number {
  const total = quizAttemptsByItem.length + labAttemptsByLab.length
  if (total === 0) return 0

  const masteredQuiz = quizAttemptsByItem.filter((attempts) => isLatestSuccess(attempts, (a) => a.correct)).length
  const masteredLab = labAttemptsByLab.filter((attempts) => isLatestSuccess(attempts, (a) => a.passed)).length

  return Math.round(((masteredQuiz + masteredLab) / total) * 100)
}

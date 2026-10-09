import type { DocRef, SkillId } from '@/curriculum/types'

export interface CheckResult {
  pass: boolean
  message: string
}

export interface ForgeCheck {
  id: string
  description: string
  /** language:'json'이면 parsed는 JSON.parse 결과, 'markdown'이면 parsed===source(raw) */
  run: (parsed: unknown, source: string) => CheckResult
  /** 실패 시 참고할 원문 위치 (judge UI가 링크로 표시) */
  docRef?: DocRef
}

export type ForgeLanguage = 'json' | 'markdown'

export interface ForgeTask {
  id: string
  title: string
  targetFile: string
  language: ForgeLanguage
  promptMd: string
  template: string
  checks: ForgeCheck[]
  skills: SkillId[]
  docRefs: DocRef[]
  /** 모범답안 — 막혔을 때 "정답 보기"로 노출, diff 비교용 */
  sampleSolution: string
}

export interface GradeOutcome {
  passed: boolean
  parseError?: string
  results: CheckResult[]
}

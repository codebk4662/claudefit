import type { DocRef, SkillId } from '@/curriculum/types'
import type { ParsedInput } from './parser'
import type { Vfs } from './vfs'
import type { PermissionMode } from './runtime'

export interface AcceptRule {
  bash?: RegExp
  slash?: string
  argsMatch?: RegExp
  prompt?: RegExp
  mention?: string
  key?: string
  /** 아래 중 하나라도 통과하면 성공 (여러 경로로 같은 목표를 달성할 수 있을 때) */
  any?: AcceptRule[]
}

export interface JudgeContext {
  mode: 'shell' | 'claude'
  permissionMode: PermissionMode
}

export function matchAccept(rule: AcceptRule, input: ParsedInput, ctx: JudgeContext): boolean {
  if (rule.any) return rule.any.some((r) => matchAccept(r, input, ctx))
  if (rule.bash) return input.kind === 'bash' && rule.bash.test(input.command)
  if (rule.slash) {
    if (input.kind !== 'slash' || input.name !== rule.slash) return false
    return rule.argsMatch ? rule.argsMatch.test(input.args) : true
  }
  if (rule.prompt) return input.kind === 'prompt' && rule.prompt.test(input.text)
  if (rule.mention) return input.kind === 'prompt' && input.mentions.includes(rule.mention)
  if (rule.key) return input.kind === 'key' && input.key === rule.key
  return false
}

export interface ScenarioStep {
  id: string
  /** 사용자에게 보여주는 "지금 할 일" */
  goal: string
  /** 틀렸을 때 1회, 2회 실패 후 순서대로 노출되는 힌트 */
  hints: string[]
  accept: AcceptRule
  /** 성공 시 vfs에 적용할 부수효과 (예: 파일 생성) */
  effect?: (vfs: Vfs) => void
  /** 성공 시 트랜스크립트에 출력할 가짜 시스템 응답 */
  systemOutput: string[]
}

export interface Scenario {
  id: string
  title: string
  description: string
  skills: SkillId[]
  docRefs: DocRef[]
  initialFiles: Record<string, string>
  startMode: 'shell' | 'claude'
  steps: ScenarioStep[]
}

export interface StepJudgement {
  passed: boolean
  hint?: string
}

/** attemptCount: 이 단계에서 지금까지 실패한 횟수 (0부터 시작) */
export function judgeStep(step: ScenarioStep, input: ParsedInput, ctx: JudgeContext, attemptCount: number): StepJudgement {
  const passed = matchAccept(step.accept, input, ctx)
  if (passed) return { passed }
  const hint = step.hints[Math.min(attemptCount, step.hints.length - 1)]
  return { passed, hint }
}

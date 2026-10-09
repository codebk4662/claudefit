/**
 * 커리큘럼 데이터 모델.
 *
 * 설계 원칙:
 * - 모든 Item/Lab은 최소 1개의 SkillId를 가져야 한다 (숙련도·SRS·약점 드릴의 근거).
 * - DocRef는 반드시 scripts/check-refs.mjs 로 검증 가능해야 한다 (slug + 선택적 anchor).
 */

export type TrackId = 't1-basics' | 't2-daily' | 't3-customize' | 't4-automation' | 't5-mastery'

/** 문서(원문) 참조. slug 는 content/docs-index.json 의 키와 일치해야 한다. */
export interface DocRef {
  slug: string
  anchor?: string
  label?: string
}

export type SkillId =
  // T1
  | 'basics.surfaces'
  | 'basics.install'
  | 'basics.first-session'
  | 'basics.how-it-works'
  | 'basics.interactive-mode'
  | 'basics.context-window'
  // T2
  | 'daily.file-refs'
  | 'daily.permission-modes'
  | 'daily.permission-rules'
  | 'daily.sessions'
  | 'daily.checkpointing'
  | 'daily.memory'
  | 'daily.git-flow'
  | 'daily.code-review'
  | 'daily.workflows'
  // T3
  | 'customize.settings'
  | 'customize.model-effort'
  | 'customize.output-style'
  | 'customize.skills'
  | 'customize.subagents'
  | 'customize.mcp'
  | 'customize.hooks-basics'
  | 'customize.hooks-advanced'
  // T4
  | 'automation.cli-headless'
  | 'automation.scripting'
  | 'automation.parallel'
  | 'automation.agent-view'
  | 'automation.dynamic-workflows'
  | 'automation.scheduling'
  | 'automation.ci'
  // T5
  | 'mastery.prompt-caching'
  | 'mastery.large-codebases'
  | 'mastery.costs'
  | 'mastery.sandboxing'
  | 'mastery.troubleshooting'
  | 'mastery.best-practices'
  | 'mastery.plugins'

export interface Module {
  id: string
  trackId: TrackId
  order: number
  title: string
  /** "~할 수 있다" 형태의 학습 목표 3~5개 */
  objectives: string[]
  /** 직접 작성한 한국어 핵심 요약 (마크다운, 5~15줄 권장) */
  summaryMd: string
  docRefs: DocRef[]
  skills: SkillId[]
  itemIds: string[]
  labIds: string[]
  /** 선수 모듈 id (추천 순서/잠금 표시에 사용, 하드 잠금은 아님) */
  prereqs: string[]
  estMinutes: number
}

export type ItemType = 'mc' | 'multi' | 'cloze' | 'order'

interface ItemBase {
  id: string
  skills: SkillId[]
  difficulty: 1 | 2 | 3
  stem: string
  explainMd: string
  docRef: DocRef
}

export interface McItem extends ItemBase {
  type: 'mc'
  choices: string[]
  answer: number
}

export interface MultiItem extends ItemBase {
  type: 'multi'
  choices: string[]
  answer: number[]
}

/** 빈칸 채우기: 선택지 중 정답 문자열을 고른다 (자유 입력 대신 선택형으로 자동 채점 보장) */
export interface ClozeItem extends ItemBase {
  type: 'cloze'
  choices: string[]
  answer: number
}

/** 올바른 순서 배열 (예: 세션 시작 절차) */
export interface OrderItem extends ItemBase {
  type: 'order'
  choices: string[]
  /** choices의 올바른 순서를 나타내는 인덱스 배열 */
  answer: number[]
}

export type Item = McItem | MultiItem | ClozeItem | OrderItem

export type LabKind = 'terminal' | 'forge'

export interface LabRef {
  kind: LabKind
  id: string
}

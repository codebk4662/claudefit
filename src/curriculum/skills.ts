import type { SkillId } from './types'

export interface SkillMeta {
  id: SkillId
  label: string
  group: string
}

const g = (group: string, entries: [SkillId, string][]): SkillMeta[] =>
  entries.map(([id, label]) => ({ id, label, group }))

export const SKILLS: SkillMeta[] = [
  ...g('입문', [
    ['basics.surfaces', '실행 환경(터미널/IDE/데스크톱/웹) 선택'],
    ['basics.install', '설치·로그인·진단'],
    ['basics.first-session', '첫 세션 진행'],
    ['basics.how-it-works', '작동 원리'],
    ['basics.interactive-mode', '대화형 모드·단축키'],
    ['basics.context-window', '컨텍스트 윈도우 기초'],
  ]),
  ...g('일상 사용', [
    ['daily.file-refs', '파일·이미지 참조(@mention)'],
    ['daily.permission-modes', '권한 모드 전환'],
    ['daily.permission-rules', '권한 규칙 설정'],
    ['daily.sessions', '세션 관리(resume/branch/fork/clear)'],
    ['daily.checkpointing', '체크포인트·되감기'],
    ['daily.memory', 'CLAUDE.md·자동 메모리'],
    ['daily.git-flow', '커밋·PR 작업'],
    ['daily.code-review', '코드·보안 리뷰'],
    ['daily.workflows', '일반 워크플로 패턴'],
  ]),
  ...g('커스터마이즈', [
    ['customize.settings', '설정 계층·settings.json'],
    ['customize.model-effort', '모델·effort·fast mode'],
    ['customize.output-style', '출력 스타일·statusline'],
    ['customize.skills', '스킬 작성'],
    ['customize.subagents', '서브에이전트'],
    ['customize.mcp', 'MCP 연결'],
    ['customize.hooks-basics', '훅 기초'],
    ['customize.hooks-advanced', '훅 심화(권한 제어)'],
  ]),
  ...g('자동화·병렬', [
    ['automation.cli-headless', 'CLI·headless 실행'],
    ['automation.scripting', '파이프·스크립트 자동화'],
    ['automation.parallel', '병렬 실행·worktree'],
    ['automation.agent-view', '에이전트 뷰·백그라운드 세션'],
    ['automation.dynamic-workflows', '동적 워크플로'],
    ['automation.scheduling', '스케줄(/loop·routines)'],
    ['automation.ci', 'GitHub Actions 연동'],
  ]),
  ...g('숙련·운영', [
    ['mastery.prompt-caching', '컨텍스트 경제학·프롬프트 캐싱'],
    ['mastery.large-codebases', '대규모 코드베이스'],
    ['mastery.costs', '비용·사용량'],
    ['mastery.sandboxing', '샌드박스·보안'],
    ['mastery.troubleshooting', '문제해결·에러'],
    ['mastery.best-practices', '베스트 프랙티스'],
    ['mastery.plugins', '플러그인 입문'],
  ]),
]

export const skillLabel = (id: SkillId): string =>
  SKILLS.find((s) => s.id === id)?.label ?? id

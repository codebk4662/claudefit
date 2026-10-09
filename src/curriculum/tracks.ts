import type { TrackId } from './types'

export interface Track {
  id: TrackId
  order: number
  title: string
  description: string
}

export const TRACKS: Track[] = [
  {
    id: 't1-basics',
    order: 1,
    title: '입문',
    description: 'Claude Code가 무엇이고 어떻게 작동하는지, 첫 세션을 어떻게 시작하는지.',
  },
  {
    id: 't2-daily',
    order: 2,
    title: '일상 사용',
    description: '권한 모드, 메모리, 세션 관리, 커밋·리뷰 — 매일 쓰는 기능.',
  },
  {
    id: 't3-customize',
    order: 3,
    title: '커스터마이즈',
    description: '설정 파일, 모델/effort, 스킬, 서브에이전트, MCP, 훅으로 Claude Code를 내 워크플로에 맞춘다.',
  },
  {
    id: 't4-automation',
    order: 4,
    title: '자동화·병렬',
    description: 'CLI/headless, 병렬 에이전트, 동적 워크플로, 스케줄, CI 연동.',
  },
  {
    id: 't5-mastery',
    order: 5,
    title: '숙련·운영',
    description: '컨텍스트 경제학, 비용, 샌드박스, 트러블슈팅, 베스트 프랙티스.',
  },
]

export const trackById = (id: TrackId): Track => {
  const t = TRACKS.find((t) => t.id === id)
  if (!t) throw new Error(`unknown track: ${id}`)
  return t
}

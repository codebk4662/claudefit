import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SkillId } from '@/curriculum/types'
import { initialSrsCard, reviewCard, type SrsCard } from '@/engine/srs'
import { computeSkillMastery, type AttemptRecord, type LabAttemptRecord } from '@/engine/mastery'
import { ALL_ITEMS } from '@/curriculum/items'
import { TERMINAL_SCENARIOS } from '@/curriculum/labs/terminal/scenarios'
import { FORGE_TASKS } from '@/curriculum/labs/forge/tasks'
import { SKILLS } from '@/curriculum/skills'

export type ModuleStatus = 'not-started' | 'learning' | 'done'

interface StreakState {
  count: number
  lastDay: string | null // YYYY-MM-DD
}

interface ProgressState {
  moduleStatus: Record<string, ModuleStatus>
  itemAttempts: Record<string, AttemptRecord[]>
  labAttempts: Record<string, LabAttemptRecord[]>
  srs: Record<string, SrsCard>
  streak: StreakState
  /** 원문 라이브러리에서 한 번이라도 연 문서 slug 집합 — 읽음 표시용 */
  readDocSlugs: Record<string, true>

  markModuleStatus: (moduleId: string, status: ModuleStatus) => void
  /** skills는 mastery 계산에 쓰이지 않고(ALL_ITEMS에서 역조회) 호출부 타입 체크용으로만 받는다. */
  recordItemAttempt: (itemId: string, difficulty: 1 | 2 | 3, correct: boolean) => void
  recordLabAttempt: (labId: string, passed: boolean) => void
  markDocRead: (slug: string) => void
  bumpStreak: () => void
  resetAll: () => void
  exportJson: () => string
  importJson: (json: string) => { ok: boolean; error?: string }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const EXPORT_VERSION = 1

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      moduleStatus: {},
      itemAttempts: {},
      labAttempts: {},
      srs: {},
      streak: { count: 0, lastDay: null },
      readDocSlugs: {},

      markModuleStatus: (moduleId, status) => set((s) => ({ moduleStatus: { ...s.moduleStatus, [moduleId]: status } })),

      markDocRead: (slug) => set((s) => (s.readDocSlugs[slug] ? s : { readDocSlugs: { ...s.readDocSlugs, [slug]: true } })),

      recordItemAttempt: (itemId, difficulty, correct) => {
        set((s) => {
          const prev = s.itemAttempts[itemId] ?? []
          const next = [...prev, { correct, difficulty, at: Date.now() }]
          const prevCard = s.srs[itemId] ?? initialSrsCard()
          const nextCard = reviewCard(prevCard, correct)
          return {
            itemAttempts: { ...s.itemAttempts, [itemId]: next },
            srs: { ...s.srs, [itemId]: nextCard },
          }
        })
        get().bumpStreak()
      },

      recordLabAttempt: (labId, passed) => {
        set((s) => {
          const prev = s.labAttempts[labId] ?? []
          const next = [...prev, { passed, at: Date.now() }]
          const prevCard = s.srs[labId] ?? initialSrsCard()
          const nextCard = reviewCard(prevCard, passed)
          return {
            labAttempts: { ...s.labAttempts, [labId]: next },
            srs: { ...s.srs, [labId]: nextCard },
          }
        })
        get().bumpStreak()
      },

      bumpStreak: () => {
        set((s) => {
          const t = today()
          if (s.streak.lastDay === t) return s
          const wasYesterday = s.streak.lastDay ? isYesterday(s.streak.lastDay, t) : false
          return { streak: { count: wasYesterday ? s.streak.count + 1 : 1, lastDay: t } }
        })
      },

      resetAll: () => set({ moduleStatus: {}, itemAttempts: {}, labAttempts: {}, srs: {}, streak: { count: 0, lastDay: null }, readDocSlugs: {} }),

      exportJson: () => {
        const { moduleStatus, itemAttempts, labAttempts, srs, streak, readDocSlugs } = get()
        return JSON.stringify({ version: EXPORT_VERSION, exportedAt: new Date().toISOString(), moduleStatus, itemAttempts, labAttempts, srs, streak, readDocSlugs }, null, 2)
      },

      importJson: (json) => {
        try {
          const data = JSON.parse(json)
          if (typeof data !== 'object' || data === null) return { ok: false, error: '유효한 JSON 객체가 아닙니다' }
          set({
            moduleStatus: data.moduleStatus ?? {},
            itemAttempts: data.itemAttempts ?? {},
            labAttempts: data.labAttempts ?? {},
            srs: data.srs ?? {},
            streak: data.streak ?? { count: 0, lastDay: null },
            readDocSlugs: data.readDocSlugs ?? {},
          })
          return { ok: true }
        } catch (e) {
          return { ok: false, error: (e as Error).message }
        }
      },
    }),
    { name: 'cc-dojo-progress' },
  ),
)

function isYesterday(dayStr: string, todayStr: string): boolean {
  const d = new Date(dayStr + 'T00:00:00Z')
  const t = new Date(todayStr + 'T00:00:00Z')
  return t.getTime() - d.getTime() === 24 * 60 * 60 * 1000
}

/**
 * 스킬별 숙련도(0~100) = 완료율. 그 스킬에 연결된 모든 문항·실습 각각의 "최근 시도가 정답/통과였는가"를 모아
 * engine/mastery.ts로 넘긴다 — 한 번도 안 푼 항목도 빈 배열로 포함해야 분모(전체 개수)가 정확해진다.
 */
export function computeMasteryBySkill(state: Pick<ProgressState, 'itemAttempts' | 'labAttempts'>): Record<SkillId, number> {
  const quizBySkill = new Map<SkillId, AttemptRecord[][]>()
  for (const item of ALL_ITEMS) {
    for (const skill of item.skills) {
      const arr = quizBySkill.get(skill) ?? []
      arr.push(state.itemAttempts[item.id] ?? [])
      quizBySkill.set(skill, arr)
    }
  }

  const labBySkill = new Map<SkillId, LabAttemptRecord[][]>()
  for (const lab of [...TERMINAL_SCENARIOS, ...FORGE_TASKS]) {
    for (const skill of lab.skills) {
      const arr = labBySkill.get(skill) ?? []
      arr.push(state.labAttempts[lab.id] ?? [])
      labBySkill.set(skill, arr)
    }
  }

  const out: Partial<Record<SkillId, number>> = {}
  for (const skillMeta of SKILLS) {
    out[skillMeta.id] = computeSkillMastery({
      quizAttemptsByItem: quizBySkill.get(skillMeta.id) ?? [],
      labAttemptsByLab: labBySkill.get(skillMeta.id) ?? [],
    })
  }
  return out as Record<SkillId, number>
}

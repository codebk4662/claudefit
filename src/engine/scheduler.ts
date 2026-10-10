import type { Item, LabKind, SkillId } from '@/curriculum/types'
import { isDue, type SrsCard } from './srs'

export interface DrillPickParams {
  allItems: Item[]
  srsByItemId: Record<string, SrsCard>
  masteryBySkill: Partial<Record<SkillId, number>>
  limit?: number
  now?: number
}

function minMastery(skills: SkillId[], masteryBySkill: Partial<Record<SkillId, number>>): number {
  if (skills.length === 0) return 100
  return Math.min(...skills.map((s) => masteryBySkill[s] ?? 0))
}

interface HasSkills {
  id: string
  skills: SkillId[]
}

/**
 * 1순위 — SRS상 복습 기한이 지난 것 (약한 스킬 먼저)
 * 2순위 — 아직 한 번도 안 한 것 중 약점 스킬 우선
 * 문항(Item)과 실습(Lab) 모두 같은 SRS 카드를 쓰므로 이 로직을 공유한다.
 */
function pickDueOrFresh<T extends HasSkills>(pool: T[], srsById: Record<string, SrsCard>, masteryBySkill: Partial<Record<SkillId, number>>, limit: number, now: number): T[] {
  const due: T[] = []
  const fresh: T[] = []

  for (const entry of pool) {
    const card = srsById[entry.id]
    if (!card) {
      fresh.push(entry)
    } else if (isDue(card, now)) {
      due.push(entry)
    }
  }

  const byWeakness = (a: T, b: T) => minMastery(a.skills, masteryBySkill) - minMastery(b.skills, masteryBySkill)
  due.sort(byWeakness)
  fresh.sort(byWeakness)

  const picked: T[] = []
  const seen = new Set<string>()
  for (const entry of [...due, ...fresh]) {
    if (picked.length >= limit) break
    if (seen.has(entry.id)) continue
    seen.add(entry.id)
    picked.push(entry)
  }
  return picked
}

/**
 * 데일리 드릴 문항을 고른다:
 * 1순위 — SRS상 복습 기한이 지난 문항 (약한 스킬 먼저)
 * 2순위 — 아직 한 번도 풀지 않은 문항 중 약점 스킬 우선
 */
export function pickDailyDrillItems({ allItems, srsByItemId, masteryBySkill, limit = 10, now = Date.now() }: DrillPickParams): string[] {
  return pickDueOrFresh(allItems, srsByItemId, masteryBySkill, limit, now).map((i) => i.id)
}

export interface LabPoolEntry extends HasSkills {
  kind: LabKind
}

export interface DrillLabPick {
  kind: LabKind
  id: string
}

export interface DrillLabPickParams {
  allLabs: LabPoolEntry[]
  srsByItemId: Record<string, SrsCard>
  masteryBySkill: Partial<Record<SkillId, number>>
  limit?: number
  now?: number
}

/** 데일리 드릴에 섞을 실습(터미널 시나리오 + ConfigForge 과제)을 같은 규칙으로 고른다. */
export function pickDailyDrillLabs({ allLabs, srsByItemId, masteryBySkill, limit = 2, now = Date.now() }: DrillLabPickParams): DrillLabPick[] {
  return pickDueOrFresh(allLabs, srsByItemId, masteryBySkill, limit, now).map((l) => ({ kind: l.kind, id: l.id }))
}

import type { Item, SkillId } from '@/curriculum/types'
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

/**
 * 데일리 드릴 문항을 고른다:
 * 1순위 — SRS상 복습 기한이 지난 문항 (약한 스킬 먼저)
 * 2순위 — 아직 한 번도 풀지 않은 문항 중 약점 스킬 우선
 */
export function pickDailyDrillItems({ allItems, srsByItemId, masteryBySkill, limit = 10, now = Date.now() }: DrillPickParams): string[] {
  const due: Item[] = []
  const fresh: Item[] = []

  for (const item of allItems) {
    const card = srsByItemId[item.id]
    if (!card) {
      fresh.push(item)
    } else if (isDue(card, now)) {
      due.push(item)
    }
  }

  const byWeakness = (a: Item, b: Item) => minMastery(a.skills, masteryBySkill) - minMastery(b.skills, masteryBySkill)

  due.sort(byWeakness)
  fresh.sort(byWeakness)

  const picked: string[] = []
  const seen = new Set<string>()

  for (const item of [...due, ...fresh]) {
    if (picked.length >= limit) break
    if (seen.has(item.id)) continue
    seen.add(item.id)
    picked.push(item.id)
  }

  return picked
}

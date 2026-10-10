import { describe, it, expect } from 'vitest'
import { initialSrsCard, reviewCard, isDue } from '@/engine/srs'
import { computeSkillMastery } from '@/engine/mastery'
import { pickDailyDrillItems } from '@/engine/scheduler'
import type { Item } from '@/curriculum/types'

describe('srs', () => {
  it('정답이면 간격이 늘어나고 오답이면 1일로 리셋된다', () => {
    const now = Date.now()
    let card = initialSrsCard(now)
    card = reviewCard(card, true, now)
    expect(card.intervalDays).toBeCloseTo(1, 1)
    card = reviewCard(card, true, now)
    expect(card.intervalDays).toBeCloseTo(3, 0) // ease가 조금씩 올라가므로 정확히 3은 아님
    const beforeFail = card.ease
    card = reviewCard(card, false, now)
    expect(card.intervalDays).toBe(1)
    expect(card.ease).toBeLessThan(beforeFail)
    expect(card.reps).toBe(0)
  })

  it('isDue는 dueAt 기준으로 판정한다', () => {
    const now = Date.now()
    const card = initialSrsCard(now)
    expect(isDue(card, now)).toBe(true)
    expect(isDue(card, now - 1)).toBe(false)
  })
})

describe('mastery', () => {
  it('연결된 문항·실습을 모두 최근 시도 기준으로 맞혔으면 100%다', () => {
    const score = computeSkillMastery({
      quizAttemptsByItem: [[{ correct: true, difficulty: 2, at: 1 }]],
      labAttemptsByLab: [[{ passed: true, at: 1 }]],
    })
    expect(score).toBe(100)
  })

  it('가장 최근 시도만 본다 — 오답 뒤에 정답을 내면 그 문항은 완료로 친다', () => {
    const score = computeSkillMastery({
      quizAttemptsByItem: [
        [
          { correct: false, difficulty: 2, at: 1 },
          { correct: true, difficulty: 2, at: 2 },
        ],
      ],
      labAttemptsByLab: [],
    })
    expect(score).toBe(100)
  })

  it('일부만 완료했으면 비율만큼만 채워진다', () => {
    const score = computeSkillMastery({
      quizAttemptsByItem: [[{ correct: true, difficulty: 2, at: 1 }], []],
      labAttemptsByLab: [[{ passed: false, at: 1 }]],
    })
    expect(score).toBe(33) // 연결된 문항2+실습1=3개 중 1개만 최근 시도가 성공 → round(1/3*100)
  })

  it('연결된 문항·실습이 하나도 없으면 0이다', () => {
    expect(computeSkillMastery({ quizAttemptsByItem: [], labAttemptsByLab: [] })).toBe(0)
  })
})

describe('pickDailyDrillItems', () => {
  const items: Item[] = [
    { id: 'i1', type: 'mc', skills: ['customize.hooks-basics'], difficulty: 1, stem: '', choices: ['a', 'b'], answer: 0, explainMd: '', docRef: { slug: 'hooks' } },
    { id: 'i2', type: 'mc', skills: ['customize.mcp'], difficulty: 1, stem: '', choices: ['a', 'b'], answer: 0, explainMd: '', docRef: { slug: 'mcp' } },
    { id: 'i3', type: 'mc', skills: ['customize.hooks-basics'], difficulty: 2, stem: '', choices: ['a', 'b'], answer: 0, explainMd: '', docRef: { slug: 'hooks' } },
  ]

  it('기한이 지난 복습 카드를 우선 포함한다', () => {
    const now = Date.now()
    const dueCard = { ease: 2.5, intervalDays: 1, dueAt: now - 1000, reps: 1, lastResult: 'correct' as const }
    const picked = pickDailyDrillItems({
      allItems: items,
      srsByItemId: { i2: dueCard },
      masteryBySkill: {},
      limit: 1,
      now,
    })
    expect(picked).toEqual(['i2'])
  })

  it('약한 스킬의 신규 문항을 우선 채운다', () => {
    const picked = pickDailyDrillItems({
      allItems: items,
      srsByItemId: {},
      masteryBySkill: { 'customize.hooks-basics': 10, 'customize.mcp': 90 },
      limit: 2,
    })
    expect(picked[0]).not.toBe('i2')
  })
})

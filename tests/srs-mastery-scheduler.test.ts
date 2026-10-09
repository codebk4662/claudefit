import { describe, it, expect } from 'vitest'
import { initialSrsCard, reviewCard, isDue } from '@/engine/srs'
import { computeSkillMastery, weightedAccuracy, labPassRate } from '@/engine/mastery'
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
  it('정답률이 높고 최근 기록일수록 가중치가 크다', () => {
    const allCorrect = weightedAccuracy([
      { correct: true, difficulty: 2, at: 1 },
      { correct: true, difficulty: 2, at: 2 },
    ])
    expect(allCorrect).toBe(1)

    const recentWrong = weightedAccuracy([
      { correct: true, difficulty: 2, at: 1 },
      { correct: false, difficulty: 2, at: 2 },
    ])
    const recentRight = weightedAccuracy([
      { correct: false, difficulty: 2, at: 1 },
      { correct: true, difficulty: 2, at: 2 },
    ])
    expect(recentRight).toBeGreaterThan(recentWrong)
  })

  it('퀴즈와 실습을 0.6/0.4로 섞는다', () => {
    const score = computeSkillMastery({
      quizAttempts: [{ correct: true, difficulty: 2, at: 1 }],
      labAttempts: [{ passed: false, at: 1 }],
    })
    expect(score).toBe(60) // 0.6*1 + 0.4*0
  })

  it('한쪽 기록이 없으면 있는 쪽만으로 계산한다', () => {
    expect(computeSkillMastery({ quizAttempts: [], labAttempts: [{ passed: true, at: 1 }] })).toBe(100)
    expect(labPassRate([])).toBe(0)
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

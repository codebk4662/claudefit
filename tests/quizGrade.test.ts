import { describe, it, expect } from 'vitest'
import { gradeItem } from '@/engine/quizGrade'
import type { Item } from '@/curriculum/types'

const base = { id: 'x', skills: [], difficulty: 1 as const, stem: '', explainMd: '', docRef: { slug: 's' } }

describe('gradeItem', () => {
  it('mc: 정확히 일치하는 인덱스만 정답', () => {
    const item: Item = { ...base, type: 'mc', choices: ['a', 'b'], answer: 1 }
    expect(gradeItem(item, 1)).toBe(true)
    expect(gradeItem(item, 0)).toBe(false)
  })

  it('multi: 집합이 같으면 순서 무관하게 정답', () => {
    const item: Item = { ...base, type: 'multi', choices: ['a', 'b', 'c'], answer: [0, 2] }
    expect(gradeItem(item, [2, 0])).toBe(true)
    expect(gradeItem(item, [0, 1])).toBe(false)
    expect(gradeItem(item, [0])).toBe(false)
  })

  it('order: 순서가 정확히 같아야 정답', () => {
    const item: Item = { ...base, type: 'order', choices: ['a', 'b', 'c'], answer: [0, 1, 2] }
    expect(gradeItem(item, [0, 1, 2])).toBe(true)
    expect(gradeItem(item, [1, 0, 2])).toBe(false)
  })
})

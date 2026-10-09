import type { Item } from '@/curriculum/types'

export type QuizResponse = number | number[]

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const sa = [...a].sort((x, y) => x - y)
  const sb = [...b].sort((x, y) => x - y)
  return sa.every((v, i) => v === sb[i])
}

function sameSequence(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/** response 타입은 문항 타입에 맞게 호출부가 보장해야 한다 (mc/cloze: number, multi/order: number[]). */
export function gradeItem(item: Item, response: QuizResponse): boolean {
  switch (item.type) {
    case 'mc':
    case 'cloze':
      return response === item.answer
    case 'multi':
      return Array.isArray(response) && sameSet(response, item.answer)
    case 'order':
      return Array.isArray(response) && sameSequence(response, item.answer)
    default:
      return false
  }
}

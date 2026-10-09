import type { DocRef } from '@/curriculum/types'
import type { ForgeCheck } from './types'

function getPath(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}

/** 지정한 경로에 값이 존재하는지 (타입 무관) */
export function pathExists(path: string[], label: string, docRef?: DocRef): ForgeCheck {
  return {
    id: `exists:${path.join('.')}`,
    description: label,
    docRef,
    run: (parsed) => {
      const v = getPath(parsed, path)
      return { pass: v !== undefined, message: v !== undefined ? `${label} — 확인됨` : `${label} — 찾을 수 없습니다 (경로: ${path.join('.')})` }
    },
  }
}

/** 지정한 경로의 값이 정확히 일치하는지 */
export function pathEquals(path: string[], expected: unknown, label: string, docRef?: DocRef): ForgeCheck {
  return {
    id: `equals:${path.join('.')}`,
    description: label,
    docRef,
    run: (parsed) => {
      const v = getPath(parsed, path)
      const pass = JSON.stringify(v) === JSON.stringify(expected)
      return { pass, message: pass ? `${label} — 일치` : `${label} — 기대값과 다릅니다 (현재: ${JSON.stringify(v)})` }
    },
  }
}

/** 경로가 배열이고, predicate를 만족하는 항목이 하나 이상 있는지 */
export function arrayContains(
  path: string[],
  predicate: (item: unknown) => boolean,
  label: string,
  docRef?: DocRef,
): ForgeCheck {
  return {
    id: `contains:${path.join('.')}`,
    description: label,
    docRef,
    run: (parsed) => {
      const v = getPath(parsed, path)
      if (!Array.isArray(v)) return { pass: false, message: `${label} — 배열이 아닙니다 (경로: ${path.join('.')})` }
      const pass = v.some(predicate)
      return { pass, message: pass ? `${label} — 확인됨` : `${label} — 조건을 만족하는 항목이 없습니다` }
    },
  }
}

/** 문자열(raw source)에 특정 부분문자열/정규식이 포함되는지 — JSON 구조 밖의 자유도 있는 값 검증용 */
export function sourceMatches(pattern: RegExp, label: string, docRef?: DocRef): ForgeCheck {
  return {
    id: `source:${pattern.toString()}`,
    description: label,
    docRef,
    run: (_parsed, source) => {
      const pass = pattern.test(source)
      return { pass, message: pass ? `${label} — 확인됨` : `${label} — 찾지 못했습니다` }
    },
  }
}

/** JSON이 유효한 객체(배열 아님)인지 */
export function isObject(label = '유효한 JSON 객체'): ForgeCheck {
  return {
    id: 'is-object',
    description: label,
    run: (parsed) => {
      const pass = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      return { pass, message: pass ? `${label} — 확인됨` : `${label} — 객체가 아닙니다` }
    },
  }
}

/** 커스텀 조건 — 위 헬퍼로 표현하기 어려운 경우 */
export function custom(id: string, label: string, test: (parsed: unknown, source: string) => boolean, docRef?: DocRef): ForgeCheck {
  return {
    id,
    description: label,
    docRef,
    run: (parsed, source) => {
      const pass = test(parsed, source)
      return { pass, message: pass ? `${label} — 확인됨` : `${label} — 조건을 만족하지 않습니다` }
    },
  }
}

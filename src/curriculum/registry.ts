import type { DocRef } from './types'
import { ALL_MODULES, moduleById } from './modules'
import { ALL_ITEMS, itemById } from './items'
import { TERMINAL_SCENARIOS } from './labs/terminal/scenarios'
import { FORGE_TASKS } from './labs/forge/tasks'

export { ALL_MODULES, moduleById, ALL_ITEMS, itemById, TERMINAL_SCENARIOS, FORGE_TASKS }

export const scenarioById = new Map(TERMINAL_SCENARIOS.map((s) => [s.id, s]))
export const forgeTaskById = new Map(FORGE_TASKS.map((t) => [t.id, t]))

/** labIds는 접두사로 종류를 구분한다: scn-* 는 터미널 시나리오, forge-* 는 ConfigForge 과제 */
export function resolveLab(labId: string) {
  if (labId.startsWith('scn-')) return { kind: 'terminal' as const, lab: scenarioById.get(labId) }
  if (labId.startsWith('forge-')) return { kind: 'forge' as const, lab: forgeTaskById.get(labId) }
  return { kind: 'unknown' as const, lab: undefined }
}

/** scripts/check-refs.mjs 가 호출하는 함수: 커리큘럼 전체의 DocRef를 출처 라벨과 함께 모은다. */
export function collectAllDocRefs(): { ref: DocRef; source: string }[] {
  const out: { ref: DocRef; source: string }[] = []

  for (const m of ALL_MODULES) {
    for (const ref of m.docRefs) out.push({ ref, source: `module:${m.id}` })
  }
  for (const i of ALL_ITEMS) {
    out.push({ ref: i.docRef, source: `item:${i.id}` })
  }
  for (const s of TERMINAL_SCENARIOS) {
    for (const ref of s.docRefs) out.push({ ref, source: `scenario:${s.id}` })
  }
  for (const t of FORGE_TASKS) {
    for (const ref of t.docRefs) out.push({ ref, source: `forge:${t.id}` })
    for (const c of t.checks) if (c.docRef) out.push({ ref: c.docRef, source: `forge-check:${t.id}:${c.id}` })
  }

  return out
}

/** 커리큘럼 내부 일관성 검사: 모듈이 참조하는 itemIds/labIds가 실제로 존재하는지. UI와 check-refs 양쪽에서 재사용. */
export function findDanglingReferences(): string[] {
  const problems: string[] = []
  for (const m of ALL_MODULES) {
    for (const id of m.itemIds) if (!itemById.has(id)) problems.push(`module ${m.id} -> missing item ${id}`)
    for (const id of m.labIds) {
      const { kind, lab } = resolveLab(id)
      if (kind === 'unknown' || !lab) problems.push(`module ${m.id} -> missing lab ${id}`)
    }
    for (const id of m.prereqs) if (!moduleById.has(id)) problems.push(`module ${m.id} -> missing prereq ${id}`)
  }
  return problems
}

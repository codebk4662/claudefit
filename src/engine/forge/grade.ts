import type { ForgeTask, GradeOutcome } from './types'

export function gradeTask(task: ForgeTask, source: string): GradeOutcome {
  let parsed: unknown = source

  if (task.language === 'json') {
    try {
      parsed = JSON.parse(source)
    } catch (e) {
      return { passed: false, parseError: (e as Error).message, results: [] }
    }
  }

  const results = task.checks.map((check) => check.run(parsed, source))
  return { passed: results.length > 0 && results.every((r) => r.pass), results }
}

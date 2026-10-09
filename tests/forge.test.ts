import { describe, it, expect } from 'vitest'
import { gradeTask } from '@/engine/forge/grade'
import { pathExists, pathEquals, arrayContains, sourceMatches, isObject } from '@/engine/forge/checks'
import type { ForgeTask } from '@/engine/forge/types'

const baseTask: Omit<ForgeTask, 'checks'> = {
  id: 'test-task',
  title: 'test',
  targetFile: 'settings.json',
  language: 'json',
  promptMd: '',
  template: '{}',
  skills: ['customize.settings'],
  docRefs: [{ slug: 'settings' }],
  sampleSolution: '{}',
}

describe('gradeTask', () => {
  it('JSON 파싱 오류를 parseError로 보고한다', () => {
    const task: ForgeTask = { ...baseTask, checks: [isObject()] }
    const r = gradeTask(task, '{ invalid')
    expect(r.passed).toBe(false)
    expect(r.parseError).toBeTruthy()
  })

  it('모든 check를 통과하면 passed: true', () => {
    const task: ForgeTask = {
      ...baseTask,
      checks: [
        isObject(),
        pathExists(['permissions', 'allow'], 'permissions.allow 존재'),
        arrayContains(['permissions', 'allow'], (v) => v === 'Bash(npm test)', 'npm test 허용'),
      ],
    }
    const good = JSON.stringify({ permissions: { allow: ['Bash(npm test)'] } })
    expect(gradeTask(task, good).passed).toBe(true)

    const bad = JSON.stringify({ permissions: { allow: ['Bash(ls)'] } })
    const r = gradeTask(task, bad)
    expect(r.passed).toBe(false)
    expect(r.results.some((c) => !c.pass)).toBe(true)
  })

  it('pathEquals는 정확히 일치할 때만 통과', () => {
    const task: ForgeTask = { ...baseTask, checks: [pathEquals(['model'], 'opus', 'model==opus')] }
    expect(gradeTask(task, JSON.stringify({ model: 'opus' })).passed).toBe(true)
    expect(gradeTask(task, JSON.stringify({ model: 'sonnet' })).passed).toBe(false)
  })

  it('sourceMatches는 raw 문자열에 대해 검사한다 (markdown 등)', () => {
    const task: ForgeTask = {
      ...baseTask,
      language: 'markdown',
      checks: [sourceMatches(/^---\n/, 'frontmatter로 시작')],
    }
    expect(gradeTask(task, '---\nname: x\n---\nbody').passed).toBe(true)
    expect(gradeTask(task, 'no frontmatter').passed).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { parseClaudeInput, parseShellInput, parseKey } from '@/engine/terminal/parser'
import { Vfs } from '@/engine/terminal/vfs'
import { matchAccept, judgeStep, type ScenarioStep } from '@/engine/terminal/judge'
import { cyclePermissionMode } from '@/engine/terminal/runtime'

describe('parseClaudeInput', () => {
  it('슬래시 명령을 맨 앞에서만 인식한다', () => {
    const r = parseClaudeInput('/init')
    expect(r).toMatchObject({ kind: 'slash', name: 'init', args: '' })
  })

  it('명령 뒤 텍스트를 인수로 취급한다', () => {
    const r = parseClaudeInput('/model opus')
    expect(r).toMatchObject({ kind: 'slash', name: 'model', args: 'opus' })
  })

  it('별칭을 정규 이름으로 치환한다', () => {
    const r = parseClaudeInput('/review 1234')
    expect(r).toMatchObject({ kind: 'slash', name: 'code-review', args: '1234' })
  })

  it('맨 앞이 아니면 슬래시도 일반 프롬프트로 취급한다', () => {
    const r = parseClaudeInput('fix the /init bug')
    expect(r.kind).toBe('prompt')
  })

  it('@멘션을 추출한다', () => {
    const r = parseClaudeInput('@src/auth.ts 이 파일 테스트 작성해줘 @README.md 도 참고')
    expect(r).toMatchObject({ kind: 'prompt', mentions: ['src/auth.ts', 'README.md'] })
  })

  it('알 수 없는 슬래시 형태는 unknown-slash', () => {
    const r = parseClaudeInput('/ ')
    expect(r.kind).toBe('unknown-slash')
  })
})

describe('parseShellInput / parseKey', () => {
  it('셸 입력은 bash로 파싱된다', () => {
    expect(parseShellInput('claude')).toMatchObject({ kind: 'bash', command: 'claude' })
  })
  it('키 입력은 key로 파싱된다', () => {
    expect(parseKey('Shift+Tab')).toMatchObject({ kind: 'key', key: 'Shift+Tab' })
  })
})

describe('cyclePermissionMode', () => {
  it('default -> acceptEdits -> plan -> default 순으로 순환한다', () => {
    expect(cyclePermissionMode('default')).toBe('acceptEdits')
    expect(cyclePermissionMode('acceptEdits')).toBe('plan')
    expect(cyclePermissionMode('plan')).toBe('default')
  })
  it('quick cycle 밖의 모드는 default로 되돌아간다', () => {
    expect(cyclePermissionMode('auto')).toBe('default')
  })
})

describe('Vfs', () => {
  it('초기 파일과 비교해 변경분을 diff로 보여준다', () => {
    const vfs = new Vfs({ 'a.txt': 'hello' })
    vfs.write('a.txt', 'hello world')
    vfs.write('b.txt', 'new file')
    const diff = vfs.diff()
    expect(diff.find((d) => d.path === 'a.txt')).toMatchObject({ status: 'modified' })
    expect(diff.find((d) => d.path === 'b.txt')).toMatchObject({ status: 'added' })
  })

  it('reset은 초기 상태로 되돌린다', () => {
    const vfs = new Vfs({ 'a.txt': 'hello' })
    vfs.write('a.txt', 'changed')
    vfs.reset()
    expect(vfs.read('a.txt')).toBe('hello')
  })
})

describe('matchAccept / judgeStep', () => {
  const ctx = { mode: 'claude' as const, permissionMode: 'default' as const }

  it('any 규칙은 하나라도 맞으면 통과', () => {
    const rule = { any: [{ slash: 'plan' }, { key: 'Shift+Tab' }] }
    expect(matchAccept(rule, parseKey('Shift+Tab'), ctx)).toBe(true)
    expect(matchAccept(rule, parseClaudeInput('/plan'), ctx)).toBe(true)
    expect(matchAccept(rule, parseClaudeInput('/help'), ctx)).toBe(false)
  })

  it('argsMatch까지 함께 검사한다', () => {
    const rule = { slash: 'model', argsMatch: /^opus/ }
    expect(matchAccept(rule, parseClaudeInput('/model opus'), ctx)).toBe(true)
    expect(matchAccept(rule, parseClaudeInput('/model sonnet'), ctx)).toBe(false)
  })

  it('judgeStep은 실패 시 시도 횟수에 맞는 힌트를 돌려준다', () => {
    const step: ScenarioStep = {
      id: 's1',
      goal: 'plan 모드로 전환',
      hints: ['힌트1', '힌트2', '힌트3'],
      accept: { slash: 'plan' },
      systemOutput: [],
    }
    const r0 = judgeStep(step, parseClaudeInput('/help'), ctx, 0)
    expect(r0).toMatchObject({ passed: false, hint: '힌트1' })
    const r5 = judgeStep(step, parseClaudeInput('/help'), ctx, 5)
    expect(r5).toMatchObject({ passed: false, hint: '힌트3' })
    const rPass = judgeStep(step, parseClaudeInput('/plan'), ctx, 2)
    expect(rPass.passed).toBe(true)
  })
})

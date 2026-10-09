/**
 * 터미널 시뮬레이터 입력 파서.
 *
 * 실제 Claude Code 규칙을 반영한다:
 * - 슬래시 명령은 메시지 "맨 앞"에 있을 때만 명령으로 인식된다. 뒤에 오는 텍스트는 인수가 된다.
 * - 셸 모드(아직 `claude`를 실행하지 않은 상태)에서는 모든 입력이 bash 명령으로 취급된다.
 * - `@경로` 형태의 멘션은 프롬프트 어디에나 등장할 수 있다.
 */

export type ParsedInput =
  | { kind: 'bash'; raw: string; command: string }
  | { kind: 'slash'; raw: string; name: string; args: string }
  | { kind: 'unknown-slash'; raw: string; typed: string }
  | { kind: 'prompt'; raw: string; text: string; mentions: string[] }
  | { kind: 'key'; raw: string; key: string }

/** 문서에 나온 대표 별칭 (전체 목록이 아니라 시나리오에서 쓰는 것만) */
export const COMMAND_ALIASES: Record<string, string> = {
  review: 'code-review',
  bg: 'background',
  rc: 'remote-control',
  checkup: 'doctor',
  continue: 'resume',
  reset: 'clear',
  new: 'clear',
  settings: 'config',
  cost: 'usage',
  stats: 'usage',
  quit: 'exit',
  undo: 'rewind',
  checkpoint: 'rewind',
  allowed_tools: 'permissions',
  'allowed-tools': 'permissions',
}

const SLASH_RE = /^\/([a-zA-Z0-9][a-zA-Z0-9_-]*)\b\s*(.*)$/s

export function parseClaudeInput(raw: string): ParsedInput {
  const trimmed = raw.trim()

  if (trimmed.startsWith('/')) {
    const m = SLASH_RE.exec(trimmed)
    if (!m) return { kind: 'unknown-slash', raw, typed: trimmed }
    const nameRaw = m[1].toLowerCase()
    const name = COMMAND_ALIASES[nameRaw] ?? nameRaw
    return { kind: 'slash', raw, name, args: (m[2] ?? '').trim() }
  }

  const mentions = [...trimmed.matchAll(/@([^\s]+)/g)].map((mm) => mm[1])
  return { kind: 'prompt', raw, text: trimmed, mentions }
}

export function parseShellInput(raw: string): ParsedInput {
  return { kind: 'bash', raw, command: raw.trim() }
}

export function parseKey(key: string): ParsedInput {
  return { kind: 'key', raw: key, key }
}

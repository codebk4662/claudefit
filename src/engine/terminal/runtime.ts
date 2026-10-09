import { Vfs } from './vfs'

export type PermissionMode = 'default' | 'acceptEdits' | 'plan' | 'auto' | 'dontAsk' | 'bypassPermissions'

/** Shift+Tab 으로 순환하는 3가지 빠른 모드 (auto/dontAsk/bypassPermissions 는 /permissions 로만 진입) */
export const QUICK_CYCLE: PermissionMode[] = ['default', 'acceptEdits', 'plan']

export function cyclePermissionMode(mode: PermissionMode): PermissionMode {
  const i = QUICK_CYCLE.indexOf(mode)
  if (i === -1) return 'default'
  return QUICK_CYCLE[(i + 1) % QUICK_CYCLE.length]
}

export type TranscriptEntry =
  | { who: 'user'; text: string }
  | { who: 'system'; lines: string[] }
  | { who: 'hint'; lines: string[] }

export interface RuntimeState {
  mode: 'shell' | 'claude'
  permissionMode: PermissionMode
  model: string
  effort: 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  contextPct: number
  history: string[]
  vfs: Vfs
  transcript: TranscriptEntry[]
}

export function createRuntime(opts: {
  initialFiles?: Record<string, string>
  startMode?: 'shell' | 'claude'
}): RuntimeState {
  return {
    mode: opts.startMode ?? 'shell',
    permissionMode: 'default',
    model: 'claude-opus-5',
    effort: 'medium',
    contextPct: 4,
    history: [],
    vfs: new Vfs(opts.initialFiles ?? {}),
    transcript: [],
  }
}

export function pushUser(state: RuntimeState, text: string): RuntimeState {
  return {
    ...state,
    history: [...state.history, text],
    transcript: [...state.transcript, { who: 'user', text }],
  }
}

export function pushSystem(state: RuntimeState, lines: string[]): RuntimeState {
  return { ...state, transcript: [...state.transcript, { who: 'system', lines }] }
}

export function pushHint(state: RuntimeState, lines: string[]): RuntimeState {
  return { ...state, transcript: [...state.transcript, { who: 'hint', lines }] }
}

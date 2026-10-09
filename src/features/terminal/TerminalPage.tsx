import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { scenarioById } from '@/curriculum/registry'
import { Vfs } from '@/engine/terminal/vfs'
import { parseClaudeInput, parseShellInput, type ParsedInput } from '@/engine/terminal/parser'
import { judgeStep } from '@/engine/terminal/judge'
import { useProgress } from '@/store/progress'
import { Card, PageHeader, Pill, PrimaryButton, SecondaryButton, DocRefLink, ProgressBar } from '@/ui/common'

type Line = { who: 'user' | 'system' | 'hint'; text: string }

export function TerminalPage() {
  const { scenarioId = '' } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const scenario = scenarioById.get(scenarioId)
  const recordLabAttempt = useProgress((s) => s.recordLabAttempt)

  const vfsRef = useRef<Vfs | null>(null)
  const [mode, setMode] = useState<'shell' | 'claude'>(scenario?.startMode ?? 'claude')
  const [stepIndex, setStepIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [done, setDone] = useState(false)
  const lastEscAt = useRef(0)

  if (!scenario) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>시나리오를 찾을 수 없습니다: {scenarioId}</Card>
      </div>
    )
  }
  if (!vfsRef.current) vfsRef.current = new Vfs(scenario.initialFiles)

  const step = scenario.steps[stepIndex]

  const pushLine = (who: Line['who'], text: string) => {
    setLines((prev) => [...prev, { who, text }])
  }

  const handleInput = (parsed: ParsedInput) => {
    if (!step) return
    const result = judgeStep(step, parsed, { mode, permissionMode: 'default' }, attempts)
    if (result.passed) {
      step.effect?.(vfsRef.current!)
      for (const line of step.systemOutput) pushLine('system', line)

      // 셸에서 claude 를 실행하면 REPL 모드로 전환한다.
      if (parsed.kind === 'bash' && /^claude(\s|$)/.test(parsed.command)) setMode('claude')

      setAttempts(0)
      if (stepIndex + 1 >= scenario.steps.length) {
        setDone(true)
        recordLabAttempt(scenario.id, true)
      } else {
        setStepIndex((i) => i + 1)
      }
    } else {
      setAttempts((a) => a + 1)
      if (result.hint) pushLine('hint', `💡 ${result.hint}`)
    }
  }

  const submit = () => {
    const raw = input
    if (raw.trim().length === 0) return
    pushLine('user', raw)
    const parsed = mode === 'shell' ? parseShellInput(raw) : parseClaudeInput(raw)
    setInput('')
    handleInput(parsed)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      pushLine('user', '[Shift+Tab]')
      handleInput({ kind: 'key', raw: 'Shift+Tab', key: 'Shift+Tab' })
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      const now = Date.now()
      if (now - lastEscAt.current < 600) {
        pushLine('user', '[Esc Esc]')
        handleInput({ kind: 'key', raw: 'Esc Esc', key: 'Esc Esc' })
        lastEscAt.current = 0
      } else {
        lastEscAt.current = now
      }
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  const reset = () => {
    vfsRef.current = new Vfs(scenario.initialFiles)
    setMode(scenario.startMode)
    setStepIndex(0)
    setAttempts(0)
    setLines([])
    setInput('')
    setDone(false)
  }

  const prompt = mode === 'shell' ? '$' : '❯'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/learn" className="text-sm text-[var(--accent)] hover:underline">
        ← 학습 트랙
      </Link>
      <PageHeader
        title={scenario.title}
        description={scenario.description}
        actions={
          <div className="flex gap-2 flex-wrap">
            {scenario.docRefs.map((r, i) => (
              <DocRefLink key={i} docRef={r} />
            ))}
          </div>
        }
      />

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-dim)] mb-1">
          <span>
            단계 {Math.min(stepIndex + 1, scenario.steps.length)} / {scenario.steps.length}
          </span>
          <Pill tone={mode === 'shell' ? 'default' : 'accent'}>{mode === 'shell' ? '셸 모드' : 'Claude Code REPL'}</Pill>
        </div>
        <ProgressBar value={stepIndex} max={scenario.steps.length} />
      </div>

      {!done && step && (
        <Card className="mb-3 border-[var(--accent)]">
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] mb-1">지금 할 일</p>
          <p className="font-medium text-sm">{step.goal}</p>
        </Card>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[#15130f] text-[#e4ddcc] font-mono text-sm p-4 h-80 overflow-y-auto">
        <p className="text-[#8a8068] mb-2">⚠️ 이것은 실제 Claude가 아닌 스크립트 재현입니다 — 입력을 미리 정의된 패턴과 비교합니다.</p>
        {lines.map((l, i) => (
          <TerminalLine key={i} line={l} prompt={prompt} />
        ))}
        {done && <p className="text-[#6fbb7c] mt-2">✓ 시나리오 완료!</p>}
      </div>

      {!done ? (
        <div className="mt-3 flex gap-2">
          <span className="font-mono pt-2 text-[var(--text-dim)]">{prompt}</span>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={mode === 'shell' ? '예: claude' : '예: /init'}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-2 font-mono text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <PrimaryButton onClick={submit}>전송</PrimaryButton>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <PrimaryButton onClick={() => navigate(-1)}>돌아가기</PrimaryButton>
          <SecondaryButton onClick={reset}>다시 풀기</SecondaryButton>
        </div>
      )}

      <p className="text-xs text-[var(--text-dim)] mt-3">
        키 입력: <Kbd>Shift+Tab</Kbd> 권한 모드 순환 · <Kbd>Esc</Kbd> 두 번 빠르게 눌러 되감기 메뉴 흉내
      </p>
    </div>
  )
}

function TerminalLine({ line, prompt }: { line: Line; prompt: string }) {
  if (line.who === 'user') return <p className="text-[#f3eedd]">{prompt} {line.text}</p>
  if (line.who === 'hint') return <p className="text-[#d99a4e]">{line.text}</p>
  return <p className="text-[#a69e8c] whitespace-pre-wrap">{line.text}</p>
}

function Kbd({ children }: { children: string }) {
  return <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--code-bg)] text-[11px] font-mono">{children}</kbd>
}

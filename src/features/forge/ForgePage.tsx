import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { forgeTaskById } from '@/curriculum/registry'
import { gradeTask } from '@/engine/forge/grade'
import type { GradeOutcome } from '@/engine/forge/types'
import { useProgress } from '@/store/progress'
import { Card, PageHeader, PrimaryButton, SecondaryButton, DocRefLink } from '@/ui/common'
import { hapticSuccess, hapticFailure } from '@/lib/haptics'
import { CodeEditor } from '@/ui/CodeEditor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function ForgePage() {
  const { taskId = '' } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const task = forgeTaskById.get(taskId)
  const recordLabAttempt = useProgress((s) => s.recordLabAttempt)

  const [source, setSource] = useState(task?.template ?? '')
  const [outcome, setOutcome] = useState<GradeOutcome | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [passedOnce, setPassedOnce] = useState(false)

  if (!task) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>과제를 찾을 수 없습니다: {taskId}</Card>
      </div>
    )
  }

  const grade = () => {
    const result = gradeTask(task, source)
    setOutcome(result)
    if (result.passed) {
      hapticSuccess()
      if (!passedOnce) {
        setPassedOnce(true)
        recordLabAttempt(task.id, true)
      }
    } else {
      hapticFailure()
      recordLabAttempt(task.id, false)
    }
  }

  const reset = () => {
    setSource(task.template)
    setOutcome(null)
    setShowSolution(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/learn" className="text-sm text-[var(--accent)] hover:underline">
        ← 학습 트랙
      </Link>
      <PageHeader
        title={task.title}
        description={`대상 파일: ${task.targetFile}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            {task.docRefs.map((r, i) => (
              <DocRefLink key={i} docRef={r} />
            ))}
          </div>
        }
      />

      <Card className="mb-4 prose-doc">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.promptMd}</ReactMarkdown>
      </Card>

      <CodeEditor key={task.id} initialValue={source} language={task.language} onChange={setSource} />

      <div className="mt-3 flex gap-2 flex-wrap">
        <PrimaryButton onClick={grade}>채점하기</PrimaryButton>
        <SecondaryButton onClick={reset}>초기화</SecondaryButton>
        {passedOnce && <SecondaryButton onClick={() => navigate(-1)}>돌아가기</SecondaryButton>}
      </div>

      {outcome && (
        <Card className="mt-4">
          {outcome.parseError ? (
            <p className="text-[var(--bad)] text-sm font-mono">JSON 파싱 오류: {outcome.parseError}</p>
          ) : (
            <>
              <p className={`font-medium mb-2 ${outcome.passed ? 'text-[var(--good)]' : 'text-[var(--bad)]'}`}>
                {outcome.passed ? '✓ 모든 체크를 통과했습니다' : '아직 통과하지 못한 체크가 있습니다'}
              </p>
              <ul className="space-y-1 text-sm">
                {outcome.results.map((r, i) => {
                  const check = task.checks[i]
                  return (
                    <li key={i} className={r.pass ? 'text-[var(--good)]' : 'text-[var(--bad)]'}>
                      {r.pass ? '✓' : '✗'} {r.message}
                      {!r.pass && check?.docRef && (
                        <span className="ml-2">
                          <DocRefLink docRef={check.docRef} />
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </Card>
      )}

      {/* 실습화면 맨 하단의 모범답안 — 누를 때까지는 스포일러처럼 가려둔다 */}
      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <SecondaryButton onClick={() => setShowSolution((v) => !v)}>{showSolution ? '모범답안 숨기기' : '모범답안 보기'}</SecondaryButton>
        {showSolution && (
          <Card className="mt-3">
            <p className="text-sm uppercase tracking-wide text-[var(--text-dim)] mb-2">모범답안</p>
            <pre className="text-sm bg-[var(--code-bg)] rounded-lg p-3 overflow-x-auto">{task.sampleSolution}</pre>
          </Card>
        )}
      </div>
    </div>
  )
}

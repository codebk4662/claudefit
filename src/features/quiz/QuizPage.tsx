import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { moduleById } from '@/curriculum/modules'
import { PageHeader, Card } from '@/ui/common'
import { QuizRunner, QuizSummary } from './QuizRunner'

export function QuizPage() {
  const { moduleId = '' } = useParams<{ moduleId: string }>()
  const mod = moduleById.get(moduleId)
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)
  const [runKey, setRunKey] = useState(0)

  if (!mod) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>모듈을 찾을 수 없습니다: {moduleId}</Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to={`/learn/${mod.id}`} className="text-sm text-[var(--accent)] hover:underline">
        ← {mod.title}
      </Link>
      <PageHeader title={`퀴즈: ${mod.title}`} />

      {result ? (
        <QuizSummary
          correct={result.correct}
          total={result.total}
          onRestart={() => {
            setResult(null)
            setRunKey((k) => k + 1)
          }}
        />
      ) : (
        <QuizRunner key={runKey} itemIds={mod.itemIds} onFinish={setResult} />
      )}
    </div>
  )
}

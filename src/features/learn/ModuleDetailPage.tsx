import { Link, useNavigate, useParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { moduleById } from '@/curriculum/modules'
import { skillLabel } from '@/curriculum/skills'
import { trackById } from '@/curriculum/tracks'
import { resolveLab } from '@/curriculum/registry'
import { useProgress } from '@/store/progress'
import { Card, Pill, PageHeader, PrimaryButton, SecondaryButton, DocRefLink } from '@/ui/common'

export function ModuleDetailPage() {
  const { moduleId = '' } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const mod = moduleById.get(moduleId)
  const status = useProgress((s) => s.moduleStatus[moduleId] ?? 'not-started')
  const markModuleStatus = useProgress((s) => s.markModuleStatus)

  if (!mod) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card>모듈을 찾을 수 없습니다: {moduleId}</Card>
      </div>
    )
  }

  const track = trackById(mod.trackId)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/learn" className="text-sm text-[var(--accent)] hover:underline">
        ← 학습 트랙
      </Link>

      <PageHeader
        title={mod.title}
        description={`${track.title} 트랙 · 약 ${mod.estMinutes}분`}
        actions={
          <div className="flex gap-2">
            {status !== 'learning' && (
              <SecondaryButton onClick={() => markModuleStatus(mod.id, 'learning')}>학습 중으로 표시</SecondaryButton>
            )}
            {status !== 'done' && <PrimaryButton onClick={() => markModuleStatus(mod.id, 'done')}>완료로 표시</PrimaryButton>}
            {status === 'done' && <Pill tone="good">완료됨 ✓</Pill>}
          </div>
        }
      />

      <Card className="mb-6">
        <h2 className="font-semibold mb-2 text-sm text-[var(--text-dim)] uppercase tracking-wide">학습 목표</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {mod.objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </Card>

      <Card className="mb-6 prose-doc">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{mod.summaryMd}</ReactMarkdown>
      </Card>

      <Card className="mb-6">
        <h2 className="font-semibold mb-2 text-sm text-[var(--text-dim)] uppercase tracking-wide">원문 근거</h2>
        <div className="flex flex-col gap-1">
          {mod.docRefs.map((ref, i) => (
            <DocRefLink key={i} docRef={ref} />
          ))}
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-semibold mb-2 text-sm text-[var(--text-dim)] uppercase tracking-wide">관련 스킬</h2>
        <div className="flex flex-wrap gap-1.5">
          {mod.skills.map((s) => (
            <Pill key={s}>{skillLabel(s)}</Pill>
          ))}
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        <Card>
          <h2 className="font-semibold mb-1">퀴즈</h2>
          <p className="text-sm text-[var(--text-dim)] mb-3">{mod.itemIds.length}개 문항으로 이해도를 확인합니다.</p>
          <PrimaryButton onClick={() => navigate(`/quiz/${mod.id}`)} disabled={mod.itemIds.length === 0}>
            퀴즈 시작 →
          </PrimaryButton>
        </Card>

        {mod.labIds.length > 0 && (
          <Card>
            <h2 className="font-semibold mb-1">실습</h2>
            <div className="flex flex-col gap-2 mt-2">
              {mod.labIds.map((labId) => {
                const { kind, lab } = resolveLab(labId)
                if (!lab) return null
                const to = kind === 'terminal' ? `/terminal/${labId}` : `/forge/${labId}`
                return (
                  <SecondaryButton key={labId} onClick={() => navigate(to)}>
                    {kind === 'terminal' ? '🖥️' : '🛠️'} {lab.title}
                  </SecondaryButton>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

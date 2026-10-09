import { Link } from 'react-router'
import { TRACKS } from '@/curriculum/tracks'
import { ALL_MODULES } from '@/curriculum/modules'
import { useProgress } from '@/store/progress'
import { Card, Pill, PageHeader, ProgressBar } from '@/ui/common'

const STATUS_LABEL: Record<string, string> = { 'not-started': '시작 전', learning: '학습 중', done: '완료' }
const STATUS_TONE: Record<string, 'default' | 'accent' | 'good'> = { 'not-started': 'default', learning: 'accent', done: 'good' }

export function TrackListPage() {
  const moduleStatus = useProgress((s) => s.moduleStatus)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader title="학습 트랙" description="실무 핵심 순서로 5개 트랙, 38개 모듈을 구성했습니다. 위에서부터 차례로 진행하는 걸 권장합니다." />

      <div className="space-y-10">
        {TRACKS.map((track) => {
          const modules = ALL_MODULES.filter((m) => m.trackId === track.id).sort((a, b) => a.order - b.order)
          const doneCount = modules.filter((m) => moduleStatus[m.id] === 'done').length

          return (
            <section key={track.id}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h2 className="font-display text-lg">
                  {track.order}. {track.title}
                </h2>
                <span className="text-xs text-[var(--text-dim)]">
                  {doneCount}/{modules.length} 완료
                </span>
              </div>
              <p className="text-sm text-[var(--text-dim)] mb-3">{track.description}</p>
              <ProgressBar value={doneCount} max={modules.length} />

              <div className="grid sm:grid-cols-2 gap-2 mt-4">
                {modules.map((m) => {
                  const status = moduleStatus[m.id] ?? 'not-started'
                  return (
                    <Link key={m.id} to={`/learn/${m.id}`} className="block">
                      <Card className="hover:border-[var(--accent)] transition-colors h-full">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{m.title}</span>
                          <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
                        </div>
                        <p className="text-xs text-[var(--text-dim)] mt-1">약 {m.estMinutes}분 · 문항 {m.itemIds.length}개{m.labIds.length > 0 ? ` · 실습 ${m.labIds.length}개` : ''}</p>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

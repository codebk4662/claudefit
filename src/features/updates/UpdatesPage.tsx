import { Link } from 'react-router'
import { PageHeader, Card, Pill } from '@/ui/common'
import { UPDATE_HISTORY } from './updateHistory'
import { hapticSelect } from '@/lib/haptics'

export function UpdatesPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader title="업데이트 소식" description="Claude Code 공식 변경 로그 중 학습자가 알면 좋은 변화만 모아 정리했습니다. 세부 수정 전체는 원문을 참고하세요." />

      <div className="space-y-4">
        {UPDATE_HISTORY.map((entry) => (
          <Card key={entry.version}>
            <div className="flex items-center gap-2 mb-2">
              <Pill tone="accent">{entry.version}</Pill>
              <h2 className="font-semibold">{entry.title}</h2>
            </div>
            <ul className="space-y-1.5">
              {entry.highlights.map((h, i) => (
                <li key={i} className="text-sm text-[var(--text-dim)] leading-relaxed pl-4 -indent-4">
                  · {h}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <p className="text-sm text-[var(--text-dim)] mt-6">
        더 오래된 변경이나 세부 수정 내역이 필요하면{' '}
        <Link to="/docs/changelog" onClick={hapticSelect} className="text-[var(--accent)] hover:underline">
          원문 변경 로그
        </Link>
        를 확인하세요 (버전별 수백 개 항목이 그대로 담긴 원문이라 양이 많습니다).
      </p>
    </div>
  )
}

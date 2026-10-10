import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { loadDocsIndex, type DocIndexEntry } from '@/lib/docsClient'
import { useSearchIndex } from '@/lib/useSearchIndex'
import { PageHeader, Card, Pill } from '@/ui/common'
import { useProgress } from '@/store/progress'
import { hapticSelect } from '@/lib/haptics'

export function DocsLibraryPage() {
  const [docs, setDocs] = useState<DocIndexEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const { index, loading: indexLoading } = useSearchIndex()
  const readDocSlugs = useProgress((s) => s.readDocSlugs)

  useEffect(() => {
    loadDocsIndex()
      .then(setDocs)
      .catch((e: Error) => setError(e.message))
  }, [])

  const hits = useMemo(() => {
    if (!index || query.trim().length === 0) return null
    return index.search(query, 40)
  }, [index, query])

  const grouped = useMemo(() => {
    if (!docs) return []
    const byGroup = new Map<string, DocIndexEntry[]>()
    for (const d of docs) {
      const arr = byGroup.get(d.group) ?? []
      arr.push(d)
      byGroup.set(d.group, arr)
    }
    return [...byGroup.entries()]
  }, [docs])

  if (error) {
    return (
      <div className="p-6 max-w-3xl">
        <Card>
          <p className="text-[var(--bad)] font-medium">문서를 불러오지 못했습니다.</p>
          <p className="text-sm text-[var(--text-dim)] mt-2">{error}</p>
          <p className="text-sm text-[var(--text-dim)] mt-2">
            터미널에서 <code>npm run sync:docs</code>를 실행했는지 확인하세요.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader title="원문 라이브러리" description={`공식 문서 한국어판 ${docs?.length ?? '…'}페이지를 로컬 캐시에서 전문 검색합니다. © Anthropic, code.claude.com/docs/ko`} />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={indexLoading ? '검색 인덱스를 준비하는 중…' : '예: 훅, 권한 모드, MCP…'}
        disabled={indexLoading}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2.5 text-base mb-6 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />

      {hits && (
        <div className="space-y-2 mb-8">
          <p className="text-sm text-[var(--text-dim)]">{hits.length}개 결과</p>
          {hits.map((h) => (
            <Link key={h.id} to={`/docs/${h.id}`} onClick={hapticSelect} className="block">
              <Card className="hover:border-[var(--accent)] transition-colors relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{h.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {readDocSlugs[h.id] && <ReadBadge />}
                    {h.group && <Pill>{h.group}</Pill>}
                  </div>
                </div>
                <p className="text-sm text-[var(--text-dim)] mt-1 line-clamp-2">{h.snippet}</p>
              </Card>
            </Link>
          ))}
          {hits.length === 0 && <p className="text-sm text-[var(--text-dim)]">일치하는 문서가 없습니다.</p>}
        </div>
      )}

      {!hits && (
        <div className="space-y-8">
          {grouped.map(([group, items]) => (
            <section key={group}>
              {/* 스크롤 시 현재 섹션 제목이 상단(모바일 헤더 바로 아래 / 데스크톱은 맨 위)에 고정된다 */}
              <h2 className="sticky top-14 md:top-0 z-10 -mx-6 px-6 py-2 bg-[var(--bg)]/95 backdrop-blur text-lg font-bold text-[var(--text)] mb-1">
                {group}
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {items.map((d) => (
                  <Link key={d.slug} to={`/docs/${d.slug}`} onClick={hapticSelect} className="block">
                    <Card className="hover:border-[var(--accent)] transition-colors h-full relative">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{d.title}</span>
                        {readDocSlugs[d.slug] && <ReadBadge />}
                      </div>
                      {d.description && <p className="text-sm text-[var(--text-dim)] mt-1 line-clamp-2">{d.description}</p>}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

/** 한 번이라도 연 문서에 붙는 읽음 표시 */
function ReadBadge() {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs shrink-0 bg-[color-mix(in_srgb,var(--good)_16%,transparent)] text-[var(--good)]"
      title="읽음"
      aria-label="읽음"
    >
      ✓
    </span>
  )
}

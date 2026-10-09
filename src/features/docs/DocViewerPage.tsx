import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { loadDocMarkdown, loadDocsIndex, type DocIndexEntry } from '@/lib/docsClient'
import { stripFrontmatterNotice } from '@/lib/docText'
import { Card, Pill } from '@/ui/common'

export function DocViewerPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const location = useLocation()
  const [md, setMd] = useState<string | null>(null)
  const [meta, setMeta] = useState<DocIndexEntry | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMd(null)
    setError(null)
    Promise.all([loadDocMarkdown(slug), loadDocsIndex()])
      .then(([text, index]) => {
        setMd(stripFrontmatterNotice(text))
        setMeta(index.find((d) => d.slug === slug) ?? null)
      })
      .catch((e: Error) => setError(e.message))
  }, [slug])

  useEffect(() => {
    if (!md || !location.hash) return
    const id = decodeURIComponent(location.hash.slice(1))
    // 마크다운 렌더 후 DOM에 반영될 시간을 준다
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    }, 60)
    return () => clearTimeout(t)
  }, [md, location.hash])

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <p className="text-[var(--bad)] font-medium">문서를 불러오지 못했습니다: {slug}</p>
          <p className="text-sm text-[var(--text-dim)] mt-2">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap text-sm">
        <Link to="/docs" className="text-[var(--accent)] hover:underline">
          ← 원문 라이브러리
        </Link>
        {meta && (
          <a href={meta.sourceUrl} target="_blank" rel="noreferrer" className="text-[var(--text-dim)] hover:underline">
            출처: {meta.sourceUrl} (© Anthropic) · 동기화: {new Date(meta.fetchedAt).toLocaleDateString('ko-KR')}
          </a>
        )}
      </div>

      {meta?.group && <Pill>{meta.group}</Pill>}

      {md === null ? (
        <p className="text-[var(--text-dim)] mt-4">불러오는 중…</p>
      ) : (
        <article className="prose-doc mt-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSlug]}>
            {md}
          </ReactMarkdown>
        </article>
      )}
    </div>
  )
}

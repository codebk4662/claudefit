import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { DocRef } from '@/curriculum/types'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-5 shadow-[0_1px_2px_rgba(20,19,15,0.04),0_8px_24px_-12px_rgba(20,19,15,0.12)] ${className}`}
    >
      {children}
    </div>
  )
}

export function Pill({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' | 'good' | 'warn' | 'bad' }) {
  // color-mix로 각 시맨틱 토큰에서 직접 옅은 배경을 뽑아내, 라이트/다크 전환과 팔레트 교체에 자동으로 맞는다.
  const toneClass = {
    default: 'bg-[var(--code-bg)] text-[var(--text-dim)]',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    good: 'bg-[color-mix(in_srgb,var(--good)_16%,transparent)] text-[var(--good)]',
    warn: 'bg-[color-mix(in_srgb,var(--warn)_16%,transparent)] text-[var(--warn)]',
    bad: 'bg-[color-mix(in_srgb,var(--bad)_16%,transparent)] text-[var(--bad)]',
  }[tone]
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${toneClass}`}>{children}</span>
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="w-full h-2 rounded-full bg-[var(--code-bg)] overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className="h-full rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  )
}

/** 원문 근거 링크 — 항상 /docs/:slug#anchor 로 이동 (출처 표기를 겸한다) */
export function DocRefLink({ docRef }: { docRef: DocRef }) {
  const to = docRef.anchor ? `/docs/${docRef.slug}#${docRef.anchor}` : `/docs/${docRef.slug}`
  return (
    <Link to={to} className="text-[var(--accent)] hover:underline text-sm inline-flex items-center gap-1">
      📄 {docRef.label ?? docRef.slug}
    </Link>
  )
}

export function PrimaryButton({ children, onClick, disabled, type = 'button' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-medium text-sm shadow-[0_1px_2px_rgba(20,19,15,0.1),0_4px_12px_-4px_var(--accent-soft)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:brightness-[1.06] active:brightness-95 transition-[filter]"
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--code-bg)] hover:border-[var(--accent)] transition-colors"
    >
      {children}
    </button>
  )
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl">{title}</h1>
        {description && <p className="text-[var(--text-dim)] text-sm mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

import { NavLink, Outlet } from 'react-router'
import { Logo } from './Logo'

const NAV = [
  { to: '/', label: '대시보드', icon: '🏠' },
  { to: '/drill', label: '데일리 드릴', icon: '⚡' },
  { to: '/learn', label: '학습 트랙', icon: '📚' },
  { to: '/docs', label: '원문 라이브러리', icon: '🔎' },
] as const

export function Layout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
      {/* 데스크톱 전용 사이드바 — 모바일은 하단 탭바가 같은 4개 목적지를 더 네이티브하게 대신한다 */}
      <aside className="hidden md:block sticky top-0 h-screen w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg-raised)]">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-2.5">
          <Logo size={28} />
          <div>
            <div className="font-display text-base leading-tight">클로드핏</div>
            <p className="text-[11px] text-[var(--text-dim)] leading-tight">Claude Code 학습 트레이닝</p>
          </div>
        </div>
        <nav className="p-2 flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-[var(--accent)] bg-[var(--accent-soft)]' : 'text-[var(--text-dim)] hover:bg-[var(--code-bg)] hover:text-[var(--text)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[var(--accent)]" aria-hidden />}
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-[11px] text-[var(--text-dim)] border-t border-[var(--border)]">
          원문: code.claude.com/docs/ko · 로컬 캐시, 비공식 학습 도구
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header
          className="md:hidden sticky top-0 z-10 bg-[var(--bg-raised)]/90 backdrop-blur border-b border-[var(--border)] px-4 flex items-center gap-2.5"
          style={{ paddingTop: 'calc(0.75rem + var(--safe-top))', paddingBottom: '0.75rem' }}
        >
          <Logo size={22} />
          <div className="font-display text-base">클로드핏</div>
        </header>

        {/* 모바일 하단 탭바와 겹치지 않도록 여유 패딩 (세이프에어리어 포함) */}
        <main className="flex-1 min-w-0" style={{ paddingBottom: 'calc(4.25rem + var(--safe-bottom))' }}>
          <Outlet />
        </main>

        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-[var(--bg-raised)]/95 backdrop-blur border-t border-[var(--border)] flex"
          style={{ paddingBottom: 'var(--safe-bottom)' }}
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'
                }`
              }
            >
              <span className="text-lg leading-none" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

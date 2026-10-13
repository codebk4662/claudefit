import { useEffect, useState } from 'react'
import { Logo } from './Logo'

/**
 * 가벼운 1회성 시작 애니메이션.
 * CSS 키프레임 대신 상태로 opacity/scale을 직접 토글해 트랜지션한다 — 언마운트 타이밍과
 * 애니메이션 클럭이 어긋나 "멈춰 보이는" 경우를 피하기 위해서다(메인 스레드가 바쁠 때도 안전).
 */
export function AppIntro() {
  const [mounted, setMounted] = useState(true)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const showT = requestAnimationFrame(() => setShown(true)) // 마운트 직후 한 프레임 뒤에 트랜지션 시작
    const hideT = setTimeout(() => setShown(false), 650)
    const unmountT = setTimeout(() => setMounted(false), 950)
    return () => {
      cancelAnimationFrame(showT)
      clearTimeout(hideT)
      clearTimeout(unmountT)
    }
  }, [])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-[#14130F] pointer-events-none transition-opacity duration-300"
      style={{ opacity: shown ? 1 : 0 }}
      aria-hidden
    >
      <div className="transition-all duration-500 ease-out" style={{ opacity: shown ? 1 : 0, transform: shown ? 'scale(1)' : 'scale(0.85)' }}>
        <Logo size={72} />
      </div>
      <div
        className="font-display text-lg text-[#F3EEDF] transition-all duration-500 ease-out delay-100"
        style={{ opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(4px)' }}
      >
        ClaudeFit
      </div>
    </div>
  )
}

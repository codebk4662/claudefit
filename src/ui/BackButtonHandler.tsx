import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { ConfirmModal } from './common'

/**
 * 안드로이드 하드웨어 뒤로가기 버튼을 앱 내비게이션에 연결한다.
 * 더 돌아갈 화면이 있으면 이전 화면으로, 더 없으면(앱의 첫 화면) 종료 확인을 띄운다.
 * 네이티브(안드로이드) 환경에서만 동작 — 웹/PWA는 브라우저 자체 뒤로가기를 그대로 쓴다.
 */
export function BackButtonHandler() {
  const navigate = useNavigate()
  const [confirmExit, setConfirmExit] = useState(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
      if (idx > 0) {
        navigate(-1)
      } else {
        setConfirmExit(true)
      }
    })

    return () => {
      listenerPromise.then((handle) => handle.remove())
    }
  }, [navigate])

  if (!confirmExit) return null

  return (
    <ConfirmModal
      title="ClaudeFit을 종료할까요?"
      description="학습 진도는 기기에 그대로 저장되어 있어요."
      confirmLabel="종료"
      cancelLabel="취소"
      onCancel={() => setConfirmExit(false)}
      onConfirm={() => CapacitorApp.exitApp()}
    />
  )
}

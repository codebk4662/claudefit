import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 로고/영문 헤딩용 세리프(라틴) + 한글 헤딩용 세리프 + 본문/UI용 산세리프 — 전부 오프라인 번들(PWA/APK 둘 다 네트워크 불필요)
import '@fontsource-variable/fraunces/wght.css'
import '@fontsource/noto-serif-kr/korean-500.css'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

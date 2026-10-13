import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.ccdojo.app',
  appName: 'ClaudeFit',
  webDir: 'dist',
  // 콜드 스타트 중 흰 화면 대신 앱의 다크 배경이 먼저 보이도록 — 네이티브 스플래시 색은
  // @capacitor/assets가 assets/splash*.png로 따로 생성한다(아이콘 생성 스크립트 참고).
  backgroundColor: '#14130f',
}

export default config


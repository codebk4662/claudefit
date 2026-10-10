import { Haptics, ImpactStyle } from '@capacitor/haptics'

/** 네이티브가 아닌 환경(PWA/웹 프리뷰)에서는 플러그인 호출이 실패할 수 있으니 항상 조용히 무시한다. */
function safe(fn: () => Promise<unknown>) {
  fn().catch(() => {})
}

/** 메뉴·항목 진입 등 가벼운 내비게이션 피드백 */
export function hapticSelect() {
  safe(() => Haptics.impact({ style: ImpactStyle.Light }))
}

/** 정답/통과/단계 진행 — 중간 세기로 한 번 */
export function hapticSuccess() {
  safe(() => Haptics.impact({ style: ImpactStyle.Medium }))
}

/** 오답/실패 — 짧게 연속 두 번 */
export function hapticFailure() {
  safe(async () => {
    await Haptics.impact({ style: ImpactStyle.Light })
    await new Promise((r) => setTimeout(r, 90))
    await Haptics.impact({ style: ImpactStyle.Light })
  })
}

# 플레이스토어 등록 에셋 (Ready to use)

[PLAYSTORE.md](../PLAYSTORE.md) 체크리스트에 맞춰 바로 업로드할 수 있게 준비한 파일들입니다.

| 파일 | 용도 | 비고 |
|---|---|---|
| `app-release.aab` | 패키지 업로드 | 서명 완료. **.gitignore 대상 — 저장소엔 없고 로컬에만 있음.** 재생성: `npm run build && npx cap sync android && cd android && ./gradlew bundleRelease` |
| `icon-512.png` | 앱 아이콘 | 512×512, 알파 채널 없음 |
| `feature-graphic.png` | 피처 그래픽 | 1024×500, 알파 채널 없음 |
| `screenshots/01-dashboard.png` ~ `05-docs.png` | 휴대폰 스크린샷 | 1080×1920, 알파 채널 없음. 대시보드 / 실습(터미널) / 학습 트랙 / 데일리 드릴 / 원문 라이브러리 순서. 헤드라인 카피를 입힌 마케팅용 합성본 — 원본 캡처는 `screenshots/raw/`에 보관 |
| `short-description.txt` | 짧은 설명 | 49자 (80자 제한) |
| `long-description.txt` | 긴 설명 | 978자 (4000자 제한) |

## 개인정보처리방침
[`../docs/privacy.html`](../docs/privacy.html)로 작성해 GitHub Pages로 올리도록 준비했습니다. 저장소 Settings → Pages → Source를 "Deploy from a branch", Branch를 `main` / `/docs`로 설정하면 아래 URL이 생성됩니다.

```
https://codebk4662.github.io/claudefit/privacy.html
```

**업로드 전에 `docs/privacy.html` 맨 아래 "문의" 섹션의 이메일 플레이스홀더를 실제 연락처로 바꿔주세요.**

## 스크린샷 재생성
원본은 `screenshots/raw/`(에뮬레이터로 캡처한 1080×2400 날것)에 보관되어 있고, `node scripts/generate-screenshot-marketing.mjs` → `npm run process:screenshots`로 헤드라인 카피가 입혀진 1080×1920(9:16) 최종본을 다시 만듭니다. 헤드라인 문구는 `scripts/generate-screenshot-marketing.mjs`의 `SLIDES` 배열에서 수정하세요.

## 아직 사람이 직접 해야 하는 것
- Play Console 개발자 계정 등록 ($25)
- 스토어 등록정보 화면에 위 파일들 업로드
- 콘텐츠 등급 설문 / 데이터 안전 양식 응답 (PLAYSTORE.md 참고)
- GitHub Pages 활성화 (위 3단계)

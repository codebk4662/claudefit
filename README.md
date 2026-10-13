# 💪 ClaudeFit — Claude Code 학습 트레이닝

[Claude Code 공식 문서](https://code.claude.com/docs/ko/overview)를 **이론 → 실습 → 반복 복습**으로 체득하는 학습 앱. 웹(PWA)과 안드로이드 네이티브 앱(Capacitor) 둘 다로 쓸 수 있다.

- **원문 라이브러리**: 공식 문서 한국어판 220페이지를 로컬에 캐시해 전문 검색 (한글 음절 n-gram 토크나이저)
- **학습 트랙**: 5개 트랙 · 38개 모듈 (입문 → 일상 사용 → 커스터마이즈 → 자동화·병렬 → 숙련·운영)
- **퀴즈**: 모듈마다 객관식·복수선택·순서배열 문항, 오답 시 원문 앵커 링크로 해설
- **브라우저 터미널 시뮬레이터**: 실제 Claude Code CLI를 스크립트로 흉내낸 9개 시나리오(첫 세션, 권한 모드, plan 승인, 세션 관리, 체크포인트, git, 코드 리뷰, 진단…)
- **ConfigForge**: `settings.json` / `CLAUDE.md` / `SKILL.md` / 서브에이전트 / `.mcp.json` / 훅 출력을 실제로 작성하고 즉시 채점받는 8개 과제
- **데일리 드릴**: SM-2 축약형 간격 반복 + 약점 스킬 우선 추천
- **대시보드**: 스킬별 숙련도 미터, 진도 내보내기/가져오기 (localStorage 유실 대비)
- **디자인**: 딥 차콜 + 샴페인 골드 팔레트, 로고/헤딩은 세리프(Fraunces + 한글은 Noto Serif KR), 본문은 Inter — 전부 오프라인 번들
- **모바일**: 반응형 레이아웃 + 네이티브 느낌의 하단 탭바, safe-area 대응, 16px 미만 입력 폰트로 인한 자동 확대 방지

## 시작하기

```bash
npm install
npm run dev     # 최초 실행 시 문서 캐시가 없으면 자동으로 npm run sync:docs 를 먼저 실행합니다
```

`http://localhost:5173`에서 열립니다. 네트워크 없이 쓰려면 `npm run build && npm run preview`로 정적 빌드를 서빙하세요(PWA라 설치 후 오프라인도 됩니다).

## 스크립트

| 명령 | 역할 |
| - | - |
| `npm run dev` | 개발 서버 (최초 1회 `sync:docs` 자동 실행) |
| `npm run build` | 타입체크 + 정적 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과물을 로컬에서 서빙 |
| `npm test` / `npm run test:watch` | Vitest 단위·스모크 테스트 |
| `npm run sync:docs` | 공식 문서를 다시 받아 `public/content/`에 캐시 (갱신용) |
| `npm run check:refs` | 커리큘럼의 모든 원문 참조(docRef)가 실제로 존재하는지 검증 |
| `npm run lint` | oxlint |
| `npm run gen:icons` | 로고(`assets/icon-*.svg`)로부터 파비콘/PWA/Apple touch icon/Capacitor 스플래시 PNG 재생성 |
| `npm run cap:sync` | 빌드 후 안드로이드 네이티브 프로젝트에 웹 자산 반영 |
| `npm run cap:open` | 안드로이드 프로젝트를 Android Studio에서 열기 |
| `npm run cap:run` | 빌드 → 동기화 → 연결된 기기/에뮬레이터에 설치·실행 |

`public/content/`는 **재배포하지 않습니다** (`.gitignore` 대상) — 원문은 항상 출처 링크(© Anthropic)와 함께 표시되고, 각자 `npm run sync:docs`로 받습니다. 문서가 바뀌면 다시 동기화한 뒤 `npm run check:refs`로 끊긴 참조가 있는지 꼭 확인하세요.

## 구조

```
scripts/           fetch-docs.mjs(문서 동기화) · check-refs.mjs(참조 검증) · ensure-docs.mjs
public/content/    동기화된 문서 캐시 (gitignored) — docs-index.json, docs/*.md, search-corpus.json
src/
  curriculum/      모듈·문항·실습 데이터 (types, tracks, skills, modules/, items/, labs/, registry.ts)
  engine/          순수 로직 — terminal(파서/판정/VFS), forge(채점), srs, mastery, scheduler, search, quizGrade
  store/           zustand + persist 진도 저장소
  lib/             문서 클라이언트, 검색 인덱스 훅
  ui/              공통 컴포넌트 (Layout, Card, CodeEditor, MasteryBar …)
  features/        페이지 (dashboard, learn, quiz, terminal, forge, docs, drill)
tests/             엔진 단위 테스트 + 페이지 렌더 스모크 테스트 (Vitest + Testing Library)
```

## 안드로이드 앱 (Capacitor)

이 PC에 설치되어 구성이 끝난 상태입니다: Temurin JDK 17 + 21(Capacitor 8의 Android 모듈은 21을 요구), Android SDK(`platforms;android-36`, `build-tools;36.1.0`), `android/` 네이티브 프로젝트, 릴리스 서명 keystore까지 전부 로컬에 있습니다.

```bash
# 매번 웹을 고친 뒤
npm run cap:sync          # build + npx cap sync android

# 디버그 APK (서명 불필요, 사이드로드/테스트용)
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk

# 릴리스 AAB + APK (서명됨, keystore.properties 필요)
cd android && ./gradlew bundleRelease assembleRelease
# → android/app/build/outputs/bundle/release/app-release.aab   (Play 스토어 제출용)
# → android/app/build/outputs/apk/release/app-release.apk      (사이드로드/테스트용)
```

Gradle에는 `JAVA_HOME`이 JDK 21을 가리켜야 합니다:
```bash
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.12.101-hotspot"
export ANDROID_HOME="/c/Users/$USER/AppData/Local/Android/Sdk"
```

**서명 키**: `android/cc-dojo-release.keystore` + `android/keystore.properties`(비밀번호 포함) 둘 다 `.gitignore` 대상입니다. **분실하면 이 앱을 이후 영원히 업데이트할 수 없으니** 지금 바로 비밀번호 관리자 등 안전한 곳에 백업하세요.

**실기기/에뮬레이터 테스트**: `adb install android/app/build/outputs/apk/debug/app-debug.apk` 후 기기에서 실행하거나, `npm run cap:open`으로 Android Studio를 열어 에뮬레이터를 띄우세요. 이 머신은 Windows Hyper-V/WHPX(가상화 가속)가 꺼져 있어 x86_64 에뮬레이터가 바로 뜨지 않습니다 — 관리자 권한으로 "Windows 기능 켜기/끄기"에서 **Windows Hypervisor Platform**을 켜고 재부팅하면 해결됩니다.

**플레이스토어 제출**: [PLAYSTORE.md](./PLAYSTORE.md)에 개발자 계정부터 스토어 등록정보까지 사용자가 직접 해야 하는 항목을 체크리스트로 정리해 두었습니다. 패키지 ID는 `com.ccdojo.app`이며, 한 번 업로드하면 영구 고정됩니다.

## 현재 범위와 다음 단계

38개 모듈 전체의 요약·목표·원문 근거, 약 95개 퀴즈 문항, 터미널 시나리오 9개, ConfigForge 과제 8개가 들어 있고 전부 동작합니다. 모든 `docRef`는 `check-refs`로 실제 문서 앵커와 대조해 검증했습니다.

자연스러운 다음 확장(계획서의 M5 범위):
- 터미널 시나리오·ConfigForge 과제를 각 12개/14개로 보강 (플러그인, Agent SDK, 엔터프라이즈 배포 쪽)
- T3~T5 모듈의 문항 수를 모듈당 6~10개로 확충
- JS 번들 코드 스플리팅 (현재 단일 번들 ~1.3MB, CodeMirror/react-markdown이 비중 큼)
- 실기기/에뮬레이터에서의 실제 화면 확인 (Hyper-V/WHPX 활성화 필요 — 위 안드로이드 섹션 참고)

원문은 이미 220페이지 전체가 `/docs`에서 검색·열람 가능하므로, "모듈이 아직 없다"가 "접근할 수 없다"를 뜻하지는 않습니다.

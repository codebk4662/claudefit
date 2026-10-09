import type { Module } from '../types'

export const T1_MODULES: Module[] = [
  {
    id: 't1-01-overview',
    trackId: 't1-basics',
    order: 1,
    title: 'Claude Code란 무엇인가',
    objectives: [
      'Claude Code가 어떤 종류의 도구인지(에이전트 코딩 도구) 설명할 수 있다',
      '터미널·IDE·데스크톱·웹 중 어떤 환경에서 시작할지 판단할 수 있다',
      'CLAUDE.md, 스킬, 훅, MCP, 서브에이전트가 각각 무엇을 확장하는지 한 줄로 구분할 수 있다',
    ],
    summaryMd: `Claude Code는 코드베이스를 읽고 파일을 편집하고 명령을 실행하는 **에이전트 코딩 도구**다. 터미널 CLI가 기본이지만 VS Code/JetBrains 확장, 데스크톱 앱, claude.ai/code 웹, Slack, CI/CD까지 같은 "엔진"을 공유한다 — 어디서 시작해도 CLAUDE.md·설정·MCP 서버는 그대로 적용된다.

핵심 확장 지점 4가지를 기억해두면 이후 모듈이 쉬워진다:
- **CLAUDE.md** — 프로젝트별 지속 지침 (메모리)
- **스킬(Skills)** — 재사용 가능한 워크플로 패키지
- **MCP** — 외부 도구/데이터 연결
- **훅(Hooks)** — 도구 호출 전후에 셸 명령 자동 실행

터미널을 한 번도 안 써봤다면 데스크톱 앱이나 웹이 더 쉬운 출발점이다.`,
    docRefs: [
      { slug: 'overview', anchor: 'what-you-can-do', label: '할 수 있는 것' },
      { slug: 'overview', anchor: 'use-claude-code-everywhere', label: '모든 곳에서 Claude Code 사용' },
    ],
    skills: ['basics.surfaces'],
    itemIds: ['t1-01-q1', 't1-01-q2', 't1-01-q3'],
    labIds: [],
    prereqs: [],
    estMinutes: 8,
  },
  {
    id: 't1-02-install',
    trackId: 't1-basics',
    order: 2,
    title: '설치·로그인·첫 확인',
    objectives: [
      '플랫폼에 맞는 설치 명령을 고를 수 있다',
      '설치 확인(`claude --version`)과 로그인 방식(구독/Console/엔터프라이즈)을 구분할 수 있다',
      '설치가 실패했을 때 어디서 원인을 찾을지(troubleshoot-install) 안다',
    ],
    summaryMd: `설치는 플랫폼별 한 줄 명령이다. macOS/Linux/WSL은 \`curl -fsSL https://claude.ai/install.sh | bash\`, Windows PowerShell은 \`irm https://claude.ai/install.ps1 | iex\`. 기본 설치는 백그라운드에서 자동 업데이트되지만 Homebrew/WinGet 설치는 수동 업그레이드가 필요하다.

설치 후 \`claude --version\`으로 확인하고, 아무 프로젝트 디렉터리에서 \`claude\`로 첫 세션을 시작한다. 처음 실행하면 로그인을 요구하는데 Claude 구독(Pro/Max/Team/Enterprise), Claude Console(선불 크레딧), 또는 엔터프라이즈 클라우드 제공자 중 하나를 고른다.

막히면 증상(예: \`command not found: claude\`)을 troubleshoot-install의 표에서 그대로 찾는 게 가장 빠르다 — PATH 문제, 네트워크/프록시 차단, 권한 오류가 대부분이다.`,
    docRefs: [
      { slug: 'quickstart', anchor: 'step-1-install-claude-code' },
      { slug: 'quickstart', anchor: 'step-2-start-your-first-session' },
      { slug: 'troubleshoot-install', anchor: 'find-your-error' },
    ],
    skills: ['basics.install'],
    itemIds: ['t1-02-q1', 't1-02-q2', 't1-02-q3'],
    labIds: ['scn-first-session'],
    prereqs: ['t1-01-overview'],
    estMinutes: 10,
  },
  {
    id: 't1-03-agentic-loop',
    trackId: 't1-basics',
    order: 3,
    title: '에이전트 루프: 어떻게 작동하는가',
    objectives: [
      '컨텍스트 수집 → 작업 수행 → 결과 검증 3단계를 설명할 수 있다',
      '모델(추론)과 도구(작용)의 역할 차이를 구분할 수 있다',
      'Claude가 프로젝트에서 자동으로 접근하는 것(파일, 터미널, git, CLAUDE.md)을 나열할 수 있다',
    ],
    summaryMd: `Claude에게 작업을 주면 **컨텍스트 수집 → 작업 수행 → 결과 검증**을 반복한다. 이 세 단계를 돌리는 것이 "에이전트 루프"이고, 루프는 추론하는 **모델**과 작용하는 **도구** 두 요소로 구동된다. 도구가 없으면 Claude는 텍스트로만 답할 수 있다 — 도구가 있어야 파일을 읽고, 편집하고, 명령을 실행하고, 웹을 검색할 수 있다.

디렉터리에서 \`claude\`를 실행하면 자동으로 접근하는 것: 프로젝트 파일, 터미널(실행 가능한 모든 명령), git 상태, CLAUDE.md, 자동 메모리. 이게 "전체 코드베이스를 보고 작업한다"는 말의 실체다 — 인라인 어시스턴트처럼 현재 파일만 보는 게 아니다.

언제든 중단해서 방향을 바꿀 수 있다: 이것도 루프의 일부다.`,
    docRefs: [
      { slug: 'how-claude-code-works', anchor: 'the-agentic-loop' },
      { slug: 'how-claude-code-works', anchor: 'what-claude-can-access' },
    ],
    skills: ['basics.how-it-works'],
    itemIds: ['t1-03-q1', 't1-03-q2', 't1-03-q3'],
    labIds: [],
    prereqs: ['t1-01-overview'],
    estMinutes: 10,
  },
  {
    id: 't1-04-interactive-basics',
    trackId: 't1-basics',
    order: 4,
    title: '대화형 모드 기본 조작',
    objectives: [
      '`/`, `!`, `@` 세 접두사가 각각 무엇을 트리거하는지 구분할 수 있다',
      'Shift+Tab으로 권한 모드를 순환시킬 수 있다',
      'Esc(중단)와 Esc Esc(되감기 메뉴)의 차이를 안다',
    ],
    summaryMd: `세 가지 입력 접두사를 외워두면 하루 사용의 80%가 편해진다:
- \`/\` — 명령/스킬 (예: \`/init\`, \`/clear\`)
- \`!\` — 셸 모드. Claude를 거치지 않고 명령을 직접 실행하고 출력을 대화에 추가
- \`@\` — 파일 경로 멘션 (자동완성 트리거)

**Shift+Tab**은 권한 모드를 순환한다(\`default → acceptEdits → plan\`, 사용 가능하면 \`bypassPermissions\`·\`auto\`도 순환에 포함). **Esc**는 현재 응답/도구 호출을 중단하고, **Esc를 두 번** 누르면(입력이 비어 있을 때) 되감기 메뉴가 열려 코드·대화를 이전 지점으로 복원할 수 있다.

작업 중에도 메시지를 입력하고 Enter를 누르면 큐에 쌓여 현재 턴이 끝난 뒤(또는 도구 호출 사이) 전달된다 — Claude를 멈추지 않고 방향을 추가할 수 있다.`,
    docRefs: [
      { slug: 'interactive-mode', anchor: 'keyboard-shortcuts' },
      { slug: 'interactive-mode', anchor: 'shell-mode-with-prefix' },
      { slug: 'interactive-mode', anchor: 'queue-messages-while-claude-works' },
    ],
    skills: ['basics.interactive-mode'],
    itemIds: ['t1-04-q1', 't1-04-q2', 't1-04-q3', 't1-04-q4'],
    labIds: ['scn-permission-cycle'],
    prereqs: ['t1-02-install'],
    estMinutes: 12,
  },
  {
    id: 't1-05-context-window',
    trackId: 't1-basics',
    order: 5,
    title: '컨텍스트 윈도우 기초',
    objectives: [
      '컨텍스트 윈도우에 자동으로 들어가는 항목들을 나열할 수 있다',
      '컨텍스트가 채워질 때 Claude Code가 하는 일(압축)을 설명할 수 있다',
      '`/context`로 공간 사용을 확인하는 습관을 설명할 수 있다',
    ],
    summaryMd: `컨텍스트 윈도우에는 시스템 프롬프트, 자동 메모리, CLAUDE.md, 로드된 스킬 설명, 대화 기록, 파일 읽기 결과, 도구 출력이 쌓인다. 파일 읽기가 보통 가장 큰 비중을 차지한다 — 프롬프트를 구체적으로 쓰면(어떤 파일인지 지정) Claude가 덜 읽는다.

한계에 가까워지면 Claude Code는 먼저 **오래된 도구 출력을 지우고**, 필요하면 **대화를 요약(압축)**한다. 요청과 핵심 코드 스니펫은 유지되지만 초반의 자세한 지침은 손실될 수 있다 — 그래서 지속적인 규칙은 CLAUDE.md에 넣어야 한다. \`/compact focus on X\`처럼 포커스를 줄 수도 있다.

\`/context\`를 실행하면 색상 그리드로 지금 뭐가 공간을 쓰고 있는지 보여준다. 세션이 느려지거나 응답이 이상해지면 가장 먼저 확인할 명령이다.`,
    docRefs: [
      { slug: 'how-claude-code-works', anchor: 'the-context-window' },
      { slug: 'context-window', anchor: 'when-your-context-fills-up' },
      { slug: 'commands', anchor: 'all-commands', label: '/context, /compact' },
    ],
    skills: ['basics.context-window'],
    itemIds: ['t1-05-q1', 't1-05-q2', 't1-05-q3'],
    labIds: [],
    prereqs: ['t1-03-agentic-loop'],
    estMinutes: 10,
  },
  {
    id: 't1-06-work-effectively',
    trackId: 't1-basics',
    order: 6,
    title: '효과적으로 대화하기',
    objectives: [
      '"완벽한 프롬프트" 없이 반복으로 개선하는 흐름을 설명할 수 있다',
      '지시(dictate) 대신 위임(delegate)하는 프롬프트 스타일을 구분할 수 있다',
      '중단 후 조종(Esc vs 메시지 입력)을 상황에 맞게 고를 수 있다',
    ],
    summaryMd: `Claude Code는 대화형이다 — 완벽한 프롬프트가 필요 없다. "로그인 버그 수정"으로 시작했다가 "문제는 세션 처리에 있다"처럼 보정해도 된다. 처음이 안 맞아도 다시 시작할 필요 없이 반복하면 된다.

**지시하지 말고 위임하라**: 읽을 파일이나 실행할 명령을 일일이 지정하지 말고, 맥락과 방향을 주고 세부사항은 Claude가 찾게 한다. "체크아웃 흐름이 만료된 카드를 가진 사용자에게 손상됐다. \`src/payments/\`를 조사하고 고칠 수 있나?"처럼.

방향을 바꿀 땐 두 선택이 있다: **Esc**는 즉시 중단(실행 중 도구 호출 취소), **수정 사항을 입력 후 Enter**는 중단 없이 큐에 메시지를 추가해 현재 작업을 끝낸 뒤 반영한다.`,
    docRefs: [
      { slug: 'how-claude-code-works', anchor: 'work-effectively-with-claude-code' },
      { slug: 'quickstart', anchor: 'pro-tips-for-beginners' },
    ],
    skills: ['basics.how-it-works', 'basics.interactive-mode'],
    itemIds: ['t1-06-q1', 't1-06-q2'],
    labIds: [],
    prereqs: ['t1-04-interactive-basics'],
    estMinutes: 8,
  },
]

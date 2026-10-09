import type { Module } from '../types'

export const T5_MODULES: Module[] = [
  {
    id: 't5-01-prompt-caching',
    trackId: 't5-mastery',
    order: 1,
    title: '컨텍스트 경제학: 프롬프트 캐싱',
    objectives: [
      '프롬프트 캐싱이 무엇을 재사용해서 비용·속도를 아끼는지 설명할 수 있다',
      '모델 전환·effort 변경이 캐시를 깨는 이유를 안다',
      '`/compact`가 캐시에 어떤 영향을 주는지 안다',
    ],
    summaryMd: `Claude Code는 대화의 앞부분(시스템 프롬프트, CLAUDE.md, 지금까지의 턴)을 서버에 캐시해두고 재사용한다 — 매 턴마다 전체를 다시 계산하지 않으니 더 빠르고 싸다. 캐시는 몇 분의 수명을 가지며 세션이 쉬는 동안 만료될 수 있다.

**캐시를 깨는 동작**: 모델 전환, effort 수준 변경, 오래된 대화를 재개(캐시 만료 후). **캐시를 유지하는 동작**: 같은 모델로 계속 턴을 주고받기. \`/compact\`는 대화를 요약하므로 그 이후엔 새 캐시가 쌓이기 시작한다 — 압축 직후 첫 응답이 느리게 느껴지는 이유다.

실무 팁: 모델/effort를 턴 중간에 자주 바꾸면 캐시 적중률이 떨어져 체감 속도와 비용에 영향을 준다. \`/context\`로 상태를 보고 불필요한 전환을 줄이자.`,
    docRefs: [
      { slug: 'prompt-caching', anchor: 'actions-that-invalidate-the-cache' },
      { slug: 'prompt-caching', anchor: 'actions-that-keep-the-cache' },
    ],
    skills: ['mastery.prompt-caching'],
    itemIds: ['t5-01-q1', 't5-01-q2'],
    labIds: [],
    prereqs: ['t1-05-context-window'],
    estMinutes: 10,
  },
  {
    id: 't5-02-large-codebases',
    trackId: 't5-mastery',
    order: 2,
    title: '대규모 코드베이스·모노레포',
    objectives: [
      '디렉터리별로 CLAUDE.md를 층층이 두는 전략을 설명할 수 있다',
      '경로별 규칙(`.claude/rules/`)이 특정 디렉터리를 읽을 때만 로드되는 것을 안다',
      '모노레포에서 worktree/스코프를 좁히는 이유를 안다',
    ],
    summaryMd: `모노레포에서는 루트 CLAUDE.md 하나로 모든 패키지의 맥락을 다 담으면 컨텍스트가 금방 찬다. 대신 **디렉터리별로 CLAUDE.md를 중첩**해서, Claude가 지금 작업 중인 하위 디렉터리의 지침만 로드되게 한다.

**경로별 규칙**(\`.claude/rules/*.md\`에 \`paths:\` 패턴)은 해당 경로의 파일을 실제로 읽을 때만 자동으로 로드된다 — "항상 켜진 지침"이 아니라 "필요할 때만 켜지는 지침"인 셈이다. 패키지별 스킬도 같은 원리다.

패키지 몇 개에만 걸치는 변경이라면 Claude가 전체 모노레포를 뒤지지 않도록 작업 범위를 좁게 지정하거나(스코프 worktree), 처음 \`claude\`를 실행하는 디렉터리를 그 패키지 하위로 두는 게 효율적이다.`,
    docRefs: [
      { slug: 'large-codebases', anchor: 'layer-claude-md-files-by-directory' },
      { slug: 'large-codebases', anchor: 'reduce-what-claude-reads' },
    ],
    skills: ['mastery.large-codebases'],
    itemIds: ['t5-02-q1', 't5-02-q2'],
    labIds: [],
    prereqs: ['t2-06-memory'],
    estMinutes: 10,
  },
  {
    id: 't5-03-costs',
    trackId: 't5-mastery',
    order: 3,
    title: '비용·사용량 관리',
    objectives: [
      '`/usage`로 세션 비용과 플랜 한도를 확인할 수 있다',
      '토큰 사용을 줄이는 레버(컨텍스트 관리, 모델 선택, effort) 3가지를 안다',
      '긴 세션에서 사용량이 늘어나는 이유를 설명할 수 있다',
    ],
    summaryMd: `\`/usage\`(별칭 \`/cost\`, \`/stats\`)는 세션 비용, 플랜 사용 한도, 활동 통계를 보여준다. 토큰 사용을 줄이는 세 가지 레버: ① **컨텍스트 관리** — 불필요한 파일을 읽지 않도록 구체적으로 지시, 주기적 \`/compact\`; ② **모델 선택** — 간단한 작업엔 더 작은/빠른 모델; ③ **effort 수준** — 쉬운 작업엔 \`low\`.

세션이 길어질수록 사용량이 느는 이유는 컨텍스트가 쌓여 매 턴의 "읽어야 할 양"이 늘기 때문이다(캐시가 비용을 줄여도 신규 입력 토큰은 계속 쌓임). 팀 단위로는 지출 한도를 설정하고 분석 대시보드로 채택 현황을 추적할 수 있다.`,
    docRefs: [
      { slug: 'costs', anchor: 'track-your-costs' },
      { slug: 'costs', anchor: 'reduce-token-usage' },
    ],
    skills: ['mastery.costs'],
    itemIds: ['t5-03-q1', 't5-03-q2'],
    labIds: [],
    prereqs: ['t5-01-prompt-caching'],
    estMinutes: 8,
  },
  {
    id: 't5-04-sandboxing',
    trackId: 't5-mastery',
    order: 4,
    title: '샌드박스·보안 기초',
    objectives: [
      '기본 제공 샌드박스가 셸 명령의 파일/네트워크 접근을 어떻게 제한하는지 안다',
      '샌드박스와 권한 모드가 독립적으로 작동하며 결합된다는 것을 안다',
      '격리가 더 필요할 때(컨테이너/VM) bypassPermissions를 쓰는 이유를 안다',
    ],
    summaryMd: `기본 제공 **샌드박스 Bash 도구**는 셸 명령이 접근할 수 있는 파일과 네트워크 호스트를 제한한다 — 권한 모드가 "묻는지 여부"를 결정하는 것과 달리, 샌드박스는 "실행됐을 때 실제로 어디까지 닿을 수 있는지"를 결정한다. 둘은 독립적으로 작동하고 결합된다.

예: \`acceptEdits\` 모드(묻지 않고 편집)에 샌드박스를 켜두면, 편집은 자동 승인되지만 셸 명령은 여전히 지정된 파일·네트워크 경계 안에서만 실행된다 — 심층 방어(defense in depth)다.

\`bypassPermissions\`처럼 거의 모든 프롬프트를 건너뛰는 모드는 **격리된 컨테이너나 VM**에서만 써야 한다. 이게 깨지면(호스트에서 직접 실행) Claude가 손상을 일으킬 반경이 넓어진다.`,
    docRefs: [
      { slug: 'sandboxing', anchor: 'what-the-sandbox-restricts' },
      { slug: 'sandboxing', anchor: 'how-sandboxing-relates-to-permissions-and-permission-modes' },
    ],
    skills: ['mastery.sandboxing'],
    itemIds: ['t5-04-q1', 't5-04-q2'],
    labIds: [],
    prereqs: ['t2-02-permission-modes'],
    estMinutes: 10,
  },
  {
    id: 't5-05-troubleshooting',
    trackId: 't5-mastery',
    order: 5,
    title: '문제해결·에러 참조',
    objectives: [
      '`/doctor`가 진단하는 범주(설치/설정/확장/CLAUDE.md)를 안다',
      '`/debug`와 `/doctor`의 역할 차이를 구분할 수 있다',
      '증상을 오류 참조 표에서 찾아 수정으로 연결하는 흐름을 안다',
    ],
    summaryMd: `문제가 생겼을 때 3단계로 좁힌다: ① **\`/doctor\`**(별칭 \`/checkup\`) — 설치·설정·확장·CLAUDE.md 문제를 진단하는 설정 점검을 실행하고 수정을 제안; ② **\`/debug\`** — 세션 디버그 로깅을 켜고 런타임 문제(이번 세션에서 지금 일어나는 일)를 진단; ③ **오류 참조**(\`/docs/ko/errors\`) — 정확한 오류 메시지를 표에서 찾아 원인·해결을 바로 확인.

설정이 적용되지 않거나 훅이 안 돌면 "구성 디버깅" 가이드가 \`/context\`, \`/doctor\`, \`/hooks\`, \`/mcp\`로 실제 로드된 항목을 확인하는 순서를 알려준다. 설치/로그인 자체가 안 되면 troubleshoot-install(T1에서 다룸)로 돌아간다 — 이 모듈은 "설치는 됐는데 뭔가 이상할 때"를 위한 것이다.`,
    docRefs: [
      { slug: 'troubleshooting', anchor: '문제-해결' },
      { slug: 'commands', anchor: 'all-commands', label: '/doctor, /debug' },
    ],
    skills: ['mastery.troubleshooting'],
    itemIds: ['t5-05-q1', 't5-05-q2'],
    labIds: ['scn-doctor'],
    prereqs: ['t1-02-install'],
    estMinutes: 10,
  },
  {
    id: 't5-06-best-practices',
    trackId: 't5-mastery',
    order: 6,
    title: '베스트 프랙티스 종합',
    objectives: [
      '"Claude가 스스로 검증할 방법을 주라"는 원칙을 구체적 예로 설명할 수 있다',
      '탐색→계획→코드, 구체적 컨텍스트, 세션 관리 원칙을 하나의 흐름으로 묶을 수 있다',
      '흔한 실패 패턴을 피하는 법을 안다',
    ],
    summaryMd: `이 모듈은 지금까지 배운 걸 묶는다. 핵심 원칙:

1. **Claude가 스스로 검증할 방법을 주라** — 테스트, 린트, 빌드 명령을 알려주면 Claude가 스스로 확인하고 고친다. 검증 수단이 없으면 "될 것 같다"에서 멈춘다.
2. **탐색 → 계획 → 코드** — 바로 수정을 시키지 말고 먼저 이해시킨다 (T2에서 배운 패턴).
3. **프롬프트에 구체적 컨텍스트를** — 파일 경로, 증상, 제약을 구체적으로 (T2 파일 참조 모듈과 연결).
4. **환경을 구성하라** — CLAUDE.md, 권한 규칙, 훅을 미리 세팅해두면 매번 설명할 필요가 없다.
5. **세션을 관리하라** — 적절히 \`/clear\`, \`/compact\`, 서브에이전트로 컨텍스트를 깨끗하게 유지한다.
6. **자동화하고 확장하라** — 반복되는 건 스킬·훅·워크플로로 옮긴다.

흔한 실패 패턴: 애매한 요청으로 "버그 고쳐줘"만 던지기, 검증 없이 큰 변경을 한 번에 승인하기, CLAUDE.md를 비대하게 키워 컨텍스트를 낭비하기.`,
    docRefs: [
      { slug: 'best-practices', anchor: 'give-claude-a-way-to-verify-its-work' },
      { slug: 'best-practices', anchor: 'avoid-common-failure-patterns' },
    ],
    skills: ['mastery.best-practices'],
    itemIds: ['t5-06-q1', 't5-06-q2'],
    labIds: [],
    prereqs: ['t2-09-common-workflows'],
    estMinutes: 10,
  },
  {
    id: 't5-07-plugins',
    trackId: 't5-mastery',
    order: 7,
    title: '플러그인 입문',
    objectives: [
      '플러그인이 스킬/훅/MCP 서버/서브에이전트를 한 묶음으로 배포하는 단위라는 것을 안다',
      '독립형 스킬 대신 플러그인이 필요한 경우를 구분할 수 있다',
      '`/plugin install`로 마켓플레이스에서 설치하는 흐름을 안다',
    ],
    summaryMd: `플러그인은 스킬·훅·MCP 서버·서브에이전트·명령을 **하나의 배포 단위**로 묶는다. 독립형 스킬 하나로 충분하면 플러그인은 과하다 — 여러 컴포넌트를 함께 배포하고, 버전을 관리하고, 팀/조직 전체에 마켓플레이스로 공급해야 할 때 플러그인을 쓴다.

설치는 \`/plugin\`(인수 없이 실행하면 메뉴, \`install\`/\`list\`/\`enable\`/\`disable\` 하위 명령도 직접 실행 가능)으로 한다. Anthropic의 공식/커뮤니티/데모 마켓플레이스에서 바로 찾아볼 수 있다. 설치 범위(이 프로젝트만 vs 이 사용자 전체)도 선택할 수 있다.

조직 차원에서는 관리형 설정으로 허용된 플러그인만 설치되게 제한할 수 있다 — 이건 엔터프라이즈 배포 영역이라 이 트랙에서는 입문만 다룬다.`,
    docRefs: [
      { slug: 'plugins/install', anchor: '플러그인-설치-및-관리', label: '플러그인 설치 및 관리' },
      { slug: 'plugins/install', anchor: 'install-a-plugin' },
    ],
    skills: ['mastery.plugins'],
    itemIds: ['t5-07-q1'],
    labIds: [],
    prereqs: ['t3-04-skills'],
    estMinutes: 8,
  },
]

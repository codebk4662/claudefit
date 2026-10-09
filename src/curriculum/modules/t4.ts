import type { Module } from '../types'

export const T4_MODULES: Module[] = [
  {
    id: 't4-01-cli-headless',
    trackId: 't4-automation',
    order: 1,
    title: 'CLI·headless 실행',
    objectives: [
      '`claude -p`로 일회성 쿼리를 실행하고 종료하는 흐름을 안다',
      '`--output-format stream-json`이 왜 스크립트 연동에 쓰이는지 이해한다',
      '대화형 세션과 headless 실행의 권한 모드 차이를 안다',
    ],
    summaryMd: `\`claude -p "query"\`는 대화형 모드 없이 쿼리를 실행하고 결과만 출력한 뒤 종료한다 — 스크립트·CI에서 Claude Code를 호출하는 기본 형태다. \`claude -c\`는 현재 디렉터리의 가장 최근 대화를 이어가고, \`claude -r\`은 이전 대화를 재개한다.

headless 실행은 Agent SDK 기반이며 \`--output-format stream-json --verbose\`로 도구 호출과 결과를 구조화된 JSON 스트림으로 받을 수 있다 — 다른 프로그램이 Claude의 진행 상황을 파싱해서 처리하기 좋다.

headless/\`-p\` 세션은 대화형 세션과 기본 권한 모드가 다를 수 있다(기능 플래그를 못 가져오는 세션은 버전에 따라 \`default\` 또는 \`auto\`). CI처럼 무인 실행이면 \`--permission-mode dontAsk --allowedTools "..."\`로 명시적 허용목록을 주는 게 안전하다.`,
    docRefs: [
      { slug: 'cli-reference', anchor: 'cli-flags' },
      { slug: 'headless', anchor: 'basic-usage' },
    ],
    skills: ['automation.cli-headless'],
    itemIds: ['t4-01-q1', 't4-01-q2'],
    labIds: [],
    prereqs: ['t2-02-permission-modes'],
    estMinutes: 10,
  },
  {
    id: 't4-02-scripting',
    trackId: 't4-automation',
    order: 2,
    title: '파이프·스크립트 자동화',
    objectives: [
      'Unix 파이프에 Claude Code를 연결하는 패턴(`... | claude -p "..."`)을 안다',
      '대량 파일 작업을 `git diff --name-only | claude -p ...`로 구성할 수 있다',
      '이런 자동화가 왜 "headless" 권한 설계가 필요한지 안다',
    ],
    summaryMd: `Claude Code는 Unix 철학을 따르므로 다른 도구와 파이프로 연결된다:

\`\`\`bash
tail -200 app.log | claude -p "Slack me if you see any anomalies"
git diff main --name-only | claude -p "review these changed files for security issues"
\`\`\`

로그 분석, 번역 자동화, 대량 파일 리뷰 같은 반복 작업을 **CI에서 실행**하거나 cron으로 돌릴 수 있다. 이런 무인 실행에서는 대화형 승인 UI가 없으므로 \`--permission-mode\`와 \`--allowedTools\`로 사전에 범위를 좁혀야 한다 — 권한 모드 모듈(T2)의 \`dontAsk\`가 여기서 실전 쓰임을 갖는다.`,
    docRefs: [{ slug: 'overview', anchor: 'what-you-can-do' }],
    skills: ['automation.scripting'],
    itemIds: ['t4-02-q1', 't4-02-q2'],
    labIds: [],
    prereqs: ['t4-01-cli-headless'],
    estMinutes: 8,
  },
  {
    id: 't4-03-parallel',
    trackId: 't4-automation',
    order: 3,
    title: '병렬 실행: worktree와 /batch',
    objectives: [
      'git worktree로 세션을 격리하는 이유(파일 충돌 방지)를 안다',
      '`/batch`가 대규모 변경을 독립 단위로 쪼개 병렬 실행한다는 것을 안다',
      '서브에이전트·worktree·에이전트 뷰 중 어떤 걸 언제 쓸지 구분할 수 있다',
    ],
    summaryMd: `같은 저장소에서 여러 Claude 세션을 동시에 돌리면 파일이 충돌한다. **git worktree**는 브랜치별로 별도 디렉터리를 만들어 세션을 격리한다 — \`--worktree\` 플래그나 Claude에게 요청하면 만들어준다.

**\`/batch <지시>\`**는 코드베이스 전반의 대규모 변경(예: "src/를 JavaScript에서 TypeScript로 마이그레이션")을 조사한 뒤 5~30개 독립 단위로 쪼개 계획을 제시하고, 승인하면 각 단위를 격리된 worktree의 백그라운드 서브에이전트가 구현한다.

선택 기준: 부수 작업 하나를 맥락 공유하며 위임 → 서브에이전트/\`/subtask\`. 완전히 분리된 브랜치 작업 → worktree. 전체 코드베이스에 걸친 대량 기계적 변경 → \`/batch\`.`,
    docRefs: [
      { slug: 'worktrees', anchor: 'start-claude-in-a-worktree' },
      { slug: 'agents', anchor: 'choose-an-approach' },
      { slug: 'commands', anchor: 'all-commands', label: '/batch' },
    ],
    skills: ['automation.parallel'],
    itemIds: ['t4-03-q1', 't4-03-q2', 't4-03-q3'],
    labIds: [],
    prereqs: ['t3-05-subagents'],
    estMinutes: 12,
  },
  {
    id: 't4-04-agent-view',
    trackId: 't4-automation',
    order: 4,
    title: '에이전트 뷰로 여러 세션 관리',
    objectives: [
      '`/background`로 현재 세션을 분리해 백그라운드 에이전트로 만들 수 있다',
      '`/tasks`와 에이전트 뷰의 차이(현재 세션의 서브에이전트 vs 전체 세션 목록)를 안다',
      '`/resume`로 실행 중인 백그라운드 세션에 다시 연결할 수 있다',
    ],
    summaryMd: `**에이전트 뷰**는 한 화면에서 여러 Claude Code 세션을 디스패치·모니터링한다 — 어떤 세션이 입력을 기다리는지 한눈에 보인다. \`/background\`(별칭 \`/bg\`)는 현재 세션을 분리해 백그라운드로 보내고 터미널을 비운다. \`/fork\`는 대화를 **복사**해서 새 백그라운드 세션으로 만들고 원래 세션은 계속 쓴다.

\`/tasks\`(별칭 \`/bashes\`)는 **현재 세션 안의** 백그라운드 작업(서브에이전트, 백그라운드 셸)을 보여준다 — 에이전트 뷰의 "여러 세션" 레벨과는 다른 레이어다.

\`/resume\`에서 실행 중인 세션을 선택하면 현재 터미널이 그 세션에 연결된다(현재 대화는 백그라운드로 밀려남). 이 패턴으로 하루 종일 여러 작업을 오가며 관리할 수 있다.`,
    docRefs: [
      { slug: 'agent-view', anchor: 'quick-start' },
      { slug: 'agent-view', anchor: 'monitor-sessions-with-agent-view' },
    ],
    skills: ['automation.agent-view'],
    itemIds: ['t4-04-q1', 't4-04-q2'],
    labIds: [],
    prereqs: ['t2-04-sessions'],
    estMinutes: 10,
  },
  {
    id: 't4-05-dynamic-workflows',
    trackId: 't4-automation',
    order: 5,
    title: '동적 워크플로우',
    objectives: [
      '동적 워크플로가 "Claude가 작성한 스크립트로 여러 서브에이전트를 조율"한다는 것을 안다',
      '언제 워크플로를 쓰고 언제 `/batch`나 단일 서브에이전트로 충분한지 구분할 수 있다',
      '`/workflows`로 실행 중인 워크플로의 진행 상황을 볼 수 있다',
    ],
    summaryMd: `동적 워크플로는 Claude가 작성한 스크립트가 여러 서브에이전트를 조율하는 방식이다 — 코드베이스 감사, 대규모 마이그레이션, 교차 검증 연구처럼 "같은 종류의 작업을 아주 많은 단위에 반복"해야 할 때 쓴다. \`/batch\`보다 더 유연한 커스텀 오케스트레이션이 필요할 때 선택한다(\`/batch\`는 번들된 워크플로 중 하나라고 볼 수 있다).

스크립트는 재실행 가능하고, 실행 중 재개도 지원한다. \`/workflows\`는 실행 중이거나 완료된 워크플로를 감시·일시중지·재개·저장할 수 있는 뷰를 연다.

규모가 작으면(변경 단위 몇 개) 서브에이전트 하나나 \`/batch\`가 더 간단하다 — 워크플로는 "스스로 스크립트를 짜서 오케스트레이션해야 할 만큼" 복잡할 때의 선택이다.`,
    docRefs: [
      { slug: 'workflows', anchor: 'when-to-use-a-workflow' },
      { slug: 'workflows', anchor: 'how-a-workflow-runs' },
    ],
    skills: ['automation.dynamic-workflows'],
    itemIds: ['t4-05-q1', 't4-05-q2'],
    labIds: [],
    prereqs: ['t4-03-parallel'],
    estMinutes: 10,
  },
  {
    id: 't4-06-scheduling',
    trackId: 't4-automation',
    order: 6,
    title: '스케줄: /loop와 routines',
    objectives: [
      '`/loop`(세션 내 반복)와 routines(클라우드 상시 실행)의 차이를 구분할 수 있다',
      '간격을 생략하면 Claude가 스스로 페이스를 조절한다는 것을 안다',
      'routines가 API 호출/GitHub 이벤트로도 트리거될 수 있다는 것을 안다',
    ],
    summaryMd: `**\`/loop [간격] [프롬프트]\`**는 세션이 열려 있는 동안 프롬프트를 반복 실행한다 — 간격을 생략하면 Claude가 스스로 폴링 주기를 조절(동적 페이싱)한다. 예: \`/loop 5m check if the deploy finished\`. 이건 "이 터미널 세션이 살아있는 동안만" 돈다.

**Routines**는 클라우드에서 실행되므로 컴퓨터가 꺼져 있어도 계속된다 — 일정(cron), API 호출, GitHub 이벤트로 트리거할 수 있다. 아침 PR 검토, 야간 CI 실패 분석, 주간 종속성 감사처럼 "컴퓨터와 무관하게 계속돼야 하는" 작업에 맞다. 웹/데스크톱에서 만들거나 CLI에서 \`/schedule\`을 실행해서 만든다.

데스크톱 예약된 작업은 로컬 파일·도구에 직접 접근해야 할 때의 세 번째 옵션이다.`,
    docRefs: [
      { slug: 'scheduled-tasks', anchor: 'compare-scheduling-options' },
      { slug: 'scheduled-tasks', anchor: 'run-a-prompt-repeatedly-with-/loop' },
    ],
    skills: ['automation.scheduling'],
    itemIds: ['t4-06-q1', 't4-06-q2', 't4-06-q3'],
    labIds: [],
    prereqs: ['t4-01-cli-headless'],
    estMinutes: 10,
  },
  {
    id: 't4-07-ci',
    trackId: 't4-automation',
    order: 7,
    title: 'GitHub Actions 연동',
    objectives: [
      '`@claude` 멘션으로 GitHub Actions 워크플로를 트리거하는 흐름을 안다',
      '이슈를 PR로 바꾸는 자동화 사례를 설명할 수 있다',
      '`/install-github-app`이 무엇을 설정해주는지 안다',
    ],
    summaryMd: `GitHub Actions 워크플로에서 Claude Code를 실행하면 \`@claude\` 멘션에 응답하거나, 작업을 자동화하거나, 이슈를 풀 리퀘스트로 바꿀 수 있다. 전형적인 패턴: 이슈나 PR 코멘트에 \`@claude fix this\`를 달면 액션이 트리거되어 Claude Code가 분석하고 커밋을 푸시한다.

\`/install-github-app\`은 저장소에 Claude GitHub App을 설치하고, 필요하면 GitHub Actions 워크플로와 시크릿까지 함께 설정해준다 — github.com 저장소에서만 동작하며, GitLab 저장소라면 대신 GitLab CI/CD 문서를 참고해야 한다.

Amazon Bedrock·Google Cloud·Microsoft Foundry로 Claude API 대신 실행하도록 구성할 수도 있다(클라우드 제공자 연동).`,
    docRefs: [
      { slug: 'github-actions', anchor: 'setup' },
      { slug: 'github-actions', anchor: 'example-use-cases' },
      { slug: 'commands', anchor: 'all-commands', label: '/install-github-app' },
    ],
    skills: ['automation.ci'],
    itemIds: ['t4-07-q1', 't4-07-q2'],
    labIds: [],
    prereqs: ['t2-07-git-flow'],
    estMinutes: 10,
  },
  {
    id: 't4-08-artifacts-channels',
    trackId: 't4-automation',
    order: 8,
    title: '아티팩트·채널·딥링크',
    objectives: [
      '아티팩트가 세션 출력을 claude.ai의 라이브 페이지로 바꾼다는 것을 안다',
      '채널이 외부 이벤트(웹훅/알림)를 실행 중인 세션에 밀어넣는다는 것을 안다',
      '딥링크(`claude-cli://`)로 세션을 바로 열 수 있다는 것을 안다',
    ],
    summaryMd: `**아티팩트**는 Claude Code 작업을 claude.ai의 라이브 인터랙티브 페이지로 변환한다 — 비공개로 두거나 조직과 공유하거나 공개 링크로 게시할 수 있다. 대시보드, 보고서, 작은 도구를 "코드로 결과물을 만들고 바로 페이지로 보여주기"에 적합하다.

**채널**은 MCP 서버를 통해 메시지·알림·웹훅을 실행 중인 세션에 푸시한다 — CI 결과, 채팅 메시지, 모니터링 이벤트를 전달해서 Claude가 자리를 비웠을 때도 반응하게 한다.

**딥링크**(\`claude-cli://...\`)는 URL에서 바로 터미널 세션을 연다 — 런북, 알림, 대시보드에 넣어두면 클릭 한 번으로 올바른 저장소·프롬프트로 Claude Code가 열린다.`,
    docRefs: [
      { slug: 'artifacts', anchor: '세션-출력을-아티팩트로-공유하기', label: '아티팩트 개요' },
      { slug: 'channels', anchor: '채널을-사용하여-실행-중인-세션으로-이벤트-푸시하기', label: '채널 개요' },
      { slug: 'deep-links', anchor: '링크에서-세션-시작하기', label: '딥링크 개요' },
    ],
    skills: ['automation.dynamic-workflows'],
    itemIds: ['t4-08-q1'],
    labIds: [],
    prereqs: ['t4-05-dynamic-workflows'],
    estMinutes: 8,
  },
]

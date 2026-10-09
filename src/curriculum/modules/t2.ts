import type { Module } from '../types'

export const T2_MODULES: Module[] = [
  {
    id: 't2-01-file-refs',
    trackId: 't2-daily',
    order: 1,
    title: '파일·이미지 참조',
    objectives: [
      '`@경로`로 파일을 명시적으로 참조할 수 있다',
      '이미지를 클립보드에서 붙여넣어 참조에 포함할 수 있다',
      '명시적 참조가 Claude의 탐색 범위를 줄여주는 이유를 설명할 수 있다',
    ],
    summaryMd: `\`@\`를 입력하면 파일 경로 자동완성이 뜬다. 특정 파일을 짚어주면 Claude가 코드베이스 전체를 탐색하는 대신 바로 그 파일로 간다 — 컨텍스트도 절약되고 의도도 명확해진다.

이미지는 \`Ctrl+V\`(또는 iTerm2의 \`Cmd+V\`, Windows/WSL의 \`Alt+V\`)로 붙여넣으면 \`[Image #N]\` 칩이 커서에 삽입되어 프롬프트에서 위치별로 참조할 수 있다. 스크린샷으로 버그를 보여주거나 디자인 목업을 전달할 때 유용하다.

"로그인 버그 고쳐줘"보다 "\`@src/payments/checkout.ts\`의 만료 카드 처리 버그 고쳐줘"가 더 빠르고 정확한 결과를 낸다 — 이게 이번 모듈의 핵심 실습 포인트다.`,
    docRefs: [{ slug: 'interactive-mode', anchor: 'keyboard-shortcuts' }],
    skills: ['daily.file-refs'],
    itemIds: ['t2-01-q1', 't2-01-q2'],
    labIds: ['scn-mentions'],
    prereqs: ['t1-04-interactive-basics'],
    estMinutes: 8,
  },
  {
    id: 't2-02-permission-modes',
    trackId: 't2-daily',
    order: 2,
    title: '권한 모드 고르기',
    objectives: [
      'default/acceptEdits/plan/auto/dontAsk/bypassPermissions 6가지 모드를 요청 없이 하는 일 기준으로 구분할 수 있다',
      '상황에 맞는 모드를 고를 수 있다(민감 작업 vs 반복 작업 vs 탐색 vs CI)',
      'Shift+Tab 순환 순서(default → acceptEdits → plan → …)를 안다',
    ],
    summaryMd: `권한 모드는 "Claude가 묻지 않고 할 수 있는 일"의 기준선이다.

| 모드 | 요청 없이 하는 일 |
| - | - |
| \`default\`(Manual) | 읽기만 |
| \`acceptEdits\` | 읽기 + 파일 편집 + \`mkdir\`/\`mv\` 등 일반 파일시스템 명령 |
| \`plan\` | 읽기 + (auto 가능 시) 분류기 승인 명령 — 소스 편집은 안 함 |
| \`auto\` | 분류기가 백그라운드에서 대부분 검토, 위험한 것만 차단 |
| \`dontAsk\` | 읽기 + 사전 승인된 도구만. 프롬프트가 뜰 작업은 전부 거부 |
| \`bypassPermissions\` | 거의 전부. **격리된 컨테이너/VM에서만** 사용 |

**Shift+Tab**으로 \`default → acceptEdits → plan\`을 순환하고, 사용 가능하면 \`bypassPermissions\`·\`auto\`가 그 뒤에 슬롯된다. 민감한 작업·낯선 코드는 Manual, 검토 중인 코드 반복 작업은 acceptEdits, 변경 전 탐색은 plan, CI의 고정된 허용목록은 dontAsk가 자연스럽다.`,
    docRefs: [
      { slug: 'permission-modes', anchor: 'available-modes' },
      { slug: 'permission-modes', anchor: 'switch-permission-modes' },
    ],
    skills: ['daily.permission-modes'],
    itemIds: ['t2-02-q1', 't2-02-q2', 't2-02-q3', 't2-02-q4'],
    labIds: ['scn-permission-cycle', 'scn-plan-approval'],
    prereqs: ['t1-04-interactive-basics'],
    estMinutes: 14,
  },
  {
    id: 't2-03-permission-rules',
    trackId: 't2-daily',
    order: 3,
    title: '권한 규칙으로 세밀하게 제어',
    objectives: [
      'allow/ask/deny 규칙과 평가 순서(deny → ask → allow)를 설명할 수 있다',
      '`Tool(specifier)` 와일드카드 문법으로 규칙을 작성할 수 있다',
      '규칙이 `.claude/settings.local.json`에 저장되는 범위를 안다',
    ],
    summaryMd: `\`/permissions\`로 allow/ask/deny 규칙을 관리한다. 평가 순서는 항상 **deny → ask → allow** — 규칙이 더 구체적이어도 순서를 바꾸지 않는다. 그래서 \`Bash(git push *)\`를 deny에 넣으면 더 좁은 allow 규칙이 있어도 차단된다.

문법은 \`Tool\` 또는 \`Tool(specifier)\`. \`*\`는 와일드카드다:

\`\`\`json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(git commit *)"],
    "deny": ["Bash(git push *)"]
  }
}
\`\`\`

주의: \`*\`는 **부분 명령 뒤**에 둔다. \`Bash(git * main)\`은 \`git merge main\`과도 매칭되어 과하게 넓다. 승인 시 "다시 묻지 않기"를 고르면 Claude Code가 저장소 루트의 \`.claude/settings.local.json\`에 규칙을 저장한다 — 해당 저장소의 이후 모든 세션에 적용된다.`,
    docRefs: [
      { slug: 'permissions', anchor: 'manage-permissions' },
      { slug: 'permissions', anchor: 'permission-rule-syntax' },
      { slug: 'permissions', anchor: 'wildcard-patterns' },
    ],
    skills: ['daily.permission-rules'],
    itemIds: ['t2-03-q1', 't2-03-q2', 't2-03-q3'],
    labIds: ['forge-settings-permissions'],
    prereqs: ['t2-02-permission-modes'],
    estMinutes: 14,
  },
  {
    id: 't2-04-sessions',
    trackId: 't2-daily',
    order: 4,
    title: '세션 관리: resume·branch·fork·clear',
    objectives: [
      '`/clear`, `/resume`, `/branch`, `/fork`의 차이를 구분할 수 있다',
      '세션이 작업 디렉터리/worktree에 연결된다는 것을 이해한다',
      '언제 새 세션(`/clear`) 대신 이어가기(`/resume`)를 쓸지 판단할 수 있다',
    ],
    summaryMd: `세션은 \`~/.claude/projects/\` 아래 JSONL로 저장되고 각 Claude Code 대화는 현재 디렉터리에 연결된다. 네 가지 명령을 구분하자:

- **\`/clear\`** — 프로젝트 메모리는 유지한 채 빈 컨텍스트로 새 대화 시작 (별칭: \`/reset\`, \`/new\`)
- **\`/resume\`** — ID/이름으로 이전 대화를 이어감. 같은 세션 ID로 중단한 지점부터 계속
- **\`/branch\`** — 지금 상태에서 분기를 만들어 다른 방향을 시도 (원본은 보존, 전환됨)
- **\`/fork\`** — 대화를 새 **백그라운드 세션**으로 복사해 계속 (현재 세션은 그대로 유지)

브랜치를 전환하면 Claude는 새 브랜치의 파일을 보지만 대화 기록은 유지된다. 병렬로 여러 브랜치에서 작업하려면 \`git worktree\`로 디렉터리를 분리하는 게 정석이다.`,
    docRefs: [
      { slug: 'sessions', anchor: 'resume-a-session' },
      { slug: 'sessions', anchor: 'branch-a-session' },
      { slug: 'how-claude-code-works', anchor: 'resume-or-fork-sessions' },
    ],
    skills: ['daily.sessions'],
    itemIds: ['t2-04-q1', 't2-04-q2', 't2-04-q3'],
    labIds: ['scn-sessions'],
    prereqs: ['t1-04-interactive-basics'],
    estMinutes: 12,
  },
  {
    id: 't2-05-checkpointing',
    trackId: 't2-daily',
    order: 5,
    title: '체크포인트로 안전하게 되돌리기',
    objectives: [
      '모든 파일 편집이 되돌릴 수 있는 이유(스냅샷)를 설명할 수 있다',
      'Esc Esc(되감기 메뉴)로 코드/대화를 복원할 수 있다',
      '체크포인트가 다루지 않는 것(원격 시스템, git과 별개)을 안다',
    ],
    summaryMd: `Claude가 파일을 편집하기 전에 현재 내용을 스냅샷한다. 그래서 **모든 파일 편집은 되돌릴 수 있다** — 문제가 생기면 \`Esc\`를 두 번 눌러 되감기 메뉴를 열거나 Claude에게 "취소해줘"라고 말하면 된다.

체크포인트는 git과 **분리**되어 있고 대화를 재개해도 계속 사용할 수 있다. 단, 심볼릭/하드 링크 파일은 복원 시 건너뛰고, **원격 시스템에 영향을 주는 작업(DB, API, 배포)은 체크포인트할 수 없다** — 이런 작업은 권한 모드·권한 규칙으로 막아야 한다.

\`/rewind\`(별칭 \`/checkpoint\`, \`/undo\`)는 대화의 특정 지점으로 되돌리거나 그 지점부터 요약할 수도 있다.`,
    docRefs: [
      { slug: 'how-claude-code-works', anchor: 'undo-changes-with-checkpoints' },
      { slug: 'checkpointing', anchor: 'how-checkpoints-work' },
      { slug: 'checkpointing', anchor: 'limitations' },
    ],
    skills: ['daily.checkpointing'],
    itemIds: ['t2-05-q1', 't2-05-q2', 't2-05-q3'],
    labIds: ['scn-rewind'],
    prereqs: ['t2-04-sessions'],
    estMinutes: 10,
  },
  {
    id: 't2-06-memory',
    trackId: 't2-daily',
    order: 6,
    title: 'CLAUDE.md와 자동 메모리',
    objectives: [
      'CLAUDE.md가 세션마다 로드되는 지속 지침이라는 것을 설명할 수 있다',
      'CLAUDE.md와 자동 메모리(MEMORY.md)의 역할 차이를 구분할 수 있다',
      '`/init`과 `/memory`로 CLAUDE.md를 만들고 다듬을 수 있다',
    ],
    summaryMd: `**CLAUDE.md**는 프로젝트 루트에 두는 마크다운 파일로, 모든 세션 시작 시 읽힌다 — 코딩 표준, 아키텍처 결정, 선호 라이브러리, 리뷰 체크리스트를 적어둔다. 저장소에 다른 에이전트용 \`AGENTS.md\`가 이미 있으면 Claude Code는 그것을 대신 읽을 수도 있다.

**자동 메모리**는 Claude가 작업하면서 스스로 기록하는 학습 내용(빌드 명령, 패턴, 피해야 할 실수)이다. \`MEMORY.md\`의 처음 200줄 또는 25KB(먼저 도달하는 쪽)가 세션 시작 시 로드된다. 사람이 안 써도 Claude가 쌓는다는 점이 CLAUDE.md와 가장 큰 차이다.

\`/init\`은 시작 CLAUDE.md를 생성하고, \`/memory\`는 CLAUDE.md를 편집하거나 자동 메모리를 켜고/끄고 검토한다. 200줄 이하로 유지하고, 참고용 긴 내용은 스킬이나 경로별 규칙으로 옮기는 게 좋다.`,
    docRefs: [
      { slug: 'memory', anchor: 'claude-md-vs-auto-memory' },
      { slug: 'memory', anchor: 'auto-memory' },
      { slug: 'memory', anchor: 'view-and-edit-with-/memory' },
    ],
    skills: ['daily.memory'],
    itemIds: ['t2-06-q1', 't2-06-q2', 't2-06-q3'],
    labIds: ['forge-claude-md', 'scn-first-session'],
    prereqs: ['t1-02-install'],
    estMinutes: 14,
  },
  {
    id: 't2-07-git-flow',
    trackId: 't2-daily',
    order: 7,
    title: 'Claude Code로 Git 작업하기',
    objectives: [
      '자연어로 커밋·브랜치·PR 작업을 요청하는 패턴을 익힌다',
      'Claude Code가 커밋에 자동으로 추가하는 속성 라인(Co-Authored-By)을 안다',
      '`attribution`/`includeGitInstructions` 설정으로 이 동작을 바꿀 수 있다는 것을 안다',
    ],
    summaryMd: `대화하듯 git을 쓸 수 있다: "어떤 파일을 변경했지?", "의미 있는 메시지로 커밋해줘", "feature/x 브랜치 만들어줘", "merge conflict 해결 도와줘". Claude Code는 git과 직접 작동하므로 스테이징·커밋 메시지 작성·브랜치 생성·PR 오픈을 한 번에 처리할 수 있다.

Claude Code는 작성하지 않은 규칙도 따른다 — 예를 들어 커밋에 \`Co-Authored-By\` 트레일러를 자동으로 붙인다. 이런 속성 라인은 시스템 알림에서 나오며, \`attribution\` 설정으로 바꾸거나 \`includeGitInstructions: false\`로 기본 git 지침 자체를 끌 수 있다.

실무 팁: 복잡한 git 작업(리베이스, 충돌 해결)도 설명만 하면 되고, 정확한 git 명령을 몰라도 된다 — 이게 "지시하지 말고 위임하라"의 좋은 예다.`,
    docRefs: [
      { slug: 'overview', anchor: 'what-you-can-do' },
      { slug: 'how-claude-code-works', anchor: 'context-claude-code-adds-on-its-own' },
      { slug: 'quickstart', anchor: 'step-5-use-git-with-claude-code' },
    ],
    skills: ['daily.git-flow'],
    itemIds: ['t2-07-q1', 't2-07-q2'],
    labIds: ['scn-git-commit'],
    prereqs: ['t1-06-work-effectively'],
    estMinutes: 10,
  },
  {
    id: 't2-08-code-review',
    trackId: 't2-daily',
    order: 8,
    title: '코드 리뷰·보안 리뷰',
    objectives: [
      '`/code-review`의 effort 수준과 대상 지정(diff/PR/브랜치)을 구분할 수 있다',
      '`--fix`, `--comment`, `ultra` 플래그의 차이를 안다',
      '`/security-review`가 무엇을 검사하는지 안다',
    ],
    summaryMd: `\`/code-review\`(별칭 \`/review\`)는 현재 diff나 전달한 PR 번호·브랜치·경로에서 정확성 버그를 리뷰한다. effort 수준(\`low\`~\`max\`)을 지정하지 않으면 마지막에 쓴 수준을 재사용한다. \`--fix\`는 발견 사항을 작업 트리에 바로 적용하고, \`--comment\`는 GitHub PR/GitLab MR에 인라인 코멘트로 게시한다. \`/code-review ultra\`(별칭 \`/ultrareview\`)는 클라우드에서 멀티 에이전트 심층 리뷰를 돌린다.

품질(재사용성·단순화·효율성) 중심 정리는 \`/simplify\`가 따로 담당한다 — 버그를 찾는 건 \`/code-review\`, 정리는 \`/simplify\`.

\`/security-review\`는 현재 브랜치와 origin 기본 브랜치 사이 diff에서 인젝션, 인증 문제, 데이터 노출 같은 보안 취약점을 분석한다. \`origin\` 리모트가 있어야 동작한다.`,
    docRefs: [
      { slug: 'code-review', anchor: 'review-a-diff-locally' },
      { slug: 'commands', anchor: 'all-commands', label: '/code-review, /security-review' },
    ],
    skills: ['daily.code-review'],
    itemIds: ['t2-08-q1', 't2-08-q2', 't2-08-q3'],
    labIds: ['scn-code-review-fix'],
    prereqs: ['t2-07-git-flow'],
    estMinutes: 12,
  },
  {
    id: 't2-09-common-workflows',
    trackId: 't2-daily',
    order: 9,
    title: '일반적인 워크플로 패턴',
    objectives: [
      '탐색→계획→코드(explore-plan-code) 패턴을 설명할 수 있다',
      '연구가 많은 작업을 서브에이전트에 위임하는 이유를 안다',
      'worktree로 병렬 세션을 돌리는 상황을 식별할 수 있다',
    ],
    summaryMd: `일반적인 워크플로의 뼈대: **탐색 → 계획 → 코드**. 바로 수정을 지시하기 전에 Claude가 먼저 코드베이스를 이해하게 하면("데이터베이스 스키마 분석해줘") 더 정확한 변경이 나온다. 큰 변경은 plan 모드로 먼저 검토하는 게 안전하다.

연구가 많이 필요한 질문(여러 파일을 광범위하게 뒤져야 하는 조사)은 **서브에이전트에 위임**하면 메인 대화의 컨텍스트를 아끼고 결과 요약만 받을 수 있다.

여러 브랜치를 동시에 건드려야 하면 \`git worktree\`로 디렉터리를 나눠 **병렬 세션**을 돌린다. 반복 작업(로그 분석, 번역, 대량 리뷰)은 \`claude -p\`로 파이프에 연결해 스크립트화할 수 있다 — 이건 T4에서 더 깊이 다룬다.`,
    docRefs: [
      { slug: 'common-workflows', anchor: 'plan-before-editing' },
      { slug: 'best-practices', anchor: 'explore-first-then-plan-then-code' },
      { slug: 'common-workflows', anchor: 'delegate-research-to-subagents' },
      { slug: 'common-workflows', anchor: 'run-parallel-sessions-with-worktrees' },
    ],
    skills: ['daily.workflows'],
    itemIds: ['t2-09-q1', 't2-09-q2'],
    labIds: [],
    prereqs: ['t2-08-code-review'],
    estMinutes: 10,
  },
]

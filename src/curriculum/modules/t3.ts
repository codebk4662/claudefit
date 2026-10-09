import type { Module } from '../types'

export const T3_MODULES: Module[] = [
  {
    id: 't3-01-settings',
    trackId: 't3-customize',
    order: 1,
    title: '설정 계층과 settings.json',
    objectives: [
      '설정 파일 4곳(관리형/사용자/프로젝트/로컬)과 우선순위를 설명할 수 있다',
      '`.claude/settings.json`과 `.claude/settings.local.json`의 역할 차이를 안다',
      '`/config`와 직접 편집 중 언제 무엇을 쓸지 판단할 수 있다',
    ],
    summaryMd: `설정은 네 곳에서 올 수 있다: **관리형 설정**(조직, 재정의 불가) > **CLI 플래그/\`--settings\`** > \`~/.claude/settings.json\`(사용자, 모든 프로젝트) > \`.claude/settings.json\`(프로젝트, 공유 가능) > \`.claude/settings.local.json\`(프로젝트, gitignore 대상 — 개인 전용). 더 구체적인 범위가 일반적으로 우선한다.

프로젝트 \`settings.json\`은 팀 전체가 공유할 권한 규칙·훅·MCP 서버를 담아 버전 관리에 커밋한다. \`settings.local.json\`은 "다시 묻지 않기"로 저장되는 개인 승인 같은 걸 담고 커밋하지 않는다.

간단한 값(테마, 모델, 출력 스타일)은 \`/config key=value\`로 대화 중에 바로 바꿀 수 있다. 훅·권한 규칙처럼 구조가 있는 변경은 파일을 직접 편집하거나 \`/update-config\`에 설명을 맡기는 게 낫다.`,
    docRefs: [
      { slug: 'settings', anchor: 'settings-files-and-who-they-affect' },
      { slug: 'settings', anchor: 'settings-precedence' },
    ],
    skills: ['customize.settings'],
    itemIds: ['t3-01-q1', 't3-01-q2', 't3-01-q3'],
    labIds: ['forge-settings-permissions'],
    prereqs: ['t2-03-permission-rules'],
    estMinutes: 12,
  },
  {
    id: 't3-02-model-effort',
    trackId: 't3-customize',
    order: 2,
    title: '모델·effort·빠른 모드',
    objectives: [
      '`/model`로 모델을 전환하고 세션 한정 전환(s)과 기본값 저장을 구분할 수 있다',
      'effort 수준(low~max)이 추론량을 어떻게 조절하는지 설명할 수 있다',
      '빠른 모드가 다운그레이드가 아니라는 것을 안다',
    ],
    summaryMd: `\`/model [모델]\`로 전환하고 새 세션의 기본값으로 저장한다. 행에서 \`s\`를 누르면 **이 세션에만** 적용된다. Sonnet은 대부분의 코딩 작업에 적합하고, Opus는 복잡한 아키텍처 결정에 더 강한 추론을 준다.

\`/effort [low|medium|high|xhigh|max|auto]\`는 모델이 쓰는 추론량을 조절한다 — 간단한 작업에 \`low\`를 쓰면 빠르고 싸지고, 어려운 버그에 \`xhigh\`/\`max\`를 쓰면 더 깊이 생각한다. \`auto\`는 Claude Code가 작업 난이도에 맞춰 조절하게 둔다.

**빠른 모드**(\`/fast\`)는 더 빠른 Opus 응답을 받는 기능이다 — 모델을 낮추는 게 아니라 같은 모델을 더 빠르게 돌리는 설정이라는 점을 헷갈리지 말 것.`,
    docRefs: [
      { slug: 'model-config', anchor: 'available-models' },
      { slug: 'commands', anchor: 'all-commands', label: '/model, /effort, /fast' },
    ],
    skills: ['customize.model-effort'],
    itemIds: ['t3-02-q1', 't3-02-q2', 't3-02-q3'],
    labIds: [],
    prereqs: ['t1-03-agentic-loop'],
    estMinutes: 10,
  },
  {
    id: 't3-03-output-style',
    trackId: 't3-customize',
    order: 3,
    title: '출력 스타일·상태줄',
    objectives: [
      '내장 출력 스타일(Concise/Explanatory 등)의 역할을 설명할 수 있다',
      '`/output-style`로 전환하는 법을 안다',
      '상태줄을 커스터마이즈하는 목적(컨텍스트·비용·git 상태 모니터링)을 안다',
    ],
    summaryMd: `출력 스타일은 Claude의 역할·톤·응답 형식을 바꾼다. 내장 스타일로 **Concise**(간결하게), **Explanatory**(설명을 더 상세히) 등이 있고, \`/output-style [이름]\`으로 전환한다. 더 적극적인 자율 동작을 원한다면(권한 모드와는 별개로) 출력 스타일을 쓰는 게 맞는 접근이다 — auto 모드가 "묻지 않음"을 담당하고 출력 스타일이 "어떻게 말할지"를 담당한다.

상태줄(\`/statusline\`)은 컨텍스트 윈도우 사용량, 비용, git 상태 같은 걸 프롬프트 아래에 상시 표시하도록 커스터마이즈한다. 원하는 내용을 설명하면 Claude가 스크립트를 짜주거나, 인수 없이 실행하면 셸 프롬프트를 바탕으로 자동 구성한다.`,
    docRefs: [
      { slug: 'output-styles', anchor: 'built-in-output-styles' },
      { slug: 'output-styles', anchor: 'change-your-output-style' },
    ],
    skills: ['customize.output-style'],
    itemIds: ['t3-03-q1', 't3-03-q2'],
    labIds: [],
    prereqs: ['t2-02-permission-modes'],
    estMinutes: 8,
  },
  {
    id: 't3-04-skills',
    trackId: 't3-customize',
    order: 4,
    title: '스킬로 반복 워크플로 패키징',
    objectives: [
      '스킬이 "요청 시 로드되는 프롬프트"라는 것을 설명할 수 있다',
      'SKILL.md의 `description`이 트리거 품질을 결정하는 이유를 안다',
      '`disable-model-invocation: true`로 수동 전용 스킬을 만들 수 있다',
    ],
    summaryMd: `스킬은 \`/review-pr\`, \`/deploy-staging\`처럼 팀이 공유할 반복 워크플로를 패키징한다. 세션 시작 시 Claude는 **설명(description)만** 보고, 실제 스킬 내용은 사용될 때만 로드된다 — 그래서 컨텍스트를 거의 쓰지 않으면서 수십 개를 둘 수 있다.

좋은 스킬의 핵심은 \`description\`이다: Claude가 언제 이 스킬을 켜야 하는지 판단하는 유일한 근거이기 때문이다. 너무 광범위하면 불필요하게 발동하고, 너무 구체적이면 필요할 때 안 뜬다. 사용자가 직접 \`/이름\`으로만 호출하게 하려면 frontmatter에 \`disable-model-invocation: true\`를 설정한다 — 그럼 평소엔 설명조차 컨텍스트에 안 들어간다.

스킬은 \`.claude/skills/<name>/SKILL.md\`에 두면 프로젝트 전체가 공유하고, \`~/.claude/skills/\`에 두면 개인 전용이다.`,
    docRefs: [
      { slug: 'skills', anchor: 'getting-started' },
      { slug: 'skills', anchor: 'where-skills-live' },
      { slug: 'skills', anchor: 'configure-skills' },
    ],
    skills: ['customize.skills'],
    itemIds: ['t3-04-q1', 't3-04-q2', 't3-04-q3'],
    labIds: ['forge-skill-md'],
    prereqs: ['t1-05-context-window'],
    estMinutes: 14,
  },
  {
    id: 't3-05-subagents',
    trackId: 't3-customize',
    order: 5,
    title: '서브에이전트 만들기',
    objectives: [
      '서브에이전트가 왜 별도 컨텍스트 윈도우에서 돈다고 하는지 설명할 수 있다',
      '`.claude/agents/*.md`의 frontmatter 필드(name/description/tools/model)를 작성할 수 있다',
      '포크된 서브에이전트(대화 상속)와 새로 시작하는 서브에이전트의 차이를 안다',
    ],
    summaryMd: `서브에이전트는 작업별로 특화된 AI 보조자다. 기본적으로 **새 컨텍스트 윈도우에서 시작**하므로 메인 대화를 오염시키지 않고, 끝나면 요약만 돌려준다. \`/fork\`로 포크하면 지금까지의 대화 복사본으로 시작해 맥락을 공유한다.

\`.claude/agents/<name>.md\`에 frontmatter로 정의한다: \`name\`, \`description\`(언제 위임할지 판단 근거), \`tools\`(허용할 도구 목록, 생략 시 전체), \`model\`(opus/sonnet/haiku 등). 본문은 그 서브에이전트가 받는 시스템 프롬프트다.

연구가 많이 필요하거나 격리가 필요한 작업(다른 디렉터리 조사, 대량 파일 검토)에 위임하면 메인 세션의 컨텍스트를 아낄 수 있다. 여러 서브에이전트를 동시에 돌리는 것도 가능하다 — 이건 T4 '병렬 실행'에서 다룬다.`,
    docRefs: [
      { slug: 'sub-agents', anchor: 'quickstart-create-your-first-subagent' },
      { slug: 'sub-agents', anchor: 'configure-subagents' },
      { slug: 'sub-agents', anchor: 'fork-the-current-conversation' },
    ],
    skills: ['customize.subagents'],
    itemIds: ['t3-05-q1', 't3-05-q2', 't3-05-q3'],
    labIds: ['forge-subagent-md'],
    prereqs: ['t3-04-skills'],
    estMinutes: 14,
  },
  {
    id: 't3-06-mcp',
    trackId: 't3-customize',
    order: 6,
    title: 'MCP로 외부 도구 연결',
    objectives: [
      'MCP가 외부 데이터/도구에 연결하는 개방 표준이라는 것을 설명할 수 있다',
      '`.mcp.json`에 stdio 서버를 추가할 수 있다',
      'MCP 설치 범위(로컬/프로젝트/사용자)를 구분할 수 있다',
    ],
    summaryMd: `MCP(Model Context Protocol)는 AI 도구를 외부 데이터 소스에 연결하는 개방 표준이다. MCP로 Google Drive 문서를 읽거나, Jira 티켓을 업데이트하거나, Slack에서 데이터를 가져오거나, 자체 커스텀 도구를 쓸 수 있다.

서버는 세 범위로 설치된다: **로컬**(이 머신의 이 프로젝트만), **프로젝트**(\`.mcp.json\`, 팀 공유, 버전 관리에 커밋), **사용자**(이 머신의 모든 프로젝트). JSON으로 직접 추가할 때 기본 형태:

\`\`\`json
{
  "mcpServers": {
    "my-server": { "command": "npx", "args": ["-y", "my-mcp-server"], "env": {} }
  }
}
\`\`\`

도구가 많은 서버는 기본적으로 스키마를 지연 로드(도구 검색)해서 컨텍스트를 아낀다. \`/mcp\`로 연결 상태를 보고 \`reconnect\`/\`enable\`/\`disable\`을 실행할 수 있다.`,
    docRefs: [
      { slug: 'mcp', anchor: 'installing-mcp-servers' },
      { slug: 'mcp', anchor: 'mcp-installation-scopes' },
      { slug: 'mcp', anchor: 'add-mcp-servers-from-json-configuration' },
    ],
    skills: ['customize.mcp'],
    itemIds: ['t3-06-q1', 't3-06-q2', 't3-06-q3'],
    labIds: ['forge-mcp-json'],
    prereqs: ['t3-01-settings'],
    estMinutes: 14,
  },
  {
    id: 't3-07-hooks-basics',
    trackId: 't3-customize',
    order: 7,
    title: '훅 기초: 자동화의 시작',
    objectives: [
      'PreToolUse/PostToolUse 등 훅 이벤트가 생명주기의 어디에 걸리는지 안다',
      '`matcher`로 특정 도구에만 훅을 거는 법을 안다',
      'exit code 0/2의 의미(성공/차단)를 설명할 수 있다',
    ],
    summaryMd: `훅은 Claude Code 작업 전후에 셸 명령을 자동 실행한다 — 파일 편집마다 자동 포맷, 커밋 전 lint, 알림 전송 등. 구조:

\`\`\`json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Write|Edit", "hooks": [{ "type": "command", "command": "prettier --write \\"$CLAUDE_FILE_PATH\\"" }] }
    ]
  }
}
\`\`\`

\`matcher\`는 정규식으로 도구 이름에 매칭된다(비워두면 전체). 대표 이벤트: \`PreToolUse\`(실행 전, 차단 가능), \`PostToolUse\`(성공 후), \`UserPromptSubmit\`(프롬프트 제출 전, 컨텍스트 주입 가능), \`SessionStart\`/\`Stop\`.

종료 코드가 **0**이면 성공(JSON 출력 처리), **2**이면 차단(\`{"decision":"block"}\`과 동등). 그 외 코드는 \`decision\`을 명시하지 않으면 비차단 오류로 취급된다.`,
    docRefs: [
      { slug: 'hooks-guide', anchor: 'set-up-your-first-hook' },
      { slug: 'hooks', anchor: 'hook-lifecycle' },
      { slug: 'hooks', anchor: 'configuration' },
    ],
    skills: ['customize.hooks-basics'],
    itemIds: ['t3-07-q1', 't3-07-q2', 't3-07-q3'],
    labIds: ['forge-hook-posttooluse'],
    prereqs: ['t3-01-settings'],
    estMinutes: 16,
  },
  {
    id: 't3-08-hooks-advanced',
    trackId: 't3-customize',
    order: 8,
    title: '훅 심화: 권한 제어와 JSON 출력',
    objectives: [
      '`PreToolUse`에서 `hookSpecificOutput.permissionDecision`으로 allow/deny/ask를 반환할 수 있다',
      '훅이 받는 공통 입력 필드(session_id, tool_name, tool_input 등)를 안다',
      '훅의 범위(사용자/프로젝트/로컬/플러그인)와 `/hooks`로 확인하는 법을 안다',
    ],
    summaryMd: `\`PreToolUse\` 훅은 도구 실행 **전**에 끼어들어 결과를 바꿀 수 있다. stdin으로 JSON을 받아(\`tool_name\`, \`tool_input\`, \`session_id\`, \`cwd\` 등) stdout으로 JSON을 돌려주면:

\`\`\`json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "프로덕션 DB에 직접 쓰기 금지"
  }
}
\`\`\`

\`permissionDecision\`은 \`allow\`/\`deny\`/\`ask\`/\`defer\` 중 하나다. \`additionalContext\`로 Claude에게 참고 정보를 주입할 수도 있다(예: \`UserPromptSubmit\`에서 최신 이슈 목록 추가).

훅은 \`~/.claude/settings.json\`(사용자, 전체 머신), 프로젝트 \`settings.json\`(공유), \`settings.local.json\`(개인), 플러그인의 \`hooks/hooks.json\`, 또는 스킬/에이전트 frontmatter에서 올 수 있다. \`/hooks\`로 현재 적용된 구성을 확인한다.`,
    docRefs: [
      { slug: 'hooks', anchor: 'hook-input-and-output' },
      { slug: 'hooks', anchor: 'hook-events' },
    ],
    skills: ['customize.hooks-advanced'],
    itemIds: ['t3-08-q1', 't3-08-q2', 't3-08-q3'],
    labIds: ['forge-hook-pretooluse-deny', 'forge-hook-json-io'],
    prereqs: ['t3-07-hooks-basics'],
    estMinutes: 16,
  },
]

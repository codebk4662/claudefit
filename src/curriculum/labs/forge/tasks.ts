import type { ForgeTask } from '@/engine/forge/types'
import { pathExists, pathEquals, arrayContains, sourceMatches, isObject, custom } from '@/engine/forge/checks'

export const FORGE_TASKS: ForgeTask[] = [
  {
    id: 'forge-settings-permissions',
    title: 'settings.json: 권한 규칙 작성',
    targetFile: '.claude/settings.json',
    language: 'json',
    promptMd: `팀 \`settings.json\`에 다음 권한 규칙을 추가하세요:

1. \`npm run\`으로 시작하는 모든 명령을 **허용**
2. \`git commit\`으로 시작하는 모든 명령을 **허용**
3. \`git push\`로 시작하는 모든 명령을 **거부**

와일드카드는 부분 명령 뒤에 두어야 한다는 걸 잊지 마세요.`,
    template: '{\n  "permissions": {\n    "allow": [],\n    "deny": []\n  }\n}\n',
    checks: [
      isObject(),
      arrayContains(['permissions', 'allow'], (v) => v === 'Bash(npm run *)', '`Bash(npm run *)` 가 allow에 있어야 합니다', {
        slug: 'permissions',
        anchor: 'wildcard-patterns',
      }),
      arrayContains(['permissions', 'allow'], (v) => v === 'Bash(git commit *)', '`Bash(git commit *)` 가 allow에 있어야 합니다', {
        slug: 'permissions',
        anchor: 'wildcard-patterns',
      }),
      arrayContains(['permissions', 'deny'], (v) => v === 'Bash(git push *)', '`Bash(git push *)` 가 deny에 있어야 합니다', {
        slug: 'permissions',
        anchor: 'wildcard-patterns',
      }),
    ],
    skills: ['daily.permission-rules', 'customize.settings'],
    docRefs: [{ slug: 'permissions', anchor: 'permission-rule-syntax' }],
    sampleSolution: '{\n  "permissions": {\n    "allow": ["Bash(npm run *)", "Bash(git commit *)"],\n    "deny": ["Bash(git push *)"]\n  }\n}\n',
  },
  {
    id: 'forge-claude-md',
    title: 'CLAUDE.md 초안 작성',
    targetFile: 'CLAUDE.md',
    language: 'markdown',
    promptMd: `이 프로젝트의 \`CLAUDE.md\`를 작성하세요. 최소한 다음을 포함해야 합니다:

- 빌드 또는 테스트 명령을 설명하는 섹션 (제목에 "빌드", "테스트", "build", "test" 중 하나 포함)
- 코딩 규칙 최소 1개

200줄을 넘기지 마세요 — 참고용 긴 내용은 스킬이나 경로별 규칙으로 옮기는 게 맞습니다.

> 이 과제는 자유 서술형이라 자동 채점은 구조만 확인합니다. 내용의 질은 모범답안과 스스로 비교해보세요.`,
    template: '# my-project\n\n## \n\n## 규칙\n- \n',
    checks: [
      sourceMatches(/#{1,2}\s*(빌드|테스트|build|test)/i, '빌드/테스트 섹션이 있어야 합니다', { slug: 'memory', anchor: 'claude-md-files' }),
      sourceMatches(/^[-*]\s+\S/m, '규칙을 목록 항목으로 최소 1개 작성해야 합니다'),
      custom('line-limit', '200줄 이내', (_p, source) => source.split('\n').length <= 200),
    ],
    skills: ['daily.memory'],
    docRefs: [{ slug: 'memory', anchor: 'claude-md-files' }],
    sampleSolution:
      '# my-project\n\n## 빌드/테스트\n- `npm run build` 로 빌드\n- `npm test` 로 테스트 실행 (vitest)\n\n## 규칙\n- 모든 공개 함수에는 JSDoc을 작성한다\n- 새 API는 테스트를 함께 추가한다\n',
  },
  {
    id: 'forge-skill-md',
    title: 'SKILL.md 작성: /deploy-staging',
    targetFile: '.claude/skills/deploy-staging/SKILL.md',
    language: 'markdown',
    promptMd: `스테이징 배포를 돕는 스킬의 frontmatter를 작성하세요:

- \`name\`: 스킬 이름
- \`description\`: Claude가 **언제** 이 스킬을 켜야 하는지 판단할 근거가 되도록, 최소 15자 이상 구체적으로 작성

트리거 조건을 명확히 쓰는 게 핵심입니다 — 너무 짧거나 모호하면 통과하지 못합니다.`,
    template: '---\nname: \ndescription: \n---\n\n여기에 스킬 본문(실행 지침)을 작성합니다.\n',
    checks: [
      sourceMatches(/^---\n/, 'frontmatter가 `---`로 시작해야 합니다'),
      sourceMatches(/^name:\s*\S+/m, 'name 필드가 있어야 합니다'),
      sourceMatches(/^description:\s*.{15,}/m, 'description이 15자 이상으로 구체적이어야 합니다', { slug: 'skills', anchor: 'getting-started' }),
    ],
    skills: ['customize.skills'],
    docRefs: [{ slug: 'skills', anchor: 'configure-skills' }],
    sampleSolution:
      '---\nname: deploy-staging\ndescription: 스테이징 환경에 배포하라는 요청이 오면(예: "스테이징에 배포해줘") 사용합니다. 빌드, 테스트, 배포 스크립트 실행을 순서대로 처리합니다.\n---\n\n1. `npm run build` 실행\n2. `npm test` 실행\n3. `./scripts/deploy-staging.sh` 실행\n4. 배포 URL을 보고\n',
  },
  {
    id: 'forge-subagent-md',
    title: '서브에이전트 정의: test-writer',
    targetFile: '.claude/agents/test-writer.md',
    language: 'markdown',
    promptMd: `테스트 작성을 전담하는 서브에이전트를 정의하세요. frontmatter에 다음을 포함하세요:

- \`name: test-writer\`
- \`description\`: 언제 위임할지 (최소 15자)
- \`tools\`: 허용할 도구 목록 (예: Read, Write, Bash)
- \`model\`: sonnet`,
    template: '---\nname: \ndescription: \ntools: \nmodel: \n---\n\n여기에 서브에이전트의 시스템 프롬프트를 작성합니다.\n',
    checks: [
      sourceMatches(/^name:\s*test-writer\s*$/m, 'name 필드가 정확히 "test-writer" 여야 합니다'),
      sourceMatches(/^description:\s*.{15,}/m, 'description이 15자 이상이어야 합니다'),
      sourceMatches(/^tools:\s*\S+/m, 'tools 필드가 있어야 합니다'),
      sourceMatches(/^model:\s*(opus|sonnet|haiku)/m, 'model이 opus/sonnet/haiku 중 하나여야 합니다', { slug: 'sub-agents', anchor: 'configure-subagents' }),
    ],
    skills: ['customize.subagents'],
    docRefs: [{ slug: 'sub-agents', anchor: 'configure-subagents' }],
    sampleSolution:
      '---\nname: test-writer\ndescription: 새 함수나 수정된 함수에 대한 단위 테스트가 필요할 때 위임합니다. 기존 테스트 스타일을 따라 작성합니다.\ntools: Read, Write, Bash\nmodel: sonnet\n---\n\n당신은 테스트 작성 전담 서브에이전트입니다. 기존 테스트 파일의 스타일을 참고해 일관된 테스트를 작성하세요.\n',
  },
  {
    id: 'forge-mcp-json',
    title: '.mcp.json: stdio 서버 추가',
    targetFile: '.mcp.json',
    language: 'json',
    promptMd: `프로젝트 범위 \`.mcp.json\`에 \`filesystem\`이라는 이름의 stdio MCP 서버를 추가하세요:

- \`command\`: \`npx\`
- \`args\`: \`["-y", "@modelcontextprotocol/server-filesystem"]\``,
    template: '{\n  "mcpServers": {}\n}\n',
    checks: [
      isObject(),
      pathExists(['mcpServers', 'filesystem'], 'mcpServers.filesystem 이 있어야 합니다'),
      pathEquals(['mcpServers', 'filesystem', 'command'], 'npx', 'command이 "npx" 여야 합니다'),
      custom('args-check', 'args 배열에 서버 패키지가 포함되어야 합니다', (parsed) => {
        const args = (parsed as any)?.mcpServers?.filesystem?.args
        return Array.isArray(args) && args.some((a: unknown) => typeof a === 'string' && a.includes('server-filesystem'))
      }),
    ],
    skills: ['customize.mcp'],
    docRefs: [{ slug: 'mcp', anchor: 'add-mcp-servers-from-json-configuration' }],
    sampleSolution: '{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem"]\n    }\n  }\n}\n',
  },
  {
    id: 'forge-hook-posttooluse',
    title: '훅: 편집 후 자동 포맷',
    targetFile: '.claude/settings.json',
    language: 'json',
    promptMd: `\`Write\`나 \`Edit\` 도구가 성공적으로 끝난 뒤 \`prettier --write\`를 실행하는 \`PostToolUse\` 훅을 추가하세요.

- \`matcher\`: \`"Write|Edit"\`
- 훅 \`type\`: \`"command"\`
- \`command\`에 \`prettier\`가 포함되어야 합니다`,
    template: '{\n  "hooks": {}\n}\n',
    checks: [
      isObject(),
      pathExists(['hooks', 'PostToolUse'], 'hooks.PostToolUse 가 있어야 합니다'),
      custom(
        'matcher-and-command',
        'matcher가 "Write|Edit"이고 command에 prettier가 포함되어야 합니다',
        (parsed) => {
          const entries = (parsed as any)?.hooks?.PostToolUse
          if (!Array.isArray(entries)) return false
          return entries.some(
            (e: any) => e?.matcher === 'Write|Edit' && Array.isArray(e?.hooks) && e.hooks.some((h: any) => typeof h?.command === 'string' && h.command.includes('prettier')),
          )
        },
        { slug: 'hooks-guide', anchor: 'set-up-your-first-hook' },
      ),
    ],
    skills: ['customize.hooks-basics'],
    docRefs: [{ slug: 'hooks', anchor: 'configuration' }],
    sampleSolution:
      '{\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Write|Edit",\n        "hooks": [{ "type": "command", "command": "prettier --write \\"$CLAUDE_FILE_PATH\\"" }]\n      }\n    ]\n  }\n}\n',
  },
  {
    id: 'forge-hook-pretooluse-deny',
    title: '훅 출력: .env 읽기 차단',
    targetFile: 'hook-output.json',
    language: 'json',
    promptMd: `\`PreToolUse\` 훅 스크립트가 \`.env\` 파일 읽기 시도를 차단하기 위해 stdout으로 돌려줘야 하는 JSON을 작성하세요.

조건:
- \`hookSpecificOutput.hookEventName\`은 \`"PreToolUse"\`
- \`hookSpecificOutput.permissionDecision\`은 \`"deny"\`
- \`hookSpecificOutput.permissionDecisionReason\`에 이유를 설명하는 문자열`,
    template: '{\n  "hookSpecificOutput": {}\n}\n',
    checks: [
      isObject(),
      pathEquals(['hookSpecificOutput', 'hookEventName'], 'PreToolUse', 'hookEventName이 "PreToolUse" 여야 합니다'),
      pathEquals(['hookSpecificOutput', 'permissionDecision'], 'deny', 'permissionDecision이 "deny" 여야 합니다'),
      pathExists(['hookSpecificOutput', 'permissionDecisionReason'], 'permissionDecisionReason이 있어야 합니다'),
    ],
    skills: ['customize.hooks-advanced'],
    docRefs: [{ slug: 'hooks', anchor: 'hook-input-and-output' }],
    sampleSolution: '{\n  "hookSpecificOutput": {\n    "hookEventName": "PreToolUse",\n    "permissionDecision": "deny",\n    "permissionDecisionReason": ".env 파일은 비밀값을 담고 있어 읽기를 차단합니다"\n  }\n}\n',
  },
  {
    id: 'forge-hook-json-io',
    title: '훅 출력: SessionStart 컨텍스트 주입',
    targetFile: 'hook-output.json',
    language: 'json',
    promptMd: `\`SessionStart\` 훅이 온보딩 체크리스트를 자동으로 주입하도록 JSON을 작성하세요.

조건:
- \`hookSpecificOutput.hookEventName\`은 \`"SessionStart"\`
- \`hookSpecificOutput.additionalContext\`에 "온보딩" 이라는 단어가 포함된 안내 문자열
- \`hookSpecificOutput.sessionTitle\`은 \`"Onboarding"\``,
    template: '{\n  "hookSpecificOutput": {}\n}\n',
    checks: [
      isObject(),
      pathEquals(['hookSpecificOutput', 'hookEventName'], 'SessionStart', 'hookEventName이 "SessionStart" 여야 합니다'),
      custom('additional-context', 'additionalContext에 "온보딩"이 포함되어야 합니다', (parsed) => {
        const ctx = (parsed as any)?.hookSpecificOutput?.additionalContext
        return typeof ctx === 'string' && ctx.includes('온보딩')
      }),
      pathEquals(['hookSpecificOutput', 'sessionTitle'], 'Onboarding', 'sessionTitle이 "Onboarding" 이어야 합니다'),
    ],
    skills: ['customize.hooks-advanced'],
    docRefs: [{ slug: 'hooks', anchor: 'hook-input-and-output' }],
    sampleSolution:
      '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "온보딩 체크리스트: 1) CLAUDE.md 확인 2) npm install 3) npm test",\n    "sessionTitle": "Onboarding"\n  }\n}\n',
  },
]

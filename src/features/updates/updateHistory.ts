/**
 * Claude Code 공식 변경 로그(원문 라이브러리의 "changelog" 문서, 수십만 자 분량)를 학습자가
 * 읽을 수 있는 형태로 큐레이션한 버전 히스토리. 내부 구현 수정, Windows/VSCode/Slack 전용 항목,
 * 엔터프라이즈 인프라 변경처럼 학습자와 무관한 항목은 걷어내고, 실제로 써보면 체감되는 기능만 남긴다.
 *
 * 유지 방법: 새 버전이 나오면 원문 changelog(/docs/changelog)에서 "Added"/"Changed" 중
 * 학습자가 알면 좋을 항목만 골라 맨 위에 새 엔트리를 추가한다. 버그 수정은 보통 생략한다.
 */
export interface UpdateEntry {
  /** 대표 버전 (예: "2.1.296"). 범위를 묶었다면 "2.1.292 ~ 2.1.296"처럼 적는다. */
  version: string
  /** 이번 큐레이션 묶음의 한 줄 제목 */
  title: string
  /** 학습자 관점으로 쓴 하이라이트. 2~4개 권장 */
  highlights: string[]
}

export const UPDATE_HISTORY: UpdateEntry[] = [
  {
    version: '2.1.296',
    title: '서브에이전트 컨텍스트 관리와 캐시 비용 인하',
    highlights: [
      '서브에이전트 frontmatter와 --agents 정의에 autoCompactWindow가 추가되어, 서브에이전트가 메인 대화보다 먼저 컨텍스트를 압축하도록 설정할 수 있다.',
      'CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL로 워크플로우 에이전트 전체를 다른 서브에이전트와 별도 모델로 돌릴 수 있다.',
      'Read 도구에 allow_large 옵션이 추가되어, 컨텍스트 여유가 있을 때 큰 파일을 한 번에 전부 읽을 수 있다.',
      'Sonnet 5.5 캐시 읽기 비용이 $0.20 → $0.10/MTok로 절반 인하됐다 (/cost, 상태줄, --max-budget-usd 모두 반영).',
    ],
  },
  {
    version: '2.1.295',
    title: '훅을 더 안전한 가드로 쓸 수 있게',
    highlights: [
      '명령·HTTP 훅에 onFailure: "block"이 추가되어, 훅이 시작 실패·타임아웃·예상치 못한 종료 코드를 내도 그 동작을 "허용"이 아니라 "차단"으로 처리할 수 있다.',
      '터미널이 Program Status Protocol(OSC 7501)을 지원하면 Claude Code가 작업 중/대기/완료 상태를 터미널 쪽에 알려줄 수 있다.',
    ],
  },
  {
    version: '2.1.293',
    title: 'Claude Haiku 5.5 추가',
    highlights: [
      'Claude Haiku 5.5가 추가되어 Anthropic API의 기본 Haiku 모델이 됐다 — 100만 토큰 컨텍스트, $0.10/$0.50 per Mtok (100K 초과 프롬프트는 $0.50/$2.50).',
    ],
  },
  {
    version: '2.1.292',
    title: '서브에이전트 effort 지정, 플러그인 마켓플레이스 원스텝 설치',
    highlights: [
      'Agent 도구에 effort 파라미터가 추가되어, 서브에이전트를 원하는 effort 레벨로 실행할 수 있다.',
      'claude plugin install에 --marketplace <source>가 추가되어, 마켓플레이스 추가와 플러그인 설치를 한 번에 할 수 있다.',
      '서브에이전트가 skills 필드에서 최대 32개까지만 스킬을 미리 로드하도록 바뀌었다 (Skill 도구가 있는 서브에이전트는 나머지도 직접 호출 가능).',
      '도구 검색을 거쳐 모델에 전달되는 MCP 도구 설명의 길이 제한이 2,048자에서 16,384자로 늘었다.',
    ],
  },
]

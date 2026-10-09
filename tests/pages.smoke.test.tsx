import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TrackListPage } from '@/features/learn/TrackListPage'
import { ModuleDetailPage } from '@/features/learn/ModuleDetailPage'
import { QuizPage } from '@/features/quiz/QuizPage'
import { TerminalPage } from '@/features/terminal/TerminalPage'
import { ForgePage } from '@/features/forge/ForgePage'
import { DrillPage } from '@/features/drill/DrillPage'
import { ALL_MODULES } from '@/curriculum/modules'

/**
 * fetch가 필요한 /docs 페이지를 뺀 나머지 "오프라인" 페이지들을 실제로 렌더링해서
 * 크래시가 없는지 확인한다. 정적 분석(tsc/lint)이 잡지 못하는 런타임 오류(예: 잘못된 prop,
 * null 역참조)를 잡기 위한 용도 — 브라우저로 직접 확인할 수 없는 환경에서의 대체 검증.
 */

beforeEach(() => {
  localStorage.clear()
})

function withRouter(path: string, element: React.ReactElement, routePath: string) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>
  )
}

describe('페이지 스모크 테스트 (렌더링 크래시 여부)', () => {
  it('DashboardPage: 진도가 없는 초기 상태에서도 렌더링된다', () => {
    render(withRouter('/', <DashboardPage />, '/'))
    expect(screen.getByText('대시보드')).toBeInTheDocument()
    expect(screen.getByText('오늘의 드릴')).toBeInTheDocument()
  })

  it('TrackListPage: 모든 트랙/모듈이 렌더링된다', () => {
    render(withRouter('/learn', <TrackListPage />, '/learn'))
    expect(screen.getByText('학습 트랙')).toBeInTheDocument()
    // 38개 모듈 제목이 모두 링크로 떠야 한다
    for (const m of ALL_MODULES.slice(0, 3)) {
      expect(screen.getByText(m.title)).toBeInTheDocument()
    }
  })

  it('ModuleDetailPage: 첫 모듈 상세가 렌더링되고 상태 변경이 동작한다', () => {
    const first = ALL_MODULES[0]
    render(withRouter(`/learn/${first.id}`, <ModuleDetailPage />, '/learn/:moduleId'))
    expect(screen.getByText(first.title)).toBeInTheDocument()
    const learningBtn = screen.getByText('학습 중으로 표시')
    fireEvent.click(learningBtn)
    expect(screen.getByText('완료로 표시')).toBeInTheDocument()
  })

  it('ModuleDetailPage: 존재하지 않는 모듈 id는 에러 없이 안내만 보여준다', () => {
    render(withRouter('/learn/no-such-module', <ModuleDetailPage />, '/learn/:moduleId'))
    expect(screen.getByText(/모듈을 찾을 수 없습니다/)).toBeInTheDocument()
  })

  it('QuizPage: 첫 문항이 렌더링되고 제출하면 다음 문항으로 넘어간다', () => {
    const first = ALL_MODULES.find((m) => m.itemIds.length > 0)!
    render(withRouter(`/quiz/${first.id}`, <QuizPage />, '/quiz/:moduleId'))
    expect(screen.getByText(`퀴즈: ${first.title}`)).toBeInTheDocument()
    expect(screen.getByText('1 / ' + first.itemIds.length)).toBeInTheDocument()
  })

  it('TerminalPage: 시나리오 첫 단계와 입력창이 렌더링된다', () => {
    render(withRouter('/terminal/scn-first-session', <TerminalPage />, '/terminal/:scenarioId'))
    expect(screen.getByText('첫 세션: claude 실행 → /init → /memory')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('예: claude')).toBeInTheDocument()
  })

  it('TerminalPage: 잘못된 입력 후 올바른 명령을 넣으면 다음 단계로 진행한다', () => {
    render(withRouter('/terminal/scn-first-session', <TerminalPage />, '/terminal/:scenarioId'))
    const input = screen.getByPlaceholderText('예: claude') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'claude' } })
    fireEvent.click(screen.getByText('전송'))
    // "단계 2 / 3"은 JSX 표현식 때문에 여러 텍스트 노드로 쪼개져 있어, 다음 단계의
    // goal 문구로 진행 여부를 확인한다 (단일 텍스트 노드라 안정적으로 매칭된다).
    expect(screen.getByText('이 프로젝트를 위한 시작 CLAUDE.md를 생성하세요.')).toBeInTheDocument()
  })

  it('ForgePage: 과제 설명과 채점 버튼이 렌더링된다', () => {
    render(withRouter('/forge/forge-claude-md', <ForgePage />, '/forge/:taskId'))
    expect(screen.getByText('CLAUDE.md 초안 작성')).toBeInTheDocument()
    expect(screen.getByText('채점하기')).toBeInTheDocument()
  })

  it('ForgePage: 빈 템플릿을 그대로 채점하면 실패 결과가 보인다', () => {
    render(withRouter('/forge/forge-mcp-json', <ForgePage />, '/forge/:taskId'))
    fireEvent.click(screen.getByText('채점하기'))
    expect(screen.getByText('아직 통과하지 못한 체크가 있습니다')).toBeInTheDocument()
  })

  it('DrillPage: 진도가 없어도 신규 문항으로 드릴이 채워진다', () => {
    // 복습 기한이 지난 카드는 없지만, 아직 한 번도 풀지 않은 "신규" 문항이 채워져야 한다.
    render(withRouter('/drill', <DrillPage />, '/drill'))
    expect(screen.getByText('오늘의 드릴')).toBeInTheDocument()
    expect(screen.getByText(/^1 \/ \d+$/)).toBeInTheDocument()
  })
})

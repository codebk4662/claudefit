import { BrowserRouter, Routes, Route } from 'react-router'
import { Layout } from '@/ui/Layout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { DrillPage } from '@/features/drill/DrillPage'
import { TrackListPage } from '@/features/learn/TrackListPage'
import { ModuleDetailPage } from '@/features/learn/ModuleDetailPage'
import { QuizPage } from '@/features/quiz/QuizPage'
import { TerminalPage } from '@/features/terminal/TerminalPage'
import { ForgePage } from '@/features/forge/ForgePage'
import { DocsLibraryPage } from '@/features/docs/DocsLibraryPage'
import { DocViewerPage } from '@/features/docs/DocViewerPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/drill" element={<DrillPage />} />
          <Route path="/learn" element={<TrackListPage />} />
          <Route path="/learn/:moduleId" element={<ModuleDetailPage />} />
          <Route path="/quiz/:moduleId" element={<QuizPage />} />
          <Route path="/terminal/:scenarioId" element={<TerminalPage />} />
          <Route path="/forge/:taskId" element={<ForgePage />} />
          <Route path="/docs" element={<DocsLibraryPage />} />
          <Route path="/docs/:slug" element={<DocViewerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

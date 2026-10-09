import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { ALL_MODULES } from '@/curriculum/modules'
import { TRACKS } from '@/curriculum/tracks'
import { SKILLS } from '@/curriculum/skills'
import { ALL_ITEMS } from '@/curriculum/items'
import { pickDailyDrillItems } from '@/engine/scheduler'
import { useProgress, computeMasteryBySkill } from '@/store/progress'
import { Card, PageHeader, Pill, PrimaryButton, SecondaryButton } from '@/ui/common'
import { MasteryBar } from '@/ui/MasteryBar'

export function DashboardPage() {
  const navigate = useNavigate()
  const state = useProgress()
  const { moduleStatus, itemAttempts, labAttempts, srs, streak, exportJson, importJson } = state

  const masteryBySkill = useMemo(() => computeMasteryBySkill({ itemAttempts, labAttempts }), [itemAttempts, labAttempts])

  const dueItemIds = useMemo(
    () => pickDailyDrillItems({ allItems: ALL_ITEMS, srsByItemId: srs, masteryBySkill, limit: 10 }),
    [srs, masteryBySkill],
  )

  const doneModules = ALL_MODULES.filter((m) => moduleStatus[m.id] === 'done').length
  const skillGroups = useMemo(() => {
    const byGroup = new Map<string, typeof SKILLS>()
    for (const s of SKILLS) {
      const arr = byGroup.get(s.group) ?? []
      arr.push(s)
      byGroup.set(s.group, arr)
    }
    return [...byGroup.entries()]
  }, [])

  function handleExport() {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `claudefit-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const result = importJson(String(reader.result))
        if (!result.ok) alert(`가져오기 실패: ${result.error}`)
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="대시보드"
        description="진도, 숙련도, 오늘의 복습을 한눈에 봅니다."
        actions={
          <div className="flex gap-2">
            <SecondaryButton onClick={handleImport}>진도 가져오기</SecondaryButton>
            <SecondaryButton onClick={handleExport}>진도 내보내기</SecondaryButton>
          </div>
        }
      />

      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <StatTile label="완료한 모듈" value={`${doneModules} / ${ALL_MODULES.length}`} />
        <StatTile label="연속 학습일" value={`${streak.count}일`} />
        <StatTile label="오늘 복습 대상" value={`${dueItemIds.length}문항`} />
      </div>

      <Card className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">오늘의 드릴</h2>
          <Pill tone="accent">약 7분</Pill>
        </div>
        <p className="text-sm text-[var(--text-dim)] mb-4">복습 기한이 지난 문항과 약점 스킬의 신규 문항을 섞어 추천합니다.</p>
        <PrimaryButton onClick={() => navigate('/drill')}>드릴 시작 →</PrimaryButton>
      </Card>

      <Card>
        <h2 className="font-semibold mb-4">스킬 숙련도</h2>
        <div className="space-y-6">
          {skillGroups.map(([group, skills]) => (
            <div key={group}>
              <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] mb-2">{group}</p>
              <div className="space-y-1.5">
                {skills.map((s) => (
                  <MasteryBar key={s.id} label={s.label} value={masteryBySkill[s.id] ?? 0} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 text-xs text-[var(--text-dim)]">
        {TRACKS.length}개 트랙 · {ALL_MODULES.length}개 모듈 · {ALL_ITEMS.length}개 문항
      </div>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs text-[var(--text-dim)]">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </Card>
  )
}

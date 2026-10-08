import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { ExamFilterTab, ExamOverviewStats } from '../types'

interface ExamFilterTabsProps {
  activeTab: ExamFilterTab
  onTabChange: (tab: ExamFilterTab) => void
  stats: ExamOverviewStats
}

export function ExamFilterTabs({ activeTab, onTabChange, stats }: ExamFilterTabsProps) {
  const tabs: { id: ExamFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'upcoming', label: 'Upcoming', count: stats.upcoming },
    { id: 'today', label: 'Today', count: stats.today },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'results_pending', label: 'Results Pending', count: stats.resultsPending },
  ]

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as ExamFilterTab)} variant="pill">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
            <span>{tab.label}</span>
            <Badge
              size="sm"
              tone={activeTab === tab.id ? 'primary' : 'neutral'}
            >
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}


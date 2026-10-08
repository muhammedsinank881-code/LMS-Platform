import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { ResultsFilterTab, ResultsOverviewStats } from '../types'

interface ResultsFilterTabsProps {
  activeTab: ResultsFilterTab
  onTabChange: (tab: ResultsFilterTab) => void
  stats: ResultsOverviewStats
}

export function ResultsFilterTabs({ activeTab, onTabChange, stats }: ResultsFilterTabsProps) {
  const tabs: { id: ResultsFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'published', label: 'Published', count: stats.published },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'failed', label: 'Failed', count: 1 },
  ]

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as ResultsFilterTab)} variant="pill">
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


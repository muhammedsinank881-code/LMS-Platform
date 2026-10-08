import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { ClassFilterTab, ClassSummaryStats } from '../types'

interface ClassFilterTabsProps {
  activeTab: ClassFilterTab
  onTabChange: (tab: ClassFilterTab) => void
  stats: ClassSummaryStats
}

export function ClassFilterTabs({ activeTab, onTabChange, stats }: ClassFilterTabsProps) {
  const tabs: { id: ClassFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.totalCount },
    { id: 'active', label: 'Active', count: stats.activeCount },
    { id: 'completed', label: 'Completed', count: stats.completedCount },
  ]

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as ClassFilterTab)} variant="pill">
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


import { CalendarPlus, FilePlus, ArrowRight, UploadCloud, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui'
import type { QuickActionItem } from '../types'

interface QuickActionsGridProps {
  actions: QuickActionItem[]
}

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  const navigate = useNavigate()

  const getActionConfig = (iconName: QuickActionItem['iconName']) => {
    switch (iconName) {
      case 'attendance':
        return {
          icon: UserCheck,
          bg: 'bg-primary-subtle text-primary',
          hoverBorder: 'hover:border-primary/40',
          path: '/mentor/attendance-tracking',
        }
      case 'assignment':
        return {
          icon: FilePlus,
          bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
          hoverBorder: 'hover:border-blue-500/40',
          path: '/mentor/assignments/create',
        }
      case 'upload':
        return {
          icon: UploadCloud,
          bg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
          hoverBorder: 'hover:border-amber-500/40',
          path: '/mentor/helpdesk-resource-hub',
        }
      case 'schedule':
        return {
          icon: CalendarPlus,
          bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
          hoverBorder: 'hover:border-purple-500/40',
          path: '/mentor/schedule-1-on-1-sessions',
        }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">Quick Actions</h2>
        <button
          type="button"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          See All <ArrowRight className="size-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {actions.map((act) => {
          const config = getActionConfig(act.iconName)
          const Icon = config.icon

          return (
            <Card
              key={act.id}
              onClick={() => navigate(config.path)}
              className={`border-border bg-surface shadow-2xs transition-all hover:shadow-xs cursor-pointer ${config.hoverBorder}`}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
                  <Icon className="size-4 sm:size-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight truncate">
                  {act.label}
                </span>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

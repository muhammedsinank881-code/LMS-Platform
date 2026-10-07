import { Code2, Globe, ListTodo, MoreVertical, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import type { RecentClassItem } from '../types'

interface RecentClassesGridProps {
  classes: RecentClassItem[]
}

export function RecentClassesGrid({ classes }: RecentClassesGridProps) {
  const getIconConfig = (type: RecentClassItem['iconType']) => {
    switch (type) {
      case 'code':
        return { icon: Code2, bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' }
      case 'web':
        return { icon: Globe, bg: 'bg-primary-subtle text-primary' }
      case 'list':
        return { icon: ListTodo, bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">Recent Classes</h2>
      </div>

      {/* Horizontally scrollable container */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 pt-0.5 snap-x snap-mandatory no-scrollbar sm:scrollbar-thin sm:scrollbar-thumb-muted">
        {classes.map((cls) => {
          const iconConfig = getIconConfig(cls.iconType)
          const Icon = iconConfig.icon

          return (
            <Card
              key={cls.id}
              className="min-w-[200px] sm:min-w-[230px] w-[200px] sm:w-[230px] shrink-0 snap-start border-border bg-surface shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs group cursor-pointer"
            >
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${iconConfig.bg} transition-transform group-hover:scale-105`}>
                    <Icon className="size-4" />
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Class options"
                  >
                    <MoreVertical className="size-3.5" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate">{cls.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{cls.course}</p>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Users className="size-3 text-primary" />
                  <span className="text-foreground font-semibold">{cls.studentsCount} Students</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

import { Clock, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui'
import { MOCK_STUDENT_DATA, type PendingClass } from '../../mock/student-data'

export function PendingClassesSidebar() {
  const navigate = useNavigate()
  const { pendingClasses } = MOCK_STUDENT_DATA

  const handleClassClick = (item: PendingClass) => {
    navigate(`/student/video-class?id=${item.id}`)
  }

  const getStatusBadge = (status: PendingClass['status']) => {
    switch (status) {
      case 'now_watching':
        return <span className="rounded bg-primary-subtle px-1.5 py-0.5 text-[10px] font-bold text-primary animate-pulse">Now Watching</span>
      case 'up_next':
        return <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">Up Next</span>
      default:
        return <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Pending</span>
    }
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">Video Classes Queue</h3>
        <span className="text-[11px] text-muted-foreground">{pendingClasses.length} Lessons</span>
      </div>

      <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto">
        {pendingClasses.map((cls) => (
          <button
            key={cls.id}
            onClick={() => handleClassClick(cls)}
            className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 bg-surface-hover p-2.5 transition-all hover:border-primary/50 hover:bg-muted/70"
          >
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <img src={cls.thumbnail} alt={cls.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                <PlayCircle className="h-5 w-5 text-white opacity-90" />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-1">
                {getStatusBadge(cls.status)}
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {cls.duration}
                </span>
              </div>
              <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {cls.title}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">{cls.module}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}

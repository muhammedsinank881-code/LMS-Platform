import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookPlus,
  CalendarPlus,
  FilePlus,
  GraduationCap,
  UploadCloud,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

interface QuickActionsGridProps {
  onCreateClass?: () => void
}

export function QuickActionsGrid({ onCreateClass }: QuickActionsGridProps = {}) {
  const navigate = useNavigate()

  const actions = [
    {
      id: 'take-attendance',
      label: 'Take Attendance',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
      path: '/mentor/attendance',
    },
    {
      id: 'create-class',
      label: 'Create Class',
      icon: BookPlus,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      path: '/mentor/classes',
    },
    {
      id: 'upload-material',
      label: 'Upload Material',
      icon: UploadCloud,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      path: '/mentor/materials?upload=true',
    },
    {
      id: 'create-assignment',
      label: 'Create Assignment',
      icon: FilePlus,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
      path: '/mentor/assignments/create',
    },
    {
      id: 'schedule-class',
      label: 'Schedule Class',
      icon: CalendarPlus,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
      path: '/mentor/schedule?open=true',
    },
    {
      id: 'create-exam',
      label: 'Create Exam',
      icon: GraduationCap,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
      path: '/mentor/exams',
    },
  ]

  const handleActionClick = (act: (typeof actions)[0]) => {
    if (act.id === 'create-class' && onCreateClass) {
      onCreateClass()
      return
    }
    navigate(act.path)
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
          Quick Actions
        </h2>
        <Link
          to="/mentor/classes"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>See All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Grid: 3 cols on mobile/tablet, 6 cols on laptop/desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <Card
              key={act.id}
              onClick={() => handleActionClick(act)}
              className="bg-surface border-border shadow-2xs rounded-xl hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer select-none group text-center"
            >
              <CardContent className="p-2 sm:p-3 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
                <div
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${act.color} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
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

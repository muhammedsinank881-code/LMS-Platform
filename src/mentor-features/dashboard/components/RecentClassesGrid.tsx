import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckSquare,
  Code2,
  FileText,
  Globe,
  ListTodo,
  MoreVertical,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui'
import type { RecentClassItem } from '../types'

interface RecentClassesGridProps {
  classes: RecentClassItem[]
}

export function RecentClassesGrid({ classes }: RecentClassesGridProps) {
  const navigate = useNavigate()

  const getIconConfig = (type: RecentClassItem['iconType']) => {
    switch (type) {
      case 'code':
        return { icon: Code2, bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' }
      case 'web':
        return { icon: Globe, bg: 'bg-primary-subtle text-primary' }
      case 'list':
        return { icon: ListTodo, bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' }
      default:
        return { icon: Code2, bg: 'bg-primary-subtle text-primary' }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
          Recent Classes
        </h2>
        <Link
          to="/mentor/classes"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          View All <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Horizontally scrollable container */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 pt-0.5 snap-x snap-mandatory no-scrollbar sm:scrollbar-thin sm:scrollbar-thumb-muted">
        {classes.length === 0 ? (
          <div className="w-full p-4 text-center border border-dashed border-border rounded-lg bg-surface text-xs text-muted-foreground">
            No classes found assigned to your profile.
          </div>
        ) : (
          classes.map((cls) => {
            const iconConfig = getIconConfig(cls.iconType)
            const Icon = iconConfig.icon

            return (
              <Card
                key={cls.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/mentor/classes/${cls.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/mentor/classes/${cls.id}`)
                  }
                }}
                aria-label={`Open class: ${cls.title}`}
                className="min-w-[200px] sm:min-w-[230px] w-[200px] sm:w-[230px] shrink-0 snap-start border-border bg-surface shadow-2xs transition-all hover:border-primary/50 hover:shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary group cursor-pointer select-none"
              >
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-lg ${iconConfig.bg} transition-transform group-hover:scale-105`}
                    >
                      <Icon className="size-4" />
                    </div>

                    {/* Three-dot dropdown actions menu */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Dropdown>
                        <DropdownTrigger asChild>
                          <button
                            type="button"
                            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={`Options for ${cls.title}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-3.5" />
                          </button>
                        </DropdownTrigger>
                        <DropdownContent align="end" className="w-48">
                          <DropdownItem
                            onClick={() => navigate(`/mentor/classes/${cls.id}`)}
                            className="cursor-pointer"
                          >
                            <BookOpen className="size-3.5 mr-2 text-primary" />
                            <span>View Class Details</span>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => navigate(`/mentor/attendance?classId=${cls.id}`)}
                            className="cursor-pointer"
                          >
                            <UserCheck className="size-3.5 mr-2 text-emerald-500" />
                            <span>Take Attendance</span>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => navigate('/mentor/materials')}
                            className="cursor-pointer"
                          >
                            <FileText className="size-3.5 mr-2 text-muted-foreground" />
                            <span>Learning Materials</span>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => navigate('/mentor/assignments')}
                            className="cursor-pointer"
                          >
                            <CheckSquare className="size-3.5 mr-2 text-muted-foreground" />
                            <span>Assignments</span>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => navigate('/mentor/schedule')}
                            className="cursor-pointer"
                          >
                            <Calendar className="size-3.5 mr-2 text-muted-foreground" />
                            <span>Schedule / Classes</span>
                          </DropdownItem>
                        </DropdownContent>
                      </Dropdown>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                      {cls.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {cls.course}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Users className="size-3 text-primary" />
                    <span className="text-foreground font-semibold">
                      {cls.studentsCount} Students
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

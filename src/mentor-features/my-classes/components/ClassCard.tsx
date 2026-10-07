import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Globe,
  MapPin,
  Smartphone,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, Tooltip } from '@/components/ui'
import type { MentorClass } from '../types'

interface ClassCardProps {
  cls: MentorClass
}

export function ClassCard({ cls }: ClassCardProps) {
  const navigate = useNavigate()

  // Helper to get category icon and styled accent
  const getIconConfig = (type: MentorClass['iconType']) => {
    switch (type) {
      case 'algo':
      case 'code':
        return { icon: Code2, bg: 'bg-primary-subtle text-primary' }
      case 'web':
        return { icon: Globe, bg: 'bg-primary-subtle text-primary' }
      case 'database':
        return { icon: Database, bg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' }
      case 'mobile':
        return { icon: Smartphone, bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' }
      case 'cloud':
        return { icon: BookOpen, bg: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400' }
      default:
        return { icon: Code2, bg: 'bg-primary-subtle text-primary' }
    }
  }

  const iconConfig = getIconConfig(cls.iconType)
  const Icon = iconConfig.icon
  const isActive = cls.status === 'active'

  const handleClick = () => {
    navigate(`/mentor/classes/${cls.id}`)
  }

  return (
    <Card
      variant="interactive"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative flex flex-col justify-between p-5 cursor-pointer select-none"
    >
      {/* Top Header Row: Icon + Title/Program + Code Badge */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-lg ${iconConfig.bg} shrink-0 transition-transform group-hover:scale-105`}>
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <Tooltip content={cls.title} side="top">
                <h3 className="text-base font-semibold text-foreground tracking-tight truncate leading-snug group-hover:text-primary transition-colors">
                  {cls.title}
                </h3>
              </Tooltip>
              <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
                {cls.program} · {cls.year}
              </p>
            </div>
          </div>

          {/* Course Code Badge */}
          <span className="shrink-0 px-2.5 py-1 text-xs font-semibold rounded-md bg-muted text-foreground border border-border font-mono">
            {cls.courseCode}
          </span>
        </div>

        {/* Student Count & Room Info Row */}
        <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground font-medium border-t border-border">
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-primary" />
            <span className="text-foreground font-semibold">{cls.studentsCount} Students</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{cls.room}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Semester + Status Indicator + Details Arrow */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
        {/* Semester & Status details */}
        <div className="flex items-center gap-2 text-muted-foreground font-medium truncate">
          <Clock className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{cls.semester}</span>
        </div>

        {/* Right Status Dot & Navigation Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-xs">
            {isActive ? (
              <span className="flex items-center gap-1.5 text-success">
                <span className="size-2 rounded-full bg-success animate-pulse" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-muted-foreground" />
                Completed
              </span>
            )}
          </div>

          <div className="p-1 rounded-md text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
            <ArrowRight className="size-4" />
          </div>
        </div>
      </div>
    </Card>
  )
}

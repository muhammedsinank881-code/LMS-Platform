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
import { Badge, Card, Tooltip } from '@/components/ui'
import type { MentorClass } from '../types'

interface ClassCardProps {
  cls: MentorClass
}

export function ClassCard({ cls }: ClassCardProps) {
  const navigate = useNavigate()

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
      {/* Header Row: Icon + Title/Program + Code Badge */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-md ${iconConfig.bg} shrink-0 transition-transform group-hover:scale-105`}>
              <Icon className="h-5 w-5" />
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

          <Badge tone="neutral" size="sm" className="font-mono shrink-0">
            {cls.courseCode}
          </Badge>
        </div>

        {/* Student Count & Room Info Row */}
        <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground font-medium border-t border-border">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-foreground font-semibold">{cls.studentsCount} Students</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{cls.room}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Semester + Status Indicator + Arrow */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground font-medium truncate">
          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{cls.semester}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge tone={isActive ? 'success' : 'neutral'} size="sm" dot={isActive}>
            {isActive ? 'Active' : 'Completed'}
          </Badge>

          <div className="p-1 rounded-md text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Card>
  )
}


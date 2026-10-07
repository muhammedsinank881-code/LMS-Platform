import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, Tooltip } from '@/components/ui'
import type { MentorExam } from '../types'
import { ExamStatusBadge } from './ExamStatusBadge'

interface ExamCardProps {
  exam: MentorExam
}

export function ExamCard({ exam }: ExamCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/mentor/exams/${exam.id}`)
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
      className="group relative flex flex-col justify-between p-5 cursor-pointer select-none space-y-4"
    >
      {/* Row 1: Title & Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Tooltip content={exam.title} side="top">
            <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
              {exam.title}
            </h3>
          </Tooltip>
          <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
            {exam.classBatch} · {exam.subject}
          </p>
        </div>

        <ExamStatusBadge status={exam.status} className="shrink-0" />
      </div>

      {/* Row 2: Date, Time & Duration */}
      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span>{exam.formattedDate}</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-3.5 text-muted-foreground" />
          <span>{exam.time}</span>
        </div>
        <span>·</span>
        <span className="text-foreground font-semibold">{exam.duration}</span>
      </div>

      {/* Row 3: Students, Room & Arrow CTA */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs text-muted-foreground font-medium">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            <span className="text-foreground font-semibold">
              {exam.studentsCount} Students
            </span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-muted-foreground" />
            <span>{exam.room}</span>
          </div>
        </div>

        <div className="p-1 rounded-md text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
          <ArrowRight className="size-4" />
        </div>
      </div>
    </Card>
  )
}

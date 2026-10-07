import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from '@/components/ui'
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
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative flex flex-col justify-between bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-[#0F9F83]/50 transition-all duration-200 cursor-pointer select-none space-y-4"
    >
      {/* Row 1: Title & Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Tooltip content={exam.title} side="top">
            <h3 className="text-base sm:text-lg font-bold text-[#17324D] dark:text-foreground tracking-tight truncate group-hover:text-[#0F9F83] transition-colors">
              {exam.title}
            </h3>
          </Tooltip>
          <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mt-0.5 truncate">
            {exam.classBatch} · {exam.subject}
          </p>
        </div>

        <ExamStatusBadge status={exam.status} className="shrink-0" />
      </div>

      {/* Row 2: Date, Time & Duration */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#17324D] dark:text-slate-200">
        <div className="flex items-center gap-1.5 text-[#64748B] dark:text-slate-400">
          <Calendar className="size-3.5 text-slate-400" />
          <span>{exam.formattedDate}</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5 text-[#64748B] dark:text-slate-400">
          <Clock className="size-3.5 text-slate-400" />
          <span>{exam.time}</span>
        </div>
        <span>·</span>
        <span className="text-[#17324D] dark:text-foreground">{exam.duration}</span>
      </div>

      {/* Row 3: Students, Room & Arrow CTA */}
      <div className="pt-3 border-t border-[#E2E8F0] dark:border-border flex items-center justify-between gap-2 text-xs text-[#64748B] dark:text-slate-400 font-medium">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-[#0F9F83]" />
            <span className="text-[#17324D] dark:text-slate-200 font-semibold">
              {exam.studentsCount} Students
            </span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-slate-400" />
            <span>{exam.room}</span>
          </div>
        </div>

        <div className="p-1 rounded-lg text-[#64748B] group-hover:text-[#0F9F83] group-hover:translate-x-0.5 transition-all">
          <ArrowRight className="size-4.5" />
        </div>
      </div>
    </div>
  )
}

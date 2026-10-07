import type { MentorExam } from '../types'
import { ExamCard } from './ExamCard'

interface ExamSectionGroupProps {
  title: string
  count: number
  exams: MentorExam[]
}

export function ExamSectionGroup({ title, count, exams }: ExamSectionGroupProps) {
  if (count === 0 || exams.length === 0) return null

  return (
    <div className="space-y-3 pt-2">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
          {title}
        </h2>
        <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-slate-200 dark:bg-slate-800 text-[#17324D] dark:text-foreground">
          {count}
        </span>
      </div>

      {/* Exam Cards List */}
      <div className="space-y-3.5">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    </div>
  )
}

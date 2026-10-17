import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import type { StudentResult } from '../types'
import { ResultStatusBadge } from './ResultStatusBadge'

interface ResultCardProps {
  result: StudentResult
}

export function ResultCard({ result }: ResultCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/mentor/results/${result.id}`)
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
      className="md:hidden flex flex-col justify-between p-3 sm:p-4 space-y-2.5 sm:space-y-3 cursor-pointer select-none"
    >
      {/* Header: Student Name & Grade */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
            {result.studentName}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium font-mono mt-0.5 truncate">
            {result.studentId} · {result.classBatch}
          </p>
        </div>

        <span className="px-2 py-0.5 text-[11px] sm:text-xs font-bold rounded-md bg-primary-subtle text-primary border border-primary/20 shrink-0">
          [{result.grade}]
        </span>
      </div>

      {/* Middle: Exam Subject & Marks */}
      <div className="space-y-0.5 sm:space-y-1 bg-muted/50 p-2 sm:p-2.5 rounded-md border border-border">
        <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
          {result.examName} ({result.subject})
        </p>
        <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">
          {result.marksObtained} / {result.totalMarks} · <span className="text-primary font-bold">{result.percentage}%</span>
        </p>
      </div>

      {/* Footer: Grade text, Status badge & Chevron */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] sm:text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-semibold text-foreground">Grade {result.grade}</span>
          <span className="text-muted-foreground">·</span>
          <ResultStatusBadge status={result.status} className="text-[10px] sm:text-xs" />
        </div>

        <ChevronRight className="size-3.5 sm:size-4 text-muted-foreground" />
      </div>
    </Card>
  )
}

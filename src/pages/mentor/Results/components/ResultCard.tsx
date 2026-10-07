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
      className="md:hidden flex flex-col justify-between p-4 space-y-3 cursor-pointer select-none"
    >
      {/* Header: Student Name & Grade */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {result.studentName}
          </h3>
          <p className="text-xs text-muted-foreground font-medium font-mono mt-0.5">
            {result.studentId} · {result.classBatch}
          </p>
        </div>

        <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-primary-subtle text-primary border border-primary/20">
          [{result.grade}]
        </span>
      </div>

      {/* Middle: Exam Subject & Marks */}
      <div className="space-y-1 bg-muted/50 p-2.5 rounded-md border border-border">
        <p className="text-xs font-semibold text-foreground truncate">
          {result.examName} ({result.subject})
        </p>
        <p className="text-xs font-medium text-muted-foreground">
          {result.marksObtained} / {result.totalMarks} · <span className="text-primary font-bold">{result.percentage}%</span>
        </p>
      </div>

      {/* Footer: Grade text, Status badge & Chevron */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">Grade {result.grade}</span>
          <span className="text-muted-foreground">·</span>
          <ResultStatusBadge status={result.status} />
        </div>

        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </Card>
  )
}

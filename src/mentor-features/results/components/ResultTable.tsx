import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import type { StudentResult } from '../types'
import { ResultStatusBadge } from './ResultStatusBadge'

interface ResultTableProps {
  results: StudentResult[]
}

export function ResultTable({ results }: ResultTableProps) {
  const navigate = useNavigate()

  return (
    <Card className="hidden md:block overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Exam & Subject</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Marks & %</th>
              <th className="py-3 px-4">Grade</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm font-medium">
            {results.map((res) => (
              <tr
                key={res.id}
                onClick={() => navigate(`/mentor/results/${res.id}`)}
                className="hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                {/* Student Info */}
                <td className="py-3 px-4">
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {res.studentName}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {res.studentId}
                  </div>
                </td>

                {/* Exam & Subject */}
                <td className="py-3 px-4">
                  <div className="font-medium text-foreground truncate max-w-xs">
                    {res.examName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {res.subject}
                  </div>
                </td>

                {/* Class */}
                <td className="py-3 px-4 text-xs font-medium text-foreground">
                  {res.classBatch}
                </td>

                {/* Marks & Percentage */}
                <td className="py-3 px-4">
                  <div className="font-semibold text-foreground">
                    {res.marksObtained} / {res.totalMarks}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {res.percentage}%
                  </div>
                </td>

                {/* Grade */}
                <td className="py-3 px-4">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-md bg-primary-subtle text-primary">
                    {res.grade}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="py-3 px-4">
                  <ResultStatusBadge status={res.status} />
                </td>

                {/* Action Arrow */}
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex p-1.5 rounded-md text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="size-4" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

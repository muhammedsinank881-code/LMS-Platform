import { useState } from 'react'
import {
  Award,
  CheckCircle2,
  Percent,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import { Badge, Card, Input } from '@/components/ui'
import type { QuizItem, QuizResultSummary, QuizSubmissionItem } from '../types'

interface QuizResultsOverviewProps {
  quiz: QuizItem
  results: QuizResultSummary
  submissions: QuizSubmissionItem[]
}

export function QuizResultsOverview({
  quiz,
  results,
  submissions,
}: QuizResultsOverviewProps) {
  const [search, setSearch] = useState('')

  const passingPct = quiz.settings.passingScore || 60

  const filtered = submissions.filter((sub) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      sub.studentName.toLowerCase().includes(q) ||
      sub.studentRoll.toLowerCase().includes(q)
    )
  })

  const statCards = [
    {
      label: 'Average Score',
      value: `${results.averageScore}%`,
      icon: Award,
      color: 'text-primary bg-primary-subtle',
      desc: 'Overall performance',
    },
    {
      label: 'Highest Score',
      value: `${results.highestScore}%`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
      desc: 'Top student result',
    },
    {
      label: 'Lowest Score',
      value: `${results.lowestScore}%`,
      icon: TrendingDown,
      color: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
      desc: 'Lowest achieved score',
    },
    {
      label: 'Pass Rate',
      value: `${results.passRate}%`,
      icon: Percent,
      color: 'text-sky-600 bg-sky-500/10 dark:text-sky-400',
      desc: `Pass threshold: ${passingPct}%`,
    },
    {
      label: 'Total Attempts',
      value: results.totalAttempts,
      icon: Users,
      color: 'text-purple-600 bg-purple-500/10 dark:text-purple-400',
      desc: `${quiz.submissionsCount} of ${quiz.totalStudents} students`,
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {statCards.map((c) => {
          const Icon = c.icon
          return (
            <Card
              key={c.label}
              className="p-3 sm:p-3.5 space-y-1.5 bg-surface border-border hover:border-primary/40 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground truncate">
                  {c.label}
                </span>
                <div
                  className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${c.color}`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
              <div className="text-base sm:text-xl font-extrabold text-foreground leading-tight">
                {c.value}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">{c.desc}</div>
            </Card>
          )
        })}
      </div>

      {/* Student Result Table Header and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Student Performance Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">
            Detailed performance record for all attempts on {quiz.title}.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            type="search"
            size="sm"
            placeholder="Search student or roll..."
            leftAdornment={<Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Results Table */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground bg-surface">
          No student results match the current query.
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-border rounded-xl bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3 text-center">Attempts</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Percentage</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Performance Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((sub) => {
                  let statusLabel: 'Passed' | 'Failed' | 'Pending Review'
                  let badgeTone: 'success' | 'destructive' | 'warning'

                  if (sub.status === 'pending_review') {
                    statusLabel = 'Pending Review'
                    badgeTone = 'warning'
                  } else if (sub.percentage >= passingPct) {
                    statusLabel = 'Passed'
                    badgeTone = 'success'
                  } else {
                    statusLabel = 'Failed'
                    badgeTone = 'destructive'
                  }

                  let band = 'Distinction'
                  if (sub.percentage < passingPct) band = 'Needs Improvement'
                  else if (sub.percentage < 75) band = 'Satisfactory'
                  else if (sub.percentage < 85) band = 'Good'

                  return (
                    <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-foreground">{sub.studentName}</div>
                        <div className="text-[11px] text-muted-foreground">{sub.studentRoll}</div>
                      </td>

                      <td className="px-4 py-3.5 text-center font-medium text-foreground">
                        #{sub.attemptNumber}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-foreground">
                        {sub.score} / {sub.totalMarks}
                      </td>

                      <td className="px-4 py-3.5 text-center font-extrabold text-foreground">
                        {sub.percentage}%
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Badge
                          tone={badgeTone}
                          size="sm"
                          className="font-bold text-[10px] inline-flex items-center gap-1"
                        >
                          {statusLabel === 'Passed' && <CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
                          {statusLabel === 'Failed' && <XCircle className="h-3 w-3" aria-hidden="true" />}
                          <span>{statusLabel}</span>
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium text-muted-foreground">
                        {band}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-based View */}
          <div className="space-y-2.5 md:hidden">
            {filtered.map((sub) => {
              let statusLabel: 'Passed' | 'Failed' | 'Pending Review'
              let badgeTone: 'success' | 'destructive' | 'warning'

              if (sub.status === 'pending_review') {
                statusLabel = 'Pending Review'
                badgeTone = 'warning'
              } else if (sub.percentage >= passingPct) {
                statusLabel = 'Passed'
                badgeTone = 'success'
              } else {
                statusLabel = 'Failed'
                badgeTone = 'destructive'
              }

              return (
                <Card key={sub.id} className="p-3.5 space-y-2 bg-surface border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-foreground">
                        {sub.studentName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {sub.studentRoll} · Attempt #{sub.attemptNumber}
                      </div>
                    </div>
                    <Badge tone={badgeTone} size="sm" className="text-[10px]">
                      {statusLabel}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-t border-border/50">
                    <span className="text-muted-foreground font-medium">Final Score:</span>
                    <span className="font-bold text-foreground">
                      {sub.score} / {sub.totalMarks} ({sub.percentage}%)
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

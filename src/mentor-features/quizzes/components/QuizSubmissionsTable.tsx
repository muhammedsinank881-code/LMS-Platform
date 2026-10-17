import { useState } from 'react'
import {
  Edit,
  Eye,
  RotateCcw,
  Search,
  User,
} from 'lucide-react'
import { Badge, Button, Card, Input } from '@/components/ui'
import type { QuizItem, QuizSubmissionItem } from '../types'
import { GradeSubmissionModal } from './GradeSubmissionModal'

interface QuizSubmissionsTableProps {
  quiz: QuizItem
  submissions: QuizSubmissionItem[]
  onGradeSubmission: (
    submissionId: string,
    scores: Record<string, { score: number; feedback?: string }>,
  ) => void
  onResetAttempt: (submissionId: string) => void
}

export function QuizSubmissionsTable({
  quiz,
  submissions,
  onGradeSubmission,
  onResetAttempt,
}: QuizSubmissionsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'graded' | 'pending_review'>('all')
  const [selectedSubForGrading, setSelectedSubForGrading] = useState<QuizSubmissionItem | null>(null)
  const [gradeModalOpen, setGradeModalOpen] = useState(false)

  const filtered = submissions.filter((sub) => {
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      sub.studentName.toLowerCase().includes(q) ||
      sub.studentRoll.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleOpenGrade = (sub: QuizSubmissionItem) => {
    setSelectedSubForGrading(sub)
    setGradeModalOpen(true)
  }

  const handleSaveGrade = (
    submissionId: string,
    scores: Record<string, { score: number; feedback?: string }>,
  ) => {
    onGradeSubmission(submissionId, scores)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="w-full sm:w-72">
          <Input
            type="search"
            size="sm"
            placeholder="Search students..."
            leftAdornment={<Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-surface text-foreground font-bold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('graded')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'graded'
                ? 'bg-surface text-foreground font-bold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Graded ({submissions.filter((s) => s.status === 'graded').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending_review')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'pending_review'
                ? 'bg-surface text-foreground font-bold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Review ({submissions.filter((s) => s.status === 'pending_review').length})
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center space-y-2 bg-surface">
          <User className="h-8 w-8 text-muted-foreground mx-auto" aria-hidden="true" />
          <h4 className="text-sm font-bold text-foreground">No submissions found</h4>
          <p className="text-xs text-muted-foreground">
            {search ? 'Try adjusting your search query' : 'No student attempts have been recorded yet.'}
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-border rounded-xl bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3 text-center">Attempt</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Percentage</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((sub) => {
                  const passingPct = quiz.settings.passingScore || 60
                  const isPassed = sub.percentage >= passingPct

                  return (
                    <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-foreground">{sub.studentName}</div>
                        <div className="text-[11px] text-muted-foreground">{sub.studentRoll}</div>
                      </td>

                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {sub.submittedAt}
                      </td>

                      <td className="px-4 py-3.5 text-center font-medium text-foreground">
                        #{sub.attemptNumber}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-foreground">
                        {sub.score} / {sub.totalMarks}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`font-bold ${
                            isPassed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {sub.percentage}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Badge
                          tone={sub.status === 'graded' ? 'success' : 'warning'}
                          size="sm"
                          className="capitalize text-[10px] font-semibold"
                        >
                          {sub.status === 'graded' ? 'Graded' : 'Pending Review'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenGrade(sub)}
                            className="h-7 text-xs px-2.5 cursor-pointer"
                          >
                            {sub.status === 'pending_review' ? (
                              <>
                                <Edit className="h-3 w-3 mr-1" aria-hidden="true" />
                                <span>Grade</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" aria-hidden="true" />
                                <span>Review</span>
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onResetAttempt(sub.id)}
                            className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Reset Attempt"
                            aria-label={`Reset attempt for ${sub.studentName}`}
                          >
                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        </div>
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
              const passingPct = quiz.settings.passingScore || 60
              const isPassed = sub.percentage >= passingPct

              return (
                <Card key={sub.id} className="p-3.5 space-y-2.5 bg-surface border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-foreground">
                        {sub.studentName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {sub.studentRoll} · Attempt #{sub.attemptNumber}
                      </div>
                    </div>
                    <Badge
                      tone={sub.status === 'graded' ? 'success' : 'warning'}
                      size="sm"
                      className="text-[10px] capitalize shrink-0"
                    >
                      {sub.status === 'graded' ? 'Graded' : 'Pending Review'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-1.5 border-y border-border/50">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Score</span>
                      <span className="font-bold text-foreground">
                        {sub.score} / {sub.totalMarks}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Percentage</span>
                      <span
                        className={`font-bold ${
                          isPassed
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {sub.percentage}% ({isPassed ? 'Passed' : 'Failed'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-muted-foreground">{sub.submittedAt}</span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenGrade(sub)}
                        className="h-7 text-xs px-2"
                      >
                        {sub.status === 'pending_review' ? 'Grade' : 'Review'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onResetAttempt(sub.id)}
                        className="h-7 text-xs px-2 text-destructive"
                        aria-label={`Reset attempt for ${sub.studentName}`}
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Grade Submission Modal */}
      {selectedSubForGrading && (
        <GradeSubmissionModal
          open={gradeModalOpen}
          onOpenChange={setGradeModalOpen}
          submission={selectedSubForGrading}
          quiz={quiz}
          onSaveGrade={handleSaveGrade}
        />
      )}
    </div>
  )
}

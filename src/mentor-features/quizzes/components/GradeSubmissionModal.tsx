import { useState } from 'react'
import { CheckCircle2, User } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import type { QuizItem, QuizSubmissionItem } from '../types'

interface GradeSubmissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: QuizSubmissionItem | null
  quiz: QuizItem
  onSaveGrade: (
    submissionId: string,
    scores: Record<string, { score: number; feedback?: string }>,
  ) => void
}

export function GradeSubmissionModal({
  open,
  onOpenChange,
  submission,
  quiz,
  onSaveGrade,
}: GradeSubmissionModalProps) {
  if (!submission) return null

  return (
    <GradeSubmissionModalContent
      open={open}
      onOpenChange={onOpenChange}
      submission={submission}
      quiz={quiz}
      onSaveGrade={onSaveGrade}
    />
  )
}

function GradeSubmissionModalContent({
  open,
  onOpenChange,
  submission,
  quiz,
  onSaveGrade,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: QuizSubmissionItem
  quiz: QuizItem
  onSaveGrade: (
    submissionId: string,
    scores: Record<string, { score: number; feedback?: string }>,
  ) => void
}) {
  // Local state for each question's score and feedback
  const [scores, setScores] = useState<
    Record<string, { score: number; feedback: string }>
  >(() => {
    const map: Record<string, { score: number; feedback: string }> = {}
    quiz.questions.forEach((q) => {
      const recorded = submission.answers[q.id]
      map[q.id] = {
        score: recorded?.scoreAwarded ?? (recorded?.isCorrect ? q.marks : 0),
        feedback: recorded?.mentorFeedback || '',
      }
    })
    return map
  })

  const handleScoreChange = (qId: string, val: string, maxMarks: number) => {
    const num = Math.min(maxMarks, Math.max(0, Number(val) || 0))
    setScores((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], score: num },
    }))
  }

  const handleFeedbackChange = (qId: string, text: string) => {
    setScores((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], feedback: text },
    }))
  }

  const calculatedTotal = Object.values(scores).reduce(
    (sum, item) => sum + (item.score || 0),
    0,
  )
  const calculatedPercentage =
    quiz.totalMarks > 0 ? Math.round((calculatedTotal / quiz.totalMarks) * 100) : 0

  const handleSave = () => {
    onSaveGrade(submission.id, scores)
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <ModalHeader className="p-4 sm:p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                <User className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <ModalTitle className="text-base sm:text-lg font-bold text-foreground">
                  Review & Grade Submission
                </ModalTitle>
                <ModalDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-foreground">{submission.studentName}</span>
                  <span>•</span>
                  <span>{submission.studentRoll}</span>
                  <span>•</span>
                  <span>Attempt #{submission.attemptNumber}</span>
                </ModalDescription>
              </div>
            </div>

            {/* Current Total Score Indicator */}
            <div className="text-right sm:text-right bg-muted/40 p-2 rounded-lg border border-border/60 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Total Score
              </span>
              <span className="text-sm sm:text-base font-extrabold text-primary">
                {calculatedTotal} / {quiz.totalMarks} ({calculatedPercentage}%)
              </span>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {quiz.questions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No questions found in this quiz definition to evaluate.
            </p>
          ) : (
            quiz.questions.map((q, idx) => {
              const studentAnswerData = submission.answers[q.id]
              const currentScoreItem = scores[q.id] || { score: 0, feedback: '' }

              return (
                <Card
                  key={q.id}
                  className="p-3.5 sm:p-4 space-y-2.5 bg-surface border-border shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Question {idx + 1}
                      </span>
                      <Badge tone="neutral" size="sm" className="text-[10px]">
                        Max: {q.marks} Marks
                      </Badge>
                      {studentAnswerData?.isCorrect === true && (
                        <Badge tone="success" size="sm" className="text-[10px]">
                          Auto Correct
                        </Badge>
                      )}
                      {studentAnswerData?.isCorrect === false && (
                        <Badge tone="destructive" size="sm" className="text-[10px]">
                          Auto Incorrect
                        </Badge>
                      )}
                      {q.type === 'short_answer' && (
                        <Badge tone="warning" size="sm" className="text-[10px]">
                          Requires Mentor Review
                        </Badge>
                      )}
                    </div>

                    {/* Score Award Input */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label htmlFor={`score-${q.id}`} className="text-xs font-semibold text-muted-foreground">
                        Score:
                      </label>
                      <input
                        id={`score-${q.id}`}
                        type="number"
                        min={0}
                        max={q.marks}
                        step="0.5"
                        value={currentScoreItem.score}
                        onChange={(e) => handleScoreChange(q.id, e.target.value, q.marks)}
                        className="w-16 h-8 text-center text-xs font-bold border border-input rounded-md bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`Score for question ${idx + 1}`}
                      />
                      <span className="text-xs text-muted-foreground">/ {q.marks}</span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-xs sm:text-sm font-semibold text-foreground">
                    {q.questionText}
                  </p>

                  {/* Student's Answer */}
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Student's Submitted Answer:
                    </span>
                    <div className="font-medium text-foreground">
                      {q.type === 'multiple_choice' && (
                        <span>
                          {q.options?.find((o) => o.id === studentAnswerData?.studentAnswer)?.text ||
                            String(studentAnswerData?.studentAnswer || 'No answer submitted')}
                        </span>
                      )}
                      {q.type === 'multiple_select' && Array.isArray(studentAnswerData?.studentAnswer) && (
                        <span>
                          {studentAnswerData.studentAnswer
                            .map((optId) => q.options?.find((o) => o.id === optId)?.text || optId)
                            .join(', ')}
                        </span>
                      )}
                      {q.type === 'true_false' && (
                        <span>{String(studentAnswerData?.studentAnswer) === 'true' ? 'True' : 'False'}</span>
                      )}
                      {q.type === 'short_answer' && (
                        <p className="italic">{String(studentAnswerData?.studentAnswer || 'No response')}</p>
                      )}
                    </div>
                  </div>

                  {/* Reference / Expected Answer */}
                  {q.type === 'short_answer' && q.correctAnswer && (
                    <div className="text-[11px] text-muted-foreground bg-muted/10 p-2 rounded border border-border/40">
                      <strong className="text-foreground">Reference Answer: </strong>
                      {String(q.correctAnswer)}
                    </div>
                  )}

                  {/* Feedback field */}
                  <div className="space-y-1 pt-1">
                    <label htmlFor={`feedback-${q.id}`} className="text-[11px] font-semibold text-muted-foreground block">
                      Mentor Feedback for Student (Optional)
                    </label>
                    <input
                      id={`feedback-${q.id}`}
                      type="text"
                      placeholder="e.g. Great explanation, or needs more clarity on..."
                      value={currentScoreItem.feedback}
                      onChange={(e) => handleFeedbackChange(q.id, e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-input bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </Card>
              )
            })
          )}
        </ModalBody>

        <ModalFooter className="p-3.5 sm:p-4 bg-muted/30 border-t border-border flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="text-xs font-bold cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
            <span>Save & Release Grade</span>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

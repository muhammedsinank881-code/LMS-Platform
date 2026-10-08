import { useEffect, useState } from 'react'
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Clock, XCircle } from 'lucide-react'
import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ProgressBar,
} from '@/components/ui'
import type { StudentTask } from '../data/assignmentsData'

interface QuizAttemptModalProps {
  task: StudentTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompleteQuiz: (taskId: string, earnedPoints: number, totalPoints: number) => void
}

export function QuizAttemptModal({
  task,
  open,
  onOpenChange,
  onCompleteQuiz,
}: QuizAttemptModalProps) {
  return (
    <QuizAttemptModalContent
      key={open ? task?.id ?? 'open-without-task' : 'closed'}
      task={task}
      open={open}
      onOpenChange={onOpenChange}
      onCompleteQuiz={onCompleteQuiz}
    />
  )
}

function QuizAttemptModalContent({
  task,
  open,
  onOpenChange,
  onCompleteQuiz,
}: QuizAttemptModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((task?.timeLimitMinutes || 15) * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  const questions = task?.questions || []

  // Timer countdown
  useEffect(() => {
    if (!open || isSubmitted || timeLeftSeconds <= 0) return
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [open, isSubmitted, timeLeftSeconds])

  if (!task || questions.length === 0) return null

  const minutes = Math.floor(timeLeftSeconds / 60)
  const seconds = timeLeftSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const currentQuestion = questions[currentQuestionIndex]

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }))
  }

  const handleFinishQuiz = () => {
    let earned = 0
    const pointsPerQuestion = task.points / questions.length

    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        earned += pointsPerQuestion
      }
    })

    const finalEarned = Math.round(earned)
    setFinalScore(finalEarned)
    setIsSubmitted(true)
    onCompleteQuiz(task.id, finalEarned, task.points)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="flex max-h-[85vh] flex-col">
        <ModalHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                {task.courseCode}
              </span>
              <Badge tone="primary" appearance="soft" size="sm" className="text-[11px]">
                {task.course}
              </Badge>
            </div>

            {!isSubmitted && (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Time Remaining: {formattedTime}</span>
              </div>
            )}
          </div>

          <ModalTitle className="mt-1 text-xl font-bold text-foreground">{task.title}</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4 overflow-y-auto py-4 text-xs">
          {!isSubmitted ? (
            /* Quiz Active Question Runner */
            <div className="space-y-4">
              {/* Progress Indicator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="font-semibold text-foreground">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <ProgressBar
                  value={((currentQuestionIndex + 1) / questions.length) * 100}
                  size="sm"
                />
              </div>

              {/* Question Text */}
              <div className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
                <h3 className="flex items-start gap-2 text-sm font-bold leading-relaxed text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xs font-bold text-primary">
                    {currentQuestionIndex + 1}
                  </span>
                  {currentQuestion.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2 pt-2">
                  {currentQuestion.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === oIdx
                    return (
                      <button
                        type="button"
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary-subtle/50 font-semibold text-primary'
                            : 'bg-surface-hover border-border text-foreground hover:border-primary/40'
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border text-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="text-xs">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quiz Stepper Navigation */}
              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="gap-1 text-xs font-semibold"
                  >
                    Next Question <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleFinishQuiz}
                    className="gap-1 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Finish & Submit Quiz
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed Result Summary Screen */
            <div className="space-y-6 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Award className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <Badge
                  tone="success"
                  appearance="solid"
                  size="lg"
                  className="px-4 py-1 text-sm font-bold"
                >
                  Quiz Completed!
                </Badge>
                <h3 className="mt-2 text-2xl font-extrabold text-foreground">
                  Score: {finalScore} / {task.points} (
                  {Math.round((finalScore / task.points) * 100)}%)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your results have been submitted and added to your academic record.
                </p>
              </div>

              {/* Questions Review List */}
              <div className="space-y-3 border-t border-border/60 pt-3 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Answer Breakdown ({questions.length} Questions)
                </h4>

                {questions.map((q, idx) => {
                  const userChoice = selectedAnswers[q.id]
                  const isCorrect = userChoice === q.correctOptionIndex

                  return (
                    <div
                      key={q.id}
                      className="space-y-2 rounded-lg border border-border bg-surface p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {idx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-500">
                            <CheckCircle2 className="h-4 w-4" /> Correct
                          </span>
                        ) : (
                          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-rose-500">
                            <XCircle className="h-4 w-4" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="bg-surface-hover space-y-1 rounded p-2 text-[11px] text-muted-foreground">
                        <p>
                          <strong>Your Answer:</strong>{' '}
                          {userChoice !== undefined ? q.options[userChoice] : 'Not answered'}
                        </p>
                        {!isCorrect && (
                          <p className="font-medium text-emerald-600 dark:text-emerald-400">
                            <strong>Correct Answer:</strong> {q.options[q.correctOptionIndex]}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="pt-1 italic text-muted-foreground">{q.explanation}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="w-full text-xs font-semibold"
                >
                  Close Results
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

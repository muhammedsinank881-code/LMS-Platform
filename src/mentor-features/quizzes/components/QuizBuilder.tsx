import { useState } from 'react'
import {
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit3,
  FileQuestion,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import type { QuizItem, QuizQuestion } from '../types'
import { QuestionEditorModal } from './QuestionEditorModal'

interface QuizBuilderProps {
  quiz: QuizItem
  onAddQuestion: (question: Omit<QuizQuestion, 'id' | 'questionNumber'>) => void
  onUpdateQuestion: (questionId: string, updates: Partial<QuizQuestion>) => void
  onDeleteQuestion: (questionId: string) => void
  onDuplicateQuestion: (questionId: string) => void
  onReorderQuestions: (questionIds: string[]) => void
}

export function QuizBuilder({
  quiz,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onReorderQuestions,
}: QuizBuilderProps) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)

  const questions = quiz.questions || []
  const totalQuestions = questions.length
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0)

  const handleOpenAdd = () => {
    setEditingQuestion(null)
    setEditorOpen(true)
  }

  const handleOpenEdit = (q: QuizQuestion) => {
    setEditingQuestion(q)
    setEditorOpen(true)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const ids = questions.map((q) => q.id)
    const temp = ids[index - 1]
    ids[index - 1] = ids[index]
    ids[index] = temp
    onReorderQuestions(ids)
  }

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return
    const ids = questions.map((q) => q.id)
    const temp = ids[index + 1]
    ids[index + 1] = ids[index]
    ids[index] = temp
    onReorderQuestions(ids)
  }

  const handleSaveQuestion = (data: Omit<QuizQuestion, 'id' | 'questionNumber'>) => {
    if (editingQuestion) {
      onUpdateQuestion(editingQuestion.id, data)
    } else {
      onAddQuestion(data)
    }
  }

  const typeLabels: Record<QuizQuestion['type'], string> = {
    multiple_choice: 'Multiple Choice',
    multiple_select: 'Multiple Select',
    true_false: 'True / False',
    short_answer: 'Short Answer',
  }

  return (
    <div className="space-y-4">
      {/* Quiz Builder Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0">
            <Award className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Total Questions
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground">
                {totalQuestions}
              </span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Total Marks
              </span>
              <span className="text-sm sm:text-base font-bold text-primary">
                {totalMarks} Marks
              </span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Passing Mark
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground">
                {quiz.passingScore} ({quiz.settings.passingScore}%)
              </span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          className="text-xs font-semibold h-8 sm:h-9 cursor-pointer shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          <span>Add Question</span>
        </Button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card className="p-8 text-center space-y-3 bg-surface border-dashed">
          <div className="h-12 w-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto">
            <FileQuestion className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-foreground">
              No questions in this quiz yet
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add multiple choice, multiple select, true/false, or short-answer questions to this quiz.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenAdd}
            className="text-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            <span>Add First Question</span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <Card
              key={q.id}
              className="p-3.5 sm:p-5 space-y-3 bg-surface border-border hover:border-primary/40 transition-colors shadow-2xs"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="h-6 w-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <Badge tone="neutral" size="sm" className="text-[10px] font-semibold">
                    {typeLabels[q.type]}
                  </Badge>
                  <Badge tone="primary" size="sm" className="text-[10px] font-bold">
                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                  </Badge>
                  {q.isRequired && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      (Required)
                    </span>
                  )}
                </div>

                {/* Reorder & Action Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label={`Move question ${idx + 1} up`}
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === questions.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label={`Move question ${idx + 1} down`}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </Button>

                  <div className="h-4 w-px bg-border mx-1" />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(q)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    aria-label={`Edit question ${idx + 1}`}
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicateQuestion(q.id)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    aria-label={`Duplicate question ${idx + 1}`}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    <span>Copy</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteQuestion(q.id)}
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                    aria-label={`Delete question ${idx + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
                {q.questionText}
              </div>

              {/* Render Question Answer / Options Preview */}
              {(q.type === 'multiple_choice' || q.type === 'multiple_select') && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx)
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs border ${
                          opt.isCorrect
                            ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : 'border-border bg-muted/20 text-foreground'
                        }`}
                      >
                        <span className="font-bold text-muted-foreground w-4 shrink-0">
                          {letter}.
                        </span>
                        <span className="flex-1 truncate">{opt.text}</span>
                        {opt.isCorrect && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Correct</span>
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {q.type === 'true_false' && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-muted-foreground font-medium">Correct Answer:</span>
                  <Badge tone="success" size="sm" className="font-bold text-xs">
                    {String(q.correctAnswer) === 'true' ? 'True' : 'False'}
                  </Badge>
                </div>
              )}

              {q.type === 'short_answer' && (
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Expected Reference Answer
                  </span>
                  <p className="text-foreground italic">
                    {typeof q.correctAnswer === 'string' && q.correctAnswer ? q.correctAnswer : 'Any relevant answer requiring mentor evaluation.'}
                  </p>
                </div>
              )}

              {q.explanation && (
                <div className="text-[11px] text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/50 flex items-start gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-foreground font-semibold">Explanation: </strong>
                    {q.explanation}
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Question Editor Modal */}
      <QuestionEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialQuestion={editingQuestion}
        onSave={handleSaveQuestion}
      />
    </div>
  )
}

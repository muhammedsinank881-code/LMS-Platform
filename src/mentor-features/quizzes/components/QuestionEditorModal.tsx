import { useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
  Switch,
  Textarea,
} from '@/components/ui'
import type { QuestionOption, QuestionType, QuizQuestion } from '../types'

interface QuestionEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuestion?: QuizQuestion | null
  onSave: (question: Omit<QuizQuestion, 'id' | 'questionNumber'>) => void
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice (Single Answer)' },
  { value: 'multiple_select', label: 'Multiple Select (Multiple Answers)' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
]

export function QuestionEditorModal({
  open,
  onOpenChange,
  initialQuestion,
  onSave,
}: QuestionEditorModalProps) {
  const [type, setType] = useState<QuestionType>(
    initialQuestion?.type || 'multiple_choice',
  )
  const [questionText, setQuestionText] = useState(
    initialQuestion?.questionText || '',
  )
  const [marks, setMarks] = useState(
    initialQuestion ? String(initialQuestion.marks) : '2',
  )
  const [explanation, setExplanation] = useState(
    initialQuestion?.explanation || '',
  )
  const [isRequired, setIsRequired] = useState(
    initialQuestion?.isRequired ?? true,
  )

  // Options for MCQ / Multi-select
  const [options, setOptions] = useState<QuestionOption[]>(() => {
    if (initialQuestion?.options && initialQuestion.options.length > 0) {
      return initialQuestion.options
    }
    return [
      { id: 'opt-1', text: 'Option A', isCorrect: true },
      { id: 'opt-2', text: 'Option B', isCorrect: false },
      { id: 'opt-3', text: 'Option C', isCorrect: false },
      { id: 'opt-4', text: 'Option D', isCorrect: false },
    ]
  })

  // True / False state
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(() => {
    if (initialQuestion?.type === 'true_false' && typeof initialQuestion.correctAnswer === 'boolean') {
      return initialQuestion.correctAnswer
    }
    return true
  })

  // Short Answer state
  const [expectedAnswer, setExpectedAnswer] = useState<string>(() => {
    if (initialQuestion?.type === 'short_answer' && typeof initialQuestion.correctAnswer === 'string') {
      return initialQuestion.correctAnswer
    }
    return ''
  })

  const [error, setError] = useState<string | null>(null)

  const handleOptionTextChange = (id: string, text: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt)),
    )
  }

  const handleSingleCorrectChange = (id: string) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id,
      })),
    )
  }

  const handleMultiCorrectToggle = (id: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt)),
    )
  }

  const handleAddOption = () => {
    const nextIndex = options.length + 1
    const letter = String.fromCharCode(64 + nextIndex)
    setOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}-${nextIndex}`, text: `Option ${letter}`, isCorrect: false },
    ])
  }

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return
    setOptions((prev) => prev.filter((opt) => opt.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!questionText.trim()) {
      setError('Question text is required.')
      return
    }

    const marksNum = parseInt(marks, 10) || 1

    let correctAnswer: string | string[] | boolean = ''

    if (type === 'multiple_choice') {
      const correct = options.find((o) => o.isCorrect)
      if (!correct) {
        setError('Please select the correct option.')
        return
      }
      correctAnswer = correct.id
    } else if (type === 'multiple_select') {
      const correctList = options.filter((o) => o.isCorrect).map((o) => o.id)
      if (correctList.length === 0) {
        setError('Please mark at least one correct option.')
        return
      }
      correctAnswer = correctList
    } else if (type === 'true_false') {
      correctAnswer = trueFalseAnswer
    } else if (type === 'short_answer') {
      correctAnswer = expectedAnswer.trim()
    }

    onSave({
      type,
      questionText: questionText.trim(),
      options: type === 'multiple_choice' || type === 'multiple_select' ? options : undefined,
      correctAnswer,
      marks: marksNum,
      explanation: explanation.trim(),
      isRequired,
    })

    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <ModalHeader className="p-4 sm:p-5 border-b border-border">
            <ModalTitle className="text-base sm:text-lg font-bold text-foreground">
              {initialQuestion ? `Edit Question #${initialQuestion.questionNumber}` : 'Add New Question'}
            </ModalTitle>
            <ModalDescription className="text-xs text-muted-foreground">
              Define the question prompt, choose question format, set correct answers, and allocate marks.
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            {/* Question Type & Marks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="question-type" className="text-xs font-bold text-foreground block">
                  Question Type
                </label>
                <Select
                  id="question-type"
                  options={QUESTION_TYPES}
                  value={type}
                  onValueChange={(val) => setType(val as QuestionType)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="question-marks" className="text-xs font-bold text-foreground block">
                  Marks
                </label>
                <Input
                  id="question-marks"
                  type="number"
                  min={1}
                  max={50}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
              </div>
            </div>

            {/* Question Prompt */}
            <div className="space-y-1.5">
              <label htmlFor="question-prompt" className="text-xs font-bold text-foreground block">
                Question Text <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="question-prompt"
                rows={3}
                placeholder="Enter the question text or prompt here..."
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value)
                  if (error) setError(null)
                }}
                required
              />
            </div>

            {/* OPTIONS SECTION BASED ON QUESTION TYPE */}

            {/* 1. Multiple Choice (Single Select) */}
            {type === 'multiple_choice' && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Options & Correct Answer (Select Radio for Correct Choice)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddOption}
                    className="text-xs text-primary h-7 px-2"
                  >
                    <Plus className="h-3 w-3 mr-1" aria-hidden="true" />
                    <span>Add Option</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx)
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                          opt.isCorrect
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30'
                            : 'border-border bg-surface'
                        }`}
                      >
                        {/* Radio selection for correct answer */}
                        <button
                          type="button"
                          onClick={() => handleSingleCorrectChange(opt.id)}
                          className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                            opt.isCorrect
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-muted-foreground/40 hover:border-foreground'
                          }`}
                          aria-label={`Mark Option ${letter} as correct answer`}
                        >
                          {opt.isCorrect && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                        </button>

                        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
                          {letter}.
                        </span>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                          placeholder={`Option ${letter} text`}
                          className="flex-1 bg-transparent border-0 text-xs text-foreground focus:outline-none"
                          aria-label={`Option ${letter} text`}
                        />

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(opt.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                            aria-label={`Delete option ${letter}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 2. Multiple Select */}
            {type === 'multiple_select' && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Options (Check all that apply as correct)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddOption}
                    className="text-xs text-primary h-7 px-2"
                  >
                    <Plus className="h-3 w-3 mr-1" aria-hidden="true" />
                    <span>Add Option</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx)
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                          opt.isCorrect
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30'
                            : 'border-border bg-surface'
                        }`}
                      >
                        <Checkbox
                          checked={opt.isCorrect}
                          onCheckedChange={() => handleMultiCorrectToggle(opt.id)}
                          aria-label={`Mark Option ${letter} as a correct answer`}
                        />

                        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
                          {letter}.
                        </span>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                          placeholder={`Option ${letter} text`}
                          className="flex-1 bg-transparent border-0 text-xs text-foreground focus:outline-none"
                          aria-label={`Option ${letter} text`}
                        />

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(opt.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                            aria-label={`Delete option ${letter}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. True / False */}
            {type === 'true_false' && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-foreground block">
                  Select Correct Answer
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTrueFalseAnswer(true)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      trueFalseAnswer
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-border bg-surface text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {trueFalseAnswer && <Check className="h-4 w-4" aria-hidden="true" />}
                    <span>True</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrueFalseAnswer(false)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      !trueFalseAnswer
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-border bg-surface text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {!trueFalseAnswer && <Check className="h-4 w-4" aria-hidden="true" />}
                    <span>False</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Short Answer */}
            {type === 'short_answer' && (
              <div className="space-y-1.5 pt-1">
                <label htmlFor="question-expected-answer" className="text-xs font-bold text-foreground block">
                  Expected Answer / Key Points for Grading
                </label>
                <Textarea
                  id="question-expected-answer"
                  rows={2}
                  placeholder="Provide reference answer or keywords to help with grading..."
                  value={expectedAnswer}
                  onChange={(e) => setExpectedAnswer(e.target.value)}
                />
              </div>
            )}

            {/* Explanation & Feedback */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor="question-explanation" className="text-xs font-bold text-foreground block">
                Explanation / Solution Note (Shown after submission)
              </label>
              <Textarea
                id="question-explanation"
                rows={2}
                placeholder="Explain why the answer is correct..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </div>

            {/* Required Question Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">Required Question</span>
                <p className="text-[11px] text-muted-foreground">
                  Students must answer this question before submitting the quiz.
                </p>
              </div>
              <Switch
                checked={isRequired}
                onCheckedChange={setIsRequired}
                aria-label="Required question toggle"
              />
            </div>
          </ModalBody>

          <ModalFooter className="p-3.5 sm:p-4 bg-muted/30 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="text-xs font-bold cursor-pointer">
              <span>{initialQuestion ? 'Update Question' : 'Save Question'}</span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

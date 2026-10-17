import { useState } from 'react'
import { CheckCircle2, FileText, HelpCircle, Settings2, Sliders } from 'lucide-react'
import {
  Button,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { QuizItem, QuizStatus } from '../types'

interface CreateQuizModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (quizData: Omit<QuizItem, 'id' | 'createdAt' | 'submissionsCount' | 'averageScore'>) => void
}

const CLASS_OPTIONS = [
  { value: 'BCA - 3rd Year', label: 'BCA - 3rd Year' },
  { value: 'BCA - 4th Semester', label: 'BCA - 4th Semester' },
  { value: 'BCA - 2nd Year', label: 'BCA - 2nd Year' },
  { value: 'MCA - 1st Year', label: 'MCA - 1st Year' },
  { value: 'B.Tech CS - 3rd Year', label: 'B.Tech CS - 3rd Year' },
]

const SUBJECT_OPTIONS = [
  { value: 'Web Development & React', label: 'Web Development & React' },
  { value: 'Python Programming', label: 'Python Programming' },
  { value: 'Database Management Systems', label: 'Database Management Systems' },
  { value: 'Data Structures & Algorithms', label: 'Data Structures & Algorithms' },
  { value: 'Cloud Computing & DevOps', label: 'Cloud Computing & DevOps' },
]

export function CreateQuizModal({ open, onOpenChange, onCreate }: CreateQuizModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'quiz_settings' | 'question_settings'>('basic')

  // Basic Information
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [classBatch, setClassBatch] = useState(CLASS_OPTIONS[0].value)
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0].value)

  // Quiz Settings
  const [questionCount, setQuestionCount] = useState('20')
  const [durationMinutes, setDurationMinutes] = useState('30')
  const [passingScore, setPassingScore] = useState('70')
  const [maxAttempts, setMaxAttempts] = useState('2')
  const [startDate, setStartDate] = useState('2026-10-18')
  const [endDate, setEndDate] = useState('2026-10-25')

  // Question Settings
  const [randomizeQuestions, setRandomizeQuestions] = useState(true)
  const [randomizeOptions, setRandomizeOptions] = useState(true)
  const [showResultsAfterSubmission, setShowResultsAfterSubmission] = useState(true)
  const [allowRetake, setAllowRetake] = useState(true)

  // Errors
  const [errors, setErrors] = useState<{ title?: string; dates?: string }>({})

  const validate = () => {
    const errs: { title?: string; dates?: string } = {}
    if (!title.trim()) {
      errs.title = 'Quiz title is required'
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errs.dates = 'End date cannot be earlier than start date'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = (statusToSet: QuizStatus) => {
    if (!validate()) {
      setActiveTab('basic')
      return
    }

    const qCount = parseInt(questionCount, 10) || 10
    const dur = parseInt(durationMinutes, 10) || 30
    const passPct = parseInt(passingScore, 10) || 60
    const totalMarks = qCount * 2

    // Format availableUntil
    const endObj = new Date(endDate)
    const formattedUntil = !isNaN(endObj.getTime())
      ? endObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '25 Oct 2026'

    const quizData: Omit<QuizItem, 'id' | 'createdAt' | 'submissionsCount' | 'averageScore'> = {
      title: title.trim(),
      description: description.trim(),
      classBatch,
      subject,
      status: statusToSet,
      questionCount: qCount,
      durationMinutes: dur,
      totalMarks,
      passingScore: Math.round((passPct / 100) * totalMarks),
      availableUntil: formattedUntil,
      startDate,
      totalStudents: 24,
      settings: {
        questionCount: qCount,
        durationMinutes: dur,
        passingScore: passPct,
        maxAttempts: parseInt(maxAttempts, 10) || 1,
        startDate,
        endDate,
        randomizeQuestions,
        randomizeOptions,
        showResultsAfterSubmission,
        allowRetake,
      },
      questions: [],
    }

    onCreate(quizData)
    onOpenChange(false)

    // Reset
    setTitle('')
    setDescription('')
    setActiveTab('basic')
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <ModalHeader className="p-4 sm:p-6 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <ModalTitle className="text-base sm:text-lg font-bold text-foreground">
                Create New Quiz
              </ModalTitle>
              <ModalDescription className="text-xs text-muted-foreground">
                Configure quiz details, attempt limits, timing rules, and question randomization.
              </ModalDescription>
            </div>
          </div>

          {/* Configuration Sections Tabs */}
          <div className="pt-3">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'basic' | 'quiz_settings' | 'question_settings')}
              variant="pill"
            >
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="basic" className="text-xs flex items-center gap-1.5 justify-center">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="quiz_settings" className="text-xs flex items-center gap-1.5 justify-center">
                  <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Quiz Settings</span>
                </TabsTrigger>
                <TabsTrigger value="question_settings" className="text-xs flex items-center gap-1.5 justify-center">
                  <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Question Rules</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </ModalHeader>

        <ModalBody className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="space-y-1.5">
                <label htmlFor="quiz-title" className="text-xs font-bold text-foreground block">
                  Quiz Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="quiz-title"
                  placeholder="e.g. React Hooks & State Management Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? 'quiz-title-error' : undefined}
                />
                {errors.title && (
                  <p id="quiz-title-error" className="text-xs text-destructive font-medium">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="quiz-desc" className="text-xs font-bold text-foreground block">
                  Description / Instructions
                </label>
                <Textarea
                  id="quiz-desc"
                  rows={3}
                  placeholder="Provide instructions, topics covered, and guidelines for students..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="quiz-class" className="text-xs font-bold text-foreground block">
                    Class / Batch <span className="text-destructive">*</span>
                  </label>
                  <Select
                    id="quiz-class"
                    options={CLASS_OPTIONS}
                    value={classBatch}
                    onValueChange={(val) => setClassBatch(val)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="quiz-subject" className="text-xs font-bold text-foreground block">
                    Subject / Module <span className="text-destructive">*</span>
                  </label>
                  <Select
                    id="quiz-subject"
                    options={SUBJECT_OPTIONS}
                    value={subject}
                    onValueChange={(val) => setSubject(val)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUIZ SETTINGS */}
          {activeTab === 'quiz_settings' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="quiz-question-count" className="text-xs font-bold text-foreground block">
                    Number of Questions
                  </label>
                  <Input
                    id="quiz-question-count"
                    type="number"
                    min={1}
                    max={100}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                  />
                  <span className="text-[11px] text-muted-foreground">Target questions count</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="quiz-duration" className="text-xs font-bold text-foreground block">
                    Duration (Minutes)
                  </label>
                  <Input
                    id="quiz-duration"
                    type="number"
                    min={5}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  />
                  <span className="text-[11px] text-muted-foreground">Countdown timer for attempts</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="quiz-passing" className="text-xs font-bold text-foreground block">
                    Passing Score (%)
                  </label>
                  <Input
                    id="quiz-passing"
                    type="number"
                    min={0}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                  />
                  <span className="text-[11px] text-muted-foreground">Min % required to pass</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="quiz-attempts" className="text-xs font-bold text-foreground block">
                    Maximum Attempts
                  </label>
                  <Input
                    id="quiz-attempts"
                    type="number"
                    min={1}
                    max={10}
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                  />
                  <span className="text-[11px] text-muted-foreground">Allowed retakes per student</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border">
                <div className="space-y-1.5">
                  <label htmlFor="quiz-start-date" className="text-xs font-bold text-foreground block">
                    Start Date / Availability
                  </label>
                  <Input
                    id="quiz-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="quiz-end-date" className="text-xs font-bold text-foreground block">
                    End Date / Deadline
                  </label>
                  <Input
                    id="quiz-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              {errors.dates && (
                <p className="text-xs text-destructive font-medium">{errors.dates}</p>
              )}
            </div>
          )}

          {/* TAB 3: QUESTION SETTINGS & BEHAVIOR */}
          {activeTab === 'question_settings' && (
            <div className="space-y-3.5 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                <div className="space-y-0.5 pr-3">
                  <span className="text-xs font-bold text-foreground block">Randomize Questions</span>
                  <p className="text-[11px] text-muted-foreground">
                    Shuffle the order of questions for each student attempt to discourage cheating.
                  </p>
                </div>
                <Switch
                  checked={randomizeQuestions}
                  onCheckedChange={setRandomizeQuestions}
                  aria-label="Randomize questions"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                <div className="space-y-0.5 pr-3">
                  <span className="text-xs font-bold text-foreground block">Randomize Options</span>
                  <p className="text-[11px] text-muted-foreground">
                    Shuffle multiple choice option orders (A, B, C, D) dynamically.
                  </p>
                </div>
                <Switch
                  checked={randomizeOptions}
                  onCheckedChange={setRandomizeOptions}
                  aria-label="Randomize options"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                <div className="space-y-0.5 pr-3">
                  <span className="text-xs font-bold text-foreground block">
                    Show Results After Submission
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Allow students to view their score and question explanations right after finishing.
                  </p>
                </div>
                <Switch
                  checked={showResultsAfterSubmission}
                  onCheckedChange={setShowResultsAfterSubmission}
                  aria-label="Show results after submission"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                <div className="space-y-0.5 pr-3">
                  <span className="text-xs font-bold text-foreground block">Allow Retake</span>
                  <p className="text-[11px] text-muted-foreground">
                    Enable retake attempts up to the configured maximum attempts.
                  </p>
                </div>
                <Switch
                  checked={allowRetake}
                  onCheckedChange={setAllowRetake}
                  aria-label="Allow retake"
                />
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="p-3.5 sm:p-4 bg-muted/30 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSave('draft')}
              className="cursor-pointer text-xs"
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleSave('active')}
              className="cursor-pointer text-xs font-bold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              <span>Publish Quiz</span>
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

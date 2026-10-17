import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileQuestion,
  HelpCircle,
  Percent,
  Sliders,
  Users,
} from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  QuizBuilder,
  QuizResultsOverview,
  QuizSubmissionsTable,
} from '../components'
import { useQuizzes } from '../hooks/useQuizzes'
import type { QuizItem } from '../types'

export function QuizDetailsPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const {
    getQuizById,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    getSubmissions,
    gradeSubmission,
    resetAttempt,
    getResultSummary,
  } = useQuizzes()

  const initialTab = (searchParams.get('tab') as 'overview' | 'questions' | 'submissions' | 'results') || 'overview'
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'submissions' | 'results'>(initialTab)

  const quiz = getQuizById(quizId || '')

  const submissions = useMemo(() => {
    return quiz ? getSubmissions(quiz.id) : []
  }, [quiz, getSubmissions])

  const results = useMemo(() => {
    return quiz ? getResultSummary(quiz.id) : {
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
      totalAttempts: 0,
    }
  }, [quiz, getResultSummary])

  if (!quiz) {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate('/mentor/quizzes')}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
          <span>Back to Quizzes</span>
        </Button>
        <Card className="p-8 text-center space-y-2">
          <h2 className="text-base font-bold text-foreground">Quiz Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The requested quiz could not be located.
          </p>
        </Card>
      </div>
    )
  }

  const handleTabChange = (val: string) => {
    const tab = val as 'overview' | 'questions' | 'submissions' | 'results'
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const handlePublish = () => {
    updateQuiz(quiz.id, { status: 'active' })
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      deleteQuiz(quiz.id)
      navigate('/mentor/quizzes')
    }
  }

  const statusToneMap: Record<QuizItem['status'], 'success' | 'primary' | 'neutral' | 'warning'> = {
    active: 'success',
    completed: 'primary',
    draft: 'neutral',
    scheduled: 'warning',
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-foreground">
      {/* Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('/mentor/quizzes')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5 sm:size-4" aria-hidden="true" />
          <span>Back to Quizzes</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge
            tone={statusToneMap[quiz.status]}
            size="sm"
            className="capitalize text-[10px] sm:text-xs font-semibold"
          >
            {quiz.status}
          </Badge>

          {quiz.status === 'draft' && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePublish}
              className="text-xs h-7 sm:h-8 px-2.5 font-bold cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              <span>Publish Quiz</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-xs h-7 sm:h-8 px-2 text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Quiz Hero Card */}
      <Card className="p-3.5 sm:p-6 space-y-4 bg-surface border-border shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-primary-subtle text-primary shrink-0">
              <HelpCircle className="size-6 sm:size-8" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {quiz.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="text-foreground font-semibold flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {quiz.classBatch}
                </span>
                <span>•</span>
                <span>{quiz.subject}</span>
                <span>•</span>
                <span>Created {quiz.createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Quick Metrics in Horizontal Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 pt-2 border-t border-border">
          <div className="p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Duration
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {quiz.durationMinutes} mins
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
              <FileQuestion className="h-3 w-3" aria-hidden="true" />
              Questions
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {quiz.questionCount} Questions
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
              <Award className="h-3 w-3" aria-hidden="true" />
              Total Marks
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {quiz.totalMarks} Marks
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
              <Percent className="h-3 w-3" aria-hidden="true" />
              Passing Score
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {quiz.passingScore} ({quiz.settings.passingScore}%)
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden="true" />
              Attempts
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {quiz.submissionsCount} / {quiz.totalStudents}
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
              <Award className="h-3 w-3 text-amber-500" aria-hidden="true" />
              Avg Score
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {quiz.averageScore !== null ? `${quiz.averageScore}%` : '—'}
            </span>
          </div>
        </div>
      </Card>

      {/* Sections Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} variant="pill">
        <div className="overflow-x-auto scrollbar-none pb-1">
          <TabsList className="w-auto inline-flex flex-nowrap">
            <TabsTrigger value="overview" className="text-xs whitespace-nowrap">
              Overview
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs whitespace-nowrap">
              Questions ({quiz.questions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs whitespace-nowrap">
              Submissions ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs whitespace-nowrap">
              Results & Analytics
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Description & Guidelines */}
            <Card className="p-4 sm:p-5 lg:col-span-2 space-y-3 bg-surface border-border">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Description & Instructions
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {quiz.description || 'No specific instructions provided for this quiz.'}
              </p>

              <div className="pt-3 border-t border-border space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Quick Guidelines for Students:
                </span>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Timed assessment of {quiz.durationMinutes} minutes once started.</li>
                  <li>
                    {quiz.settings.allowRetake
                      ? `Allowed up to ${quiz.settings.maxAttempts} attempts. Highest score recorded.`
                      : 'Single attempt only. Retakes are not permitted.'}
                  </li>
                  <li>
                    {quiz.settings.randomizeQuestions
                      ? 'Questions are randomly shuffled for each attempt.'
                      : 'Questions appear in standard sequence.'}
                  </li>
                  <li>
                    Passing threshold is set at {quiz.passingScore} marks ({quiz.settings.passingScore}%).
                  </li>
                </ul>
              </div>
            </Card>

            {/* Quiz Configuration Rules Box */}
            <Card className="p-4 sm:p-5 space-y-3 bg-surface border-border">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-bold text-foreground">Quiz Configuration</h3>
              </div>

              <div className="space-y-2.5 text-xs divide-y divide-border/60">
                <div className="flex items-center justify-between pt-1.5 first:pt-0">
                  <span className="text-muted-foreground">Randomize Questions:</span>
                  <span className="font-bold text-foreground">
                    {quiz.settings.randomizeQuestions ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground">Randomize Options:</span>
                  <span className="font-bold text-foreground">
                    {quiz.settings.randomizeOptions ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground">Show Results After Submission:</span>
                  <span className="font-bold text-foreground">
                    {quiz.settings.showResultsAfterSubmission ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground">Allow Retake:</span>
                  <span className="font-bold text-foreground">
                    {quiz.settings.allowRetake ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground">Maximum Attempts:</span>
                  <span className="font-bold text-foreground">
                    {quiz.settings.maxAttempts}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-bold text-foreground">
                    {quiz.availableUntil}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. QUESTIONS (BUILDER) */}
      {activeTab === 'questions' && (
        <div className="animate-in fade-in-50 duration-150">
          <QuizBuilder
            quiz={quiz}
            onAddQuestion={(q) => addQuestion(quiz.id, q)}
            onUpdateQuestion={(qId, updates) => updateQuestion(quiz.id, qId, updates)}
            onDeleteQuestion={(qId) => deleteQuestion(quiz.id, qId)}
            onDuplicateQuestion={(qId) => duplicateQuestion(quiz.id, qId)}
            onReorderQuestions={(ids) => reorderQuestions(quiz.id, ids)}
          />
        </div>
      )}

      {/* TAB CONTENT: 3. SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="animate-in fade-in-50 duration-150">
          <QuizSubmissionsTable
            quiz={quiz}
            submissions={submissions}
            onGradeSubmission={(subId, scores) => gradeSubmission(subId, quiz.id, scores)}
            onResetAttempt={(subId) => resetAttempt(quiz.id, subId)}
          />
        </div>
      )}

      {/* TAB CONTENT: 4. RESULTS */}
      {activeTab === 'results' && (
        <div className="animate-in fade-in-50 duration-150">
          <QuizResultsOverview
            quiz={quiz}
            results={results}
            submissions={submissions}
          />
        </div>
      )}
    </div>
  )
}

export default QuizDetailsPage

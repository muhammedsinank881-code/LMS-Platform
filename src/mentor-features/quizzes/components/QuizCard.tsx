import {
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  FileQuestion,
  HelpCircle,
  MoreVertical,
  Trash2,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui'
import type { QuizItem } from '../types'

interface QuizCardProps {
  quiz: QuizItem
  onDelete?: (id: string) => void
}

export function QuizCard({ quiz, onDelete }: QuizCardProps) {
  const navigate = useNavigate()

  const statusToneMap: Record<QuizItem['status'], 'success' | 'primary' | 'neutral' | 'warning'> = {
    active: 'success',
    completed: 'primary',
    draft: 'neutral',
    scheduled: 'warning',
  }

  return (
    <Card className="p-3 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 hover:border-primary/50 transition-all shadow-2xs group">
      {/* Left: Icon and Main Information */}
      <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-foreground truncate max-w-full">
              <button
                type="button"
                onClick={() => navigate(`/mentor/quizzes/${quiz.id}`)}
                className="hover:text-primary transition-colors cursor-pointer text-left font-bold"
              >
                {quiz.title}
              </button>
            </h3>
            <Badge
              tone={statusToneMap[quiz.status]}
              size="sm"
              className="text-[10px] sm:text-xs capitalize font-semibold"
            >
              {quiz.status}
            </Badge>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1 truncate max-w-[160px] sm:max-w-none">
              <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" aria-hidden="true" />
              {quiz.classBatch}
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              <FileQuestion className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" aria-hidden="true" />
              {quiz.questionCount} Questions
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" aria-hidden="true" />
              {quiz.durationMinutes} mins
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" aria-hidden="true" />
              Available until {quiz.availableUntil}
            </span>
          </div>

          {quiz.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
              {quiz.description}
            </p>
          )}
        </div>
      </div>

      {/* Right / Bottom: Submissions, Avg Score, Actions */}
      <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-border">
        {/* Attempts */}
        <div className="text-left md:text-center min-w-[70px]">
          <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium flex items-center gap-1 md:justify-center">
            <Users className="h-3 w-3" aria-hidden="true" />
            <span>Attempts</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-foreground">
            {quiz.submissionsCount} / {quiz.totalStudents}
          </div>
        </div>

        {/* Average Score (if available) */}
        {quiz.averageScore !== null ? (
          <div className="text-left md:text-center min-w-[70px]">
            <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium flex items-center gap-1 md:justify-center">
              <Award className="h-3 w-3 text-amber-500" aria-hidden="true" />
              <span>Avg Score</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {quiz.averageScore}%
            </div>
          </div>
        ) : (
          <div className="text-left md:text-center min-w-[70px]">
            <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">Avg Score</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">—</div>
          </div>
        )}

        {/* Quick View Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/mentor/quizzes/${quiz.id}`)}
          className="text-xs px-2.5 sm:px-3 h-8"
        >
          <span>View</span>
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
        </Button>

        {/* Context Dropdown Menu */}
        <Dropdown>
          <DropdownTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Quiz options"
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem onSelect={() => navigate(`/mentor/quizzes/${quiz.id}?tab=questions`)}>
              Edit Questions
            </DropdownItem>
            <DropdownItem onSelect={() => navigate(`/mentor/quizzes/${quiz.id}?tab=submissions`)}>
              View Submissions
            </DropdownItem>
            <DropdownItem onSelect={() => navigate(`/mentor/quizzes/${quiz.id}?tab=results`)}>
              View Results
            </DropdownItem>
            {onDelete ? (
              <DropdownItem
                destructive
                onSelect={() => onDelete(quiz.id)}
                className="text-destructive flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Delete Quiz</span>
              </DropdownItem>
            ) : null}
          </DropdownContent>
        </Dropdown>
      </div>
    </Card>
  )
}

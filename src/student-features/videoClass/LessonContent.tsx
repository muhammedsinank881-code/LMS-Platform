import type { ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  ListChecks,
  Radio,
  Video,
} from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import type {
  CourseLesson,
  LessonContentBlock,
  StudentCourse,
} from '../courses/data/coursesData'
import type { StudentTask } from '../assignments/data/assignmentsData'

interface LessonContentProps {
  course: StudentCourse
  lesson: CourseLesson
  moduleTitle: string
  blocks: LessonContentBlock[]
  taskById: Map<string, StudentTask>
  lessonPosition: number
  totalLessons: number
  isComplete: boolean
  onMarkComplete: () => void
  onPrevious: () => void
  onNext: () => void
  onSubmitAssignment: (task: StudentTask) => void
  onAttemptQuiz: (task: StudentTask) => void
}

function ContentCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function TaskContent({
  task,
  onSubmitAssignment,
  onAttemptQuiz,
}: {
  task: StudentTask
  onSubmitAssignment: (task: StudentTask) => void
  onAttemptQuiz: (task: StudentTask) => void
}) {
  const isQuiz = task.type === 'quiz'

  const statusText =
    task.status === 'pending'
      ? 'Not submitted'
      : task.status === 'submitted'
        ? 'Submitted'
        : 'Graded'

  return (
    <ContentCard
      title={task.title}
      icon={isQuiz ? <ListChecks className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
    >
      <div className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            tone={task.status === 'pending' ? 'warning' : 'success'}
            appearance="soft"
            size="sm"
          >
            {statusText}
          </Badge>

          <span className="text-xs text-muted-foreground">Due {task.dueDate}</span>

          {task.score && (
            <span className="text-xs font-semibold text-foreground">Score: {task.score}</span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p>

        {task.instructions && task.instructions.length > 0 && (
          <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
            {task.instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
        )}

        {task.feedbackNotes && (
          <p className="bg-surface-hover rounded-lg p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Feedback: </span>
            {task.feedbackNotes}
          </p>
        )}

        {task.status === 'pending' ? (
          <Button
            size="sm"
            variant={isQuiz ? 'primary' : 'outline'}
            onClick={() => (isQuiz ? onAttemptQuiz(task) : onSubmitAssignment(task))}
          >
            {isQuiz ? 'Attempt quiz' : 'Open assignment'}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            {task.submittedAt ? `Last updated ${task.submittedAt}` : 'Your work is on record.'}
          </p>
        )}
      </div>
    </ContentCard>
  )
}

function LessonBlock({
  block,
  task,
  onSubmitAssignment,
  onAttemptQuiz,
}: {
  block: LessonContentBlock
  task: StudentTask | undefined
  onSubmitAssignment: (task: StudentTask) => void
  onAttemptQuiz: (task: StudentTask) => void
}) {
  switch (block.type) {
    case 'text':
    case 'notes':
      return (
        <ContentCard title={block.title} icon={<FileText className="h-4 w-4" />}>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {block.body}
          </p>
        </ContentCard>
      )

    case 'video':
      return (
        <ContentCard title={block.title} icon={<Video className="h-4 w-4" />}>
          <div className="overflow-hidden rounded-md bg-black">
            {/* Caption tracks are not present in the existing lesson data. */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              controls
              preload="metadata"
              className="aspect-video w-full"
              aria-label={block.title}
            >
              <source src={block.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {block.caption && <p className="mt-2 text-xs text-muted-foreground">{block.caption}</p>}
        </ContentCard>
      )

    case 'image':
    case 'diagram':
      return (
        <ContentCard
          title={block.title}
          icon={
            block.type === 'image' ? (
              <ImageIcon className="h-4 w-4" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )
          }
        >
          <figure className="space-y-2">
            <img
              src={block.url}
              alt={block.alt}
              className="max-h-[36rem] w-full rounded-lg object-contain"
            />

            {block.caption && (
              <figcaption className="text-xs text-muted-foreground">{block.caption}</figcaption>
            )}
          </figure>
        </ContentCard>
      )

    case 'external-link':
      return (
        <ContentCard title={block.title} icon={<ExternalLink className="h-4 w-4" />}>
          <div className="space-y-2">
            {block.description && (
              <p className="text-sm text-muted-foreground">{block.description}</p>
            )}

            <a
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Open learning resource
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </ContentCard>
      )

    case 'live-class':
      return (
        <ContentCard title={block.title} icon={<Radio className="h-4 w-4" />}>
          <p className="mb-3 text-sm text-muted-foreground">
            {block.scheduledAt
              ? `Scheduled for ${block.scheduledAt}`
              : 'Session details are not available yet.'}
          </p>

          {block.joinUrl ? (
            <Button asChild size="sm">
              <a href={block.joinUrl} target="_blank" rel="noreferrer">
                Join live class
              </a>
            </Button>
          ) : (
            <Button size="sm" disabled title="A meeting link has not been configured">
              Join live class
            </Button>
          )}
        </ContentCard>
      )

    case 'code':
      return (
        <ContentCard title={block.title} icon={<Code2 className="h-4 w-4" />}>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-6 text-foreground">
            <code className={`language-${block.language || 'text'}`}>{block.code}</code>
          </pre>

          {block.caption && <p className="mt-2 text-xs text-muted-foreground">{block.caption}</p>}
        </ContentCard>
      )

    case 'download':
      return (
        <ContentCard title={block.title} icon={<FileText className="h-4 w-4" />}>
          <div className="space-y-2">
            {block.description && (
              <p className="text-sm text-muted-foreground">{block.description}</p>
            )}

            <a
              href={block.url}
              download
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Download material
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </ContentCard>
      )

    case 'assignment':
    case 'quiz':
      return task ? (
        <TaskContent
          task={task}
          onSubmitAssignment={onSubmitAssignment}
          onAttemptQuiz={onAttemptQuiz}
        />
      ) : null
  }
}

export function LessonContent({
  course,
  lesson,
  moduleTitle,
  blocks,
  taskById,
  lessonPosition,
  totalLessons,
  isComplete,
  onMarkComplete,
  onPrevious,
  onNext,
  onSubmitAssignment,
  onAttemptQuiz,
}: LessonContentProps) {
  return (
    <main id="lesson-article" className="min-w-0 space-y-4" aria-label="Lesson content">
      {/* Lesson Header and Course Description */}
      <Card className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <Badge tone="primary" appearance="soft" size="sm">
              {moduleTitle}
            </Badge>

            <h2 className="break-words text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {lesson.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {lesson.duration}
              </span>
              <span>{course.instructor.name}</span>
            </div>
          </div>

          {isComplete ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Lesson complete
            </span>
          ) : (
            <Button size="sm" variant="outline" onClick={onMarkComplete}>
              Mark lesson complete
            </Button>
          )}
        </div>

        <div className="border-t border-border/60 pt-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">About this course</h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{course.description}</p>
        </div>
      </Card>

      {/* Lesson Materials */}
      {blocks.length > 0 ? (
        blocks.map((block) => (
          <LessonBlock
            key={block.id}
            block={block}
            task={
              block.type === 'assignment' || block.type === 'quiz'
                ? taskById.get(block.taskId)
                : undefined
            }
            onSubmitAssignment={onSubmitAssignment}
            onAttemptQuiz={onAttemptQuiz}
          />
        ))
      ) : (
        <Card className="border-dashed p-8 text-center">
          <p className="text-sm font-semibold text-foreground">No visible materials</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Turn on one or more content types in preferences to see available lesson materials.
          </p>
        </Card>
      )}

      {/* Previous / Next Navigation */}
      <div className="flex flex-row items-center justify-between gap-3 border-t border-border/60 pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={lessonPosition === 0}
          onClick={onPrevious}
          aria-label="Go to previous lesson"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className='text-[10px]'>
          Previous lesson
          </span>
        </Button>

        <span className="text-xs text-muted-foreground">
          Lesson {lessonPosition + 1} of {totalLessons}
        </span>

        <Button
          size="sm"
          disabled={lessonPosition === totalLessons - 1}
          onClick={onNext}
          aria-label="Go to next lesson"
        >
          <span className='text-[10px]'>Next lesson</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  )
}

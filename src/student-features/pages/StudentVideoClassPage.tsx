import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Code2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PlayCircle,
  Radio,
  Video,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { usePersistentState } from '@/hooks/use-persistent-state'
import {
  Badge,
  Button,
  Card,
  Checkbox,
} from '@/components/ui'
import {
  MOCK_COURSES_DATA,
  type CourseLesson,
  type LessonContentBlock,
  type StudentCourse,
} from '../courses/data/coursesData'
import { MOCK_STUDENT_DATA, type PendingClass } from '../mock/student-data'
import type { StudentTask } from '../assignments/data/assignmentsData'
import { QuizAttemptModal } from '../assignments/components/QuizAttemptModal'
import { SubmitAssignmentModal } from '../assignments/components/SubmitAssignmentModal'
import { useStudentAssignments } from '../assignments/hooks/useStudentAssignments'
import {
  filterVisibleLessonBlocks,
  type ContentPreference,
  type ContentPreferences,
} from './learningContent'

interface LearningLesson {
  course: StudentCourse
  moduleId: string
  moduleTitle: string
  lesson: CourseLesson
}

const CONTENT_OPTIONS: { key: ContentPreference; label: string }[] = [
  { key: 'notes', label: 'Notes' },
  { key: 'videos', label: 'Videos' },
  { key: 'images', label: 'Images' },
  { key: 'diagrams', label: 'Diagrams' },
  { key: 'externalLinks', label: 'External links' },
  { key: 'liveClasses', label: 'Live classes' },
  { key: 'codeExamples', label: 'Code examples' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'quizzes', label: 'Quizzes' },
]

const ALL_PREFERENCES: ContentPreferences = Object.fromEntries(
  CONTENT_OPTIONS.map(({ key }) => [key, true]),
) as ContentPreferences

const COURSE_PROGRESS_KEY = 'student-course-learning-progress-v1'
const CONTENT_PREFERENCES_KEY = 'student-course-learning-content-preferences-v1'

function getPendingVideo(id: string): PendingClass | undefined {
  return MOCK_STUDENT_DATA.pendingClasses.find((pendingClass) => pendingClass.id === id)
}

function buildLessonIndex(): LearningLesson[] {
  return MOCK_COURSES_DATA.flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        course,
        moduleId: module.id,
        moduleTitle: module.title,
        lesson,
      })),
    ),
  )
}

function makeArticleBlocks(
  lesson: CourseLesson,
  course: StudentCourse,
  tasks: StudentTask[],
): LessonContentBlock[] {
  const configured = lesson.content ? [...lesson.content] : []
  const pendingVideo = getPendingVideo(lesson.id)
  const configuredVideo = configured.some((block) => block.type === 'video')

  if (!configuredVideo && (lesson.videoUrl || pendingVideo?.videoUrl)) {
    configured.push({
      id: `${lesson.id}-video`,
      type: 'video',
      title: lesson.title,
      url: lesson.videoUrl || pendingVideo?.videoUrl || '',
      caption: 'Recorded lesson',
    })
  }

  const configuredTaskIds = new Set(
    configured.flatMap((block) =>
      block.type === 'assignment' || block.type === 'quiz' ? [block.taskId] : [],
    ),
  )
  const courseTasks = tasks.filter(
    (task) => task.courseCode === course.code && !configuredTaskIds.has(task.id),
  )

  return [
    ...configured,
    ...courseTasks.map((task) => ({
      id: `${lesson.id}-${task.id}`,
      type: task.type,
      taskId: task.id,
    })),
  ]
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
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
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
    task.status === 'pending' ? 'Not submitted' : task.status === 'submitted' ? 'Submitted' : 'Graded'

  return (
    <ContentCard
      title={task.title}
      icon={isQuiz ? <ListChecks className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
    >
      <div className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={task.status === 'pending' ? 'warning' : 'success'} appearance="soft" size="sm">
            {statusText}
          </Badge>
          <span className="text-xs text-muted-foreground">Due {task.dueDate}</span>
          {task.score && <span className="text-xs font-semibold text-foreground">Score: {task.score}</span>}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p>
        {task.instructions && task.instructions.length > 0 && (
          <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
            {task.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}
          </ul>
        )}
        {task.feedbackNotes && (
          <p className="rounded-lg bg-surface-hover p-3 text-xs text-muted-foreground">
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
        <ContentCard
          title={block.title}
          icon={<FileText className="h-4 w-4" />}
        >
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{block.body}</p>
        </ContentCard>
      )
    case 'video':
      return (
        <ContentCard title={block.title} icon={<Video className="h-4 w-4" />}>
          <div className="overflow-hidden rounded-lg bg-black">
            {/* Caption tracks are not present in the existing lesson data. */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video controls preload="metadata" className="aspect-video w-full" aria-label={block.title}>
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
          icon={block.type === 'image' ? <ImageIcon className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
        >
          <figure className="space-y-2">
            <img src={block.url} alt={block.alt} className="max-h-[36rem] w-full rounded-lg object-contain" />
            {block.caption && <figcaption className="text-xs text-muted-foreground">{block.caption}</figcaption>}
          </figure>
        </ContentCard>
      )
    case 'external-link':
      return (
        <ContentCard title={block.title} icon={<ExternalLink className="h-4 w-4" />}>
          <div className="space-y-2">
            {block.description && <p className="text-sm text-muted-foreground">{block.description}</p>}
            <a
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Open learning resource <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </ContentCard>
      )
    case 'live-class':
      return (
        <ContentCard title={block.title} icon={<Radio className="h-4 w-4" />}>
          <p className="mb-3 text-sm text-muted-foreground">
            {block.scheduledAt ? `Scheduled for ${block.scheduledAt}` : 'Session details are not available yet.'}
          </p>
          {block.joinUrl ? (
            <Button asChild size="sm">
              <a href={block.joinUrl} target="_blank" rel="noreferrer">Join live class</a>
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
            {block.description && <p className="text-sm text-muted-foreground">{block.description}</p>}
            <a href={block.url} download className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Download material <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </ContentCard>
      )
    case 'assignment':
    case 'quiz':
      return task
        ? <TaskContent task={task} onSubmitAssignment={onSubmitAssignment} onAttemptQuiz={onAttemptQuiz} />
        : null
  }
}

export function StudentVideoClassPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const lessonIndex = useMemo(() => buildLessonIndex(), [])
  const requestedId = searchParams.get('id')
  const requestedCourseId = searchParams.get('courseId')
  const selectedIndex = lessonIndex.findIndex(
    ({ lesson, course }) =>
      lesson.id === requestedId && (!requestedCourseId || course.id === requestedCourseId),
  )
  const currentIndex = selectedIndex >= 0 ? selectedIndex : Math.max(0, lessonIndex.findIndex(({ lesson }) => lesson.id === 'class-1'))
  const selected = lessonIndex[currentIndex]
  const { course, lesson, moduleId, moduleTitle } = selected
  const [expandedModules, setExpandedModules] = useState<string[]>([moduleId])
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(true)
  const [arePreferencesOpen, setArePreferencesOpen] = useState(true)
  const [completedLessons, setCompletedLessons] = usePersistentState<Record<string, string[]>>(
    COURSE_PROGRESS_KEY,
    {},
  )
  const [preferences, setPreferences] = usePersistentState<ContentPreferences>(
    CONTENT_PREFERENCES_KEY,
    ALL_PREFERENCES,
  )
  const {
    tasks,
    selectedTaskForSubmission,
    isSubmitModalOpen,
    openSubmitModal,
    closeSubmitModal,
    handleAssignmentSubmission,
    selectedTaskForQuiz,
    isQuizModalOpen,
    openQuizModal,
    closeQuizModal,
    handleQuizCompletion,
  } = useStudentAssignments()

  const lessonBlocks = makeArticleBlocks(lesson, course, tasks)
  const taskById = new Map(tasks.map((task) => [task.id, task]))
  const filteredBlocks = filterVisibleLessonBlocks(lessonBlocks, preferences)
  const courseLessons = lessonIndex.filter((item) => item.course.id === course.id)
  const courseLessonPosition = courseLessons.findIndex((item) => item.lesson.id === lesson.id)
  const completedForCourse = new Set(completedLessons[course.id] || [])
  const totalCompleted = courseLessons.filter(
    ({ lesson: courseLesson }) => courseLesson.isCompleted || completedForCourse.has(courseLesson.id),
  ).length
  const isCurrentLessonComplete = lesson.isCompleted || completedForCourse.has(lesson.id)

  const navigateToLesson = (index: number) => {
    const next = lessonIndex[index]
    if (!next) return
    setExpandedModules((previous) =>
      previous.includes(next.moduleId) ? previous : [...previous, next.moduleId],
    )
    setSearchParams({ id: next.lesson.id, courseId: next.course.id })
  }

  const toggleModule = (id: string) => {
    setExpandedModules((previous) =>
      previous.includes(id) ? previous.filter((moduleId) => moduleId !== id) : [...previous, id],
    )
  }

  const markCurrentLessonComplete = () => {
    setCompletedLessons({
      ...completedLessons,
      [course.id]: Array.from(new Set([...(completedLessons[course.id] || []), lesson.id])),
    })
  }

  const updatePreference = (key: ContentPreference, checked: boolean) => {
    setPreferences({ ...preferences, [key]: checked })
  }

  const liveClassBlock = lesson.content?.find((block) => block.type === 'live-class')
  const joinUrl = liveClassBlock?.type === 'live-class' ? liveClassBlock.joinUrl : undefined
  const activeClass = Boolean(course.isLiveClassActive)
  const sessionTime = course.liveClassTime || (liveClassBlock?.type === 'live-class' ? liveClassBlock.scheduledAt : undefined)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link to="/student/courses" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
        <span aria-hidden="true">•</span>
        <Link to="/student/dashboard" className="transition-colors hover:text-primary">Dashboard</Link>
      </div>

      <PageHeader
        title={course.title}
        description={`${course.code} · ${course.instructor.name} · ${totalCompleted} of ${courseLessons.length} listed lessons complete`}
      />

      <Card className="flex flex-col gap-3 border-primary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 rounded-full p-2 ${activeClass ? 'bg-rose-500/10 text-rose-600' : 'bg-primary-subtle text-primary'}`}>
            {activeClass ? <Radio className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {activeClass
                ? 'Live class session is marked active'
                : sessionTime
                  ? `Next live class${liveClassBlock?.type === 'live-class' ? ` · ${liveClassBlock.title}` : ''}`
                  : liveClassBlock
                    ? liveClassBlock.title
                    : 'No upcoming live class listed'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {sessionTime
                ? `${sessionTime}${joinUrl ? '' : ' · Meeting link is not configured in the available course data.'}`
                : joinUrl
                  ? 'Meeting access is available for this lesson.'
                  : activeClass
                    ? 'Meeting details are not available in the current course data.'
                    : 'Check back when a session is scheduled by your course team.'}
            </p>
          </div>
        </div>
        {activeClass && (
          joinUrl ? (
            <Button asChild className="shrink-0">
              <a href={joinUrl} target="_blank" rel="noreferrer">
                <Radio className="h-4 w-4" /> Join Live Class
              </a>
            </Button>
          ) : (
            <Button
              disabled
              title="A live-class join URL or meeting integration is not available"
              className="shrink-0"
            >
              <Radio className="h-4 w-4" /> Join Live Class
            </Button>
          )
        )}
      </Card>

      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-start">
        <aside
          aria-label="Course syllabus"
          className={`min-w-0 transition-[width] duration-200 xl:sticky xl:top-0 ${
            isSyllabusOpen ? 'xl:w-64' : 'xl:w-8'
          }`}
        >
          <Card className={arePreferencesOpen ? 'p-3' : 'p-0'}>
            <div className={`flex items-center ${isSyllabusOpen ? 'justify-between' : 'justify-center'}`}>
              {isSyllabusOpen && <h2 className="text-sm font-semibold text-foreground">Course syllabus</h2>}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={isSyllabusOpen ? 'Collapse course syllabus' : 'Expand course syllabus'}
                aria-expanded={isSyllabusOpen}
                onClick={() => setIsSyllabusOpen((open) => !open)}
              >
                {isSyllabusOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
              </Button>
            </div>
            {isSyllabusOpen && (
              <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
                <div className="rounded-md bg-surface-hover p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Course progress</span>
                    <span className="text-muted-foreground">{totalCompleted}/{courseLessons.length}</span>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label="Course lesson progress"
                    aria-valuemin={0}
                    aria-valuemax={courseLessons.length}
                    aria-valuenow={totalCompleted}
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${courseLessons.length ? (totalCompleted / courseLessons.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                {course.modules.map((module, index) => {
                  const isExpanded = expandedModules.includes(module.id)
                  const moduleComplete = module.lessons.filter(
                    (item) => item.isCompleted || completedForCourse.has(item.id),
                  ).length
                  return (
                    <section key={module.id} className="overflow-hidden rounded-lg border border-border/70">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleModule(module.id)}
                        className="flex min-h-11 w-full items-center justify-between gap-2 bg-surface-hover px-3 py-2 text-left text-xs hover:bg-muted"
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold text-foreground">{module.title}</span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            Module {index + 1} · {moduleComplete}/{module.lessons.length} complete
                          </span>
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                      </button>
                      {isExpanded && (
                        <ul className="divide-y divide-border/50">
                          {module.lessons.map((moduleLesson) => {
                            const isSelected = moduleLesson.id === lesson.id
                            const isComplete =
                              moduleLesson.isCompleted || completedForCourse.has(moduleLesson.id)
                            const lessonGlobalIndex = lessonIndex.findIndex(
                              (item) => item.course.id === course.id && item.lesson.id === moduleLesson.id,
                            )
                            return (
                              <li key={moduleLesson.id}>
                                <button
                                  type="button"
                                  aria-current={isSelected ? 'page' : undefined}
                                  onClick={() => navigateToLesson(lessonGlobalIndex)}
                                  className={`flex min-h-11 w-full items-start gap-2.5 px-3 py-2.5 text-left text-xs transition-colors ${
                                    isSelected
                                      ? 'bg-primary-subtle/70 text-primary'
                                      : 'text-foreground hover:bg-surface-hover'
                                  }`}
                                >
                                  {isComplete
                                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />}
                                  <span className="min-w-0 flex-1">
                                    <span className={`block leading-5 ${isSelected ? 'font-semibold' : ''}`}>
                                      {moduleLesson.title}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                                      {moduleLesson.duration}
                                      {isComplete ? ' · Complete' : ''}
                                    </span>
                                  </span>
                                  {isSelected && <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </section>
                  )
                })}
              </div>
            )}
          </Card>
        </aside>

        <main id="lesson-article" className="min-w-0 space-y-4" aria-label="Lesson content">
          <Card className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <Badge tone="primary" appearance="soft" size="sm">{moduleTitle}</Badge>
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{lesson.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{lesson.duration}</span>
                  <span>{course.instructor.name}</span>
                </div>
              </div>
              {isCurrentLessonComplete ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Lesson complete
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={markCurrentLessonComplete}>
                  Mark lesson complete
                </Button>
              )}
            </div>
            <div className="border-t border-border/60 pt-4">
              <h2 className="mb-2 text-sm font-semibold text-foreground">About this course</h2>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{course.description}</p>
            </div>
          </Card>

          {filteredBlocks.length > 0 ? (
            filteredBlocks.map((block) => (
              <LessonBlock
                key={block.id}
                block={block}
                task={block.type === 'assignment' || block.type === 'quiz' ? taskById.get(block.taskId) : undefined}
                onSubmitAssignment={openSubmitModal}
                onAttemptQuiz={openQuizModal}
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={courseLessonPosition === 0}
              onClick={() => {
                const previous = courseLessons[courseLessonPosition - 1]
                if (previous) navigateToLesson(lessonIndex.indexOf(previous))
              }}
              aria-label="Go to previous lesson"
            >
              <ChevronLeft className="h-4 w-4" /> Previous lesson
            </Button>
            <span className="text-xs text-muted-foreground">
              Lesson {courseLessonPosition + 1} of {courseLessons.length}
            </span>
            <Button
              size="sm"
              disabled={courseLessonPosition === courseLessons.length - 1}
              onClick={() => {
                const next = courseLessons[courseLessonPosition + 1]
                if (next) navigateToLesson(lessonIndex.indexOf(next))
              }}
              aria-label="Go to next lesson"
            >
              Next lesson <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </main>

        <aside
          aria-label="Content preferences"
          className={`min-w-0 transition-[width] duration-200 xl:sticky xl:top-0 ${
            arePreferencesOpen ? 'xl:w-56' : 'xl:w-8'
          }`}
        >
          <Card className={arePreferencesOpen ? 'p-3' : 'p-0'}>
            <div className={`flex items-center ${arePreferencesOpen ? 'justify-between' : 'justify-center'}`}>
              {arePreferencesOpen && <h2 className="text-sm font-semibold text-foreground">Content</h2>}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={arePreferencesOpen ? 'Collapse content preferences' : 'Expand content preferences'}
                aria-expanded={arePreferencesOpen}
                onClick={() => setArePreferencesOpen((open) => !open)}
              >
                {arePreferencesOpen ? <PanelRightClose /> : <PanelRightOpen />}
              </Button>
            </div>
            {arePreferencesOpen && (
              <>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Choose what appears in the lesson. Hidden materials are not removed.
                </p>
                <div className="mb-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-[11px]"
                    onClick={() => setPreferences(ALL_PREFERENCES)}
                  >
                    Select all
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-[11px]"
                    onClick={() => setPreferences({})}
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {CONTENT_OPTIONS.map(({ key, label }) => {
                    const id = `content-preference-${key}`
                    return (
                      <label
                        key={key}
                        htmlFor={id}
                        className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-1 text-xs text-foreground hover:bg-surface-hover"
                      >
                        <Checkbox
                          id={id}
                          size="sm"
                          checked={preferences[key] === true}
                          onCheckedChange={(checked) => updatePreference(key, checked === true)}
                        />
                        {label}
                      </label>
                    )
                  })}
                </div>
              </>
            )}
          </Card>
        </aside>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground xl:hidden">
        <span>Use the panel controls above to open or collapse the syllabus and content filters.</span>
      </div>

      <SubmitAssignmentModal
        task={selectedTaskForSubmission}
        open={isSubmitModalOpen}
        onOpenChange={closeSubmitModal}
        onSubmit={handleAssignmentSubmission}
      />
      <QuizAttemptModal
        task={selectedTaskForQuiz}
        open={isQuizModalOpen}
        onOpenChange={closeQuizModal}
        onCompleteQuiz={handleQuizCompletion}
      />
    </div>
  )
}

export default StudentVideoClassPage

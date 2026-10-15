import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, CalendarClock, Radio, SlidersHorizontal, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { usePersistentState } from '@/hooks/use-persistent-state'
import {
  Button,
  Card,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
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
import { CourseSyllabusSidebar } from '../videoClass/CourseSyllabusSidebar'
import { ContentPreferencesSidebar } from '../videoClass/ContentPreferencesSidebar'
import { LessonContent } from '../videoClass/LessonContent'

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

export function StudentVideoClassPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const lessonIndex = useMemo(() => buildLessonIndex(), [])
  const requestedId = searchParams.get('id')
  const requestedCourseId = searchParams.get('courseId')
  const selectedIndex = lessonIndex.findIndex(
    ({ lesson, course }) =>
      lesson.id === requestedId && (!requestedCourseId || course.id === requestedCourseId),
  )
  const currentIndex =
    selectedIndex >= 0
      ? selectedIndex
      : Math.max(
          0,
          lessonIndex.findIndex(({ lesson }) => lesson.id === 'class-1'),
        )
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
  type MobilePanel = 'syllabus' | 'preferences' | null

  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null)

  const toggleMobilePanel = (panel: Exclude<MobilePanel, null>) => {
    setMobilePanel((current) => (current === panel ? null : panel))
  }
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
    ({ lesson: courseLesson }) =>
      courseLesson.isCompleted || completedForCourse.has(courseLesson.id),
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
  const sessionTime =
    course.liveClassTime ||
    (liveClassBlock?.type === 'live-class' ? liveClassBlock.scheduledAt : undefined)

  const renderLiveClassSection = (className: string) => (
    <Card
      className={`flex-col gap-3 border-primary/20 p-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 rounded-full p-2 ${activeClass ? 'bg-rose-500/10 text-rose-600' : 'bg-primary-subtle text-primary'}`}
        >
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
      {activeClass &&
        (joinUrl ? (
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
        ))}
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
        <span aria-hidden="true">•</span>
        <Link to="/student/dashboard" className="transition-colors hover:text-primary">
          Dashboard
        </Link>
      </div>

      <PageHeader
        title={course.title}
        description={`${course.code} · ${course.instructor.name} · ${totalCompleted} of ${courseLessons.length} listed lessons complete`}
      />

      {renderLiveClassSection('hidden xl:flex')}

      <div className="space-y-3 xl:hidden">
        {renderLiveClassSection('flex')}

        <Button
          type="button"
          variant={mobilePanel === 'syllabus' ? 'primary' : 'outline'}
          className="w-full justify-start"
          aria-expanded={mobilePanel === 'syllabus'}
          aria-label={`${mobilePanel === 'syllabus' ? 'Close' : 'Open'} Course Syllabus panel`}
          onClick={() => toggleMobilePanel('syllabus')}
        >
          {mobilePanel === 'syllabus' ? (
            <X className="h-4 w-4" />
          ) : (
            <BookOpen className="h-4 w-4" />
          )}
          Course Syllabus
        </Button>

        <Button
          type="button"
          variant={mobilePanel === 'preferences' ? 'primary' : 'outline'}
          className="w-full justify-start"
          aria-expanded={mobilePanel === 'preferences'}
          aria-label={`${mobilePanel === 'preferences' ? 'Close' : 'Open'} Content Preferences panel`}
          onClick={() => toggleMobilePanel('preferences')}
        >
          {mobilePanel === 'preferences' ? (
            <X className="h-4 w-4" />
          ) : (
            <SlidersHorizontal className="h-4 w-4" />
          )}
          Content Preferences
        </Button>
      </div>

      <Drawer
        open={mobilePanel === 'syllabus'}
        onOpenChange={(open) => {
          if (!open) setMobilePanel(null)
        }}
      >
        <DrawerContent side="left" className="gap-4 overflow-y-auto p-4 xl:hidden">
          <DrawerTitle className="sr-only">Course syllabus</DrawerTitle>
          <DrawerDescription className="sr-only">
            Browse course modules and lessons.
          </DrawerDescription>
          <CourseSyllabusSidebar
            course={course}
            currentLesson={lesson}
            completedLessonIds={completedLessons[course.id] || []}
            totalCompleted={totalCompleted}
            totalLessons={courseLessons.length}
            expandedModules={expandedModules}
            isExpanded
            onToggleExpanded={() => setMobilePanel(null)}
            onToggleModule={toggleModule}
            onSelectLesson={(lessonId) => {
              const index = lessonIndex.findIndex(
                (item) => item.course.id === course.id && item.lesson.id === lessonId,
              )

              if (index >= 0) {
                navigateToLesson(index)
              }
            }}
            className="min-w-0"
          />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={mobilePanel === 'preferences'}
        onOpenChange={(open) => {
          if (!open) setMobilePanel(null)
        }}
      >
        <DrawerContent side="right" className="gap-4 overflow-y-auto p-4 xl:hidden">
          <DrawerTitle className="sr-only">Content preferences</DrawerTitle>
          <DrawerDescription className="sr-only">
            Choose which materials appear in the lesson.
          </DrawerDescription>
          <ContentPreferencesSidebar
            preferences={preferences}
            isExpanded
            onToggleExpanded={() => setMobilePanel(null)}
            onPreferenceChange={updatePreference}
            onSelectAll={() => setPreferences(ALL_PREFERENCES)}
            onClear={() => setPreferences({})}
            className="min-w-0"
          />
        </DrawerContent>
      </Drawer>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-start">
        <CourseSyllabusSidebar
          course={course}
          currentLesson={lesson}
          completedLessonIds={completedLessons[course.id] || []}
          totalCompleted={totalCompleted}
          totalLessons={courseLessons.length}
          expandedModules={expandedModules}
          isExpanded={isSyllabusOpen}
          onToggleExpanded={() => setIsSyllabusOpen((previous) => !previous)}
          onToggleModule={toggleModule}
          onSelectLesson={(lessonId) => {
            const index = lessonIndex.findIndex(
              (item) => item.course.id === course.id && item.lesson.id === lessonId,
            )

            if (index >= 0) {
              navigateToLesson(index)
            }
          }}
          className={`hidden min-w-0 transition-[width] duration-200 xl:sticky xl:top-0 xl:block ${
            isSyllabusOpen ? 'xl:w-64' : 'xl:w-8'
          }`}
        />

        <LessonContent
          course={course}
          lesson={lesson}
          moduleTitle={moduleTitle}
          blocks={filteredBlocks}
          taskById={taskById}
          lessonPosition={courseLessonPosition}
          totalLessons={courseLessons.length}
          isComplete={isCurrentLessonComplete}
          onMarkComplete={markCurrentLessonComplete}
          onPrevious={() => {
            const previous = courseLessons[courseLessonPosition - 1]

            if (previous) {
              navigateToLesson(lessonIndex.indexOf(previous))
            }
          }}
          onNext={() => {
            const next = courseLessons[courseLessonPosition + 1]

            if (next) {
              navigateToLesson(lessonIndex.indexOf(next))
            }
          }}
          onSubmitAssignment={openSubmitModal}
          onAttemptQuiz={openQuizModal}
        />

        <ContentPreferencesSidebar
          preferences={preferences}
          isExpanded={arePreferencesOpen}
          onToggleExpanded={() => setArePreferencesOpen((previous) => !previous)}
          onPreferenceChange={updatePreference}
          onSelectAll={() => setPreferences(ALL_PREFERENCES)}
          onClear={() => setPreferences({})}
          className={`hidden min-w-0 transition-[width] duration-200 xl:sticky xl:top-0 xl:block ${
            arePreferencesOpen ? 'xl:w-56' : 'xl:w-8'
          }`}
        />
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

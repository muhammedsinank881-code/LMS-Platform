import { CheckCircle2, Circle, Clock, PlayCircle, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import type { StudentCourse } from '../data/coursesData'

interface CourseSyllabusModalProps {
  course: StudentCourse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CourseSyllabusModal({ course, open, onOpenChange }: CourseSyllabusModalProps) {
  const navigate = useNavigate()

  if (!course) return null

  const handlePlayLesson = (lessonId: string) => {
    onOpenChange(false)
    navigate(`/student/video-class?id=${lessonId}&courseId=${course.id}`)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        size="lg"
        className="box-border flex max-h-[90vh] w-full min-w-0 max-w-full flex-col overflow-x-hidden rounded-none sm:max-h-[85vh] sm:max-w-2xl sm:rounded-md md:max-w-3xl lg:max-w-4xl"
      >
        <ModalHeader className="border-b border-border/60 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-xs font-semibold text-primary">
              {course.code}
            </span>
            <Badge tone="neutral" appearance="soft" size="sm" className="text-[11px]">
              {course.category}
            </Badge>
            <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-500" /> {course.rating}
            </span>
          </div>

          <ModalTitle className="mt-1 text-lg font-bold leading-snug text-foreground sm:text-xl">
            {course.title}
          </ModalTitle>

          <ModalDescription className="text-xs text-muted-foreground">
            {course.completedModules} of {course.totalModules} modules finished • Total duration:{' '}
            {course.totalDuration}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4 overflow-y-auto px-3 py-4 sm:px-6">
          {/* Instructor & Progress Summary Bar */}
          <div className="bg-surface-hover flex flex-col justify-between gap-3 rounded-lg border border-border/50 p-3 text-xs sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <Avatar name={course.instructor.name} src={course.instructor.avatar} size="sm" />
              <div>
                <p className="font-semibold text-foreground">{course.instructor.name}</p>
                <p className="text-[11px] text-muted-foreground">{course.instructor.role}</p>
              </div>
            </div>

            <div className="flex justify-between border-t border-border/40 pt-2 sm:flex-col sm:border-t-0 sm:pt-0 sm:text-right">
              <span className="text-xs font-bold text-primary">{course.progress}% Completed</span>
              <p className="text-[11px] text-muted-foreground">
                {course.completedLessons} of {course.totalLessons} lessons
              </p>
            </div>
          </div>

          {/* Syllabus Modules List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Course Syllabus Modules ({course.modules.length})
            </h4>

            {course.modules.map((module, mIdx) => (
              <div
                key={module.id || mIdx}
                className="overflow-hidden rounded-lg border border-border bg-surface text-xs"
              >
                {/* Module Header */}
                <div className="flex flex-col justify-between gap-1.5 bg-muted/40 p-3 font-medium sm:flex-row sm:items-center sm:gap-0">
                  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    <span className="shrink-0 font-bold text-primary">Module {mIdx + 1}:</span>
                    <span className="truncate font-semibold text-foreground">{module.title}</span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {module.duration}
                  </span>
                </div>

                {/* Module Lessons */}
                <div className="divide-y divide-border/40 p-1">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`flex flex-col justify-between gap-2.5 rounded-md p-2.5 transition-colors sm:flex-row sm:items-center ${
                        lesson.isCurrent
                          ? 'bg-primary-subtle/50 font-medium'
                          : 'hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-0 sm:pr-2">
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                        )}

                        <span
                          className={`truncate text-xs ${
                            lesson.isCompleted
                              ? 'text-muted-foreground line-through'
                              : lesson.isCurrent
                                ? 'font-bold text-primary'
                                : 'font-medium text-foreground'
                          }`}
                        >
                          {lesson.title}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/20 pt-1 sm:justify-end sm:border-t-0 sm:pt-0">
                        <span className="text-[11px] text-muted-foreground">{lesson.duration}</span>
                        <Button
                          variant={lesson.isCurrent ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => handlePlayLesson(lesson.id)}
                          className="h-7 gap-1 px-2 text-[11px]"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          {lesson.isCompleted ? 'Replay' : lesson.isCurrent ? 'Resume' : 'Watch'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

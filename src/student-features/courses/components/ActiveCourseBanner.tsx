import { ArrowRight, BookOpen, FileText, PlayCircle, Radio, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, Card } from '@/components/ui'
import type { StudentCourse } from '../data/coursesData'
import { CourseProgress } from './CourseProgress'

interface ActiveCourseBannerProps {
  course: StudentCourse
  onOpenSyllabus: (course: StudentCourse) => void
}

export function ActiveCourseBanner({ course, onOpenSyllabus }: ActiveCourseBannerProps) {
  const navigate = useNavigate()

  const handleContinueLearning = () => {
    const lessonId = course.nextLessonId || 'class-1'
    navigate(`/student/video-class?id=${lessonId}`)
  }

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary-subtle/30 via-surface to-surface p-6 shadow-sm">
      {/* Subtle background glow decorator */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* Left Column: Course Info */}
        <div className="space-y-3 lg:max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
              <Sparkles className="h-3 w-3" /> Active Course
            </span>
            <span className="rounded-md bg-surface-hover px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border/60">
              {course.code}
            </span>
            {course.isLiveClassActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400 animate-pulse border border-rose-500/20">
                <Radio className="h-3 w-3" /> Live Session Ready
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {course.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          </div>

          {/* Up next lesson indicator */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg bg-surface/80 p-3 border border-border/60 text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <PlayCircle className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Up Next:</span>
              <span className="font-semibold text-foreground truncate max-w-md">
                {course.nextLessonTitle}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>Module {course.completedModules + 1} of {course.totalModules}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Progress & Primary Actions */}
        <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
          <CourseProgress
            value={course.progress}
            completedModules={course.completedModules}
            totalModules={course.totalModules}
          />

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <Avatar name={course.instructor.name} src={course.instructor.avatar} size="xs" />
              <div>
                <p className="font-medium text-foreground text-[11px] leading-tight">{course.instructor.name}</p>
                <p className="text-[10px] text-muted-foreground">Mentor</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenSyllabus(course)}
              className="gap-1 text-xs shrink-0"
            >
              <FileText className="h-3.5 w-3.5" />
              Syllabus
            </Button>
          </div>

          <Button
            onClick={handleContinueLearning}
            className="w-full gap-2 text-sm font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground py-2.5"
          >
            Continue Learning <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

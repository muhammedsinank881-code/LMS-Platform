import { Award, Bookmark, BookOpen, Clock, FileText, PlayCircle, Star } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Card } from '@/components/ui'
import type { StudentCourse } from '../data/coursesData'
import { CourseProgress } from './CourseProgress'

interface CourseCardProps {
  course: StudentCourse
  onToggleBookmark: (id: string) => void
  onOpenSyllabus: (course: StudentCourse) => void
}

export function CourseCard({ course, onToggleBookmark, onOpenSyllabus }: CourseCardProps) {
  const navigate = useNavigate()

  const handleStartOrContinue = () => {
    const lessonId = course.nextLessonId || 'class-1'
    navigate(`/student/video-class?id=${lessonId}&courseId=${course.id}`)
  }

  const isCompleted = course.status === 'completed'
  const isNotStarted = course.status === 'not_started'

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-md">
      {/* Thumbnail Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Category & Status Badges */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge tone="neutral" appearance="soft" size="sm" className="bg-background/90 text-foreground font-semibold backdrop-blur-xs text-[10px]">
            {course.category}
          </Badge>
          {isCompleted && (
            <Badge tone="success" appearance="solid" size="sm" className="font-semibold text-[10px]">
              ✓ Completed
            </Badge>
          )}
        </div>

        {/* Bookmark Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleBookmark(course.id)
          }}
          className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur-xs transition-colors ${
            course.isBookmarked
              ? 'bg-primary text-primary-foreground'
              : 'bg-background/80 text-muted-foreground hover:text-foreground'
          }`}
          title={course.isBookmarked ? 'Remove Bookmark' : 'Bookmark Course'}
        >
          <Bookmark className="h-3.5 w-3.5 fill-current" />
        </button>

        {/* Course Duration Overlay */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
          <Clock className="h-3 w-3" />
          <span>{course.totalDuration}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col justify-between space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono text-primary font-semibold">{course.code}</span>
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {course.rating}
            </span>
          </div>

          <h3 className="line-clamp-1 text-base font-bold text-foreground group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          <p className="line-clamp-2 text-xs text-muted-foreground">
            {course.description}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 pt-2">
          <CourseProgress
            value={course.progress}
            completedModules={course.completedModules}
            totalModules={course.totalModules}
            size="sm"
          />

          {/* Instructor & Lesson info */}
          <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <Avatar name={course.instructor.name} src={course.instructor.avatar} size="xs" />
              <span className="truncate text-xs font-medium text-muted-foreground">
                {course.instructor.name}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenSyllabus(course)}
              className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-3 w-3" /> Syllabus
            </Button>
          </div>

          {/* Primary Action Button */}
          <div className="pt-1">
            {isCompleted ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenSyllabus(course)}
                  className="w-full gap-1.5 text-xs"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Modules
                </Button>
                <Link to={course.certificateUrl || '/student/certificates'} className="w-full">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <Award className="h-3.5 w-3.5" /> Certificate
                  </Button>
                </Link>
              </div>
            ) : isNotStarted ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleStartOrContinue}
                className="w-full gap-2 text-xs font-semibold"
              >
                <PlayCircle className="h-4 w-4" /> Start Course
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={handleStartOrContinue}
                className="w-full gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <PlayCircle className="h-4 w-4" /> Continue Learning
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

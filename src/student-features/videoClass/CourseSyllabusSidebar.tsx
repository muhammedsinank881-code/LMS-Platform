import {
  CheckCircle2,
  ChevronDown,
  Circle,
  PanelLeftClose,
  PanelLeftOpen,
  PlayCircle,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'
import type { CourseLesson, StudentCourse } from '../courses/data/coursesData'

interface CourseSyllabusSidebarProps {
  course: StudentCourse
  currentLesson: CourseLesson
  completedLessonIds: string[]
  totalCompleted: number
  totalLessons: number
  expandedModules: string[]
  isExpanded: boolean
  onToggleExpanded: () => void
  onToggleModule: (moduleId: string) => void
  onSelectLesson: (lessonId: string) => void
  className?: string
}

export function CourseSyllabusSidebar({
  course,
  currentLesson,
  completedLessonIds,
  totalCompleted,
  totalLessons,
  expandedModules,
  isExpanded,
  onToggleExpanded,
  onToggleModule,
  onSelectLesson,
  className,
}: CourseSyllabusSidebarProps) {
  const completedIds = new Set(completedLessonIds)

  return (
    <aside aria-label="Course syllabus" className={className}>
      <Card className={isExpanded ? 'p-3' : 'p-0'}>
        {/* Sidebar Header */}
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded && <h2 className="text-sm font-semibold text-foreground">Course syllabus</h2>}

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={isExpanded ? 'Collapse course syllabus' : 'Expand course syllabus'}
            aria-expanded={isExpanded}
            onClick={onToggleExpanded}
          >
            {isExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-3 max-h-[65vh] space-y-2 overflow-y-auto pr-1">
            {/* Course Progress */}
            <div className="bg-surface-hover rounded-md p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Course progress</span>

                <span className="text-muted-foreground">
                  {totalCompleted}/{totalLessons}
                </span>
              </div>

              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Course lesson progress"
                aria-valuemin={0}
                aria-valuemax={totalLessons}
                aria-valuenow={totalCompleted}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{
                    width: `${totalLessons ? (totalCompleted / totalLessons) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Modules */}
            {course.modules.map((module, index) => {
              const isModuleExpanded = expandedModules.includes(module.id)

              const moduleCompleted = module.lessons.filter(
                (item) => item.isCompleted || completedIds.has(item.id),
              ).length

              return (
                <section
                  key={module.id}
                  className="overflow-hidden rounded-lg border border-border/70"
                >
                  <button
                    type="button"
                    aria-expanded={isModuleExpanded}
                    onClick={() => onToggleModule(module.id)}
                    className="bg-surface-hover flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold text-foreground">{module.title}</span>

                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        Module {index + 1} · {moduleCompleted}/{module.lessons.length} complete
                      </span>
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isModuleExpanded ? '' : '-rotate-90'
                      }`}
                    />
                  </button>

                  {/* Lessons */}
                  {isModuleExpanded && (
                    <ul className="divide-y divide-border/50">
                      {module.lessons.map((moduleLesson) => {
                        const isSelected = moduleLesson.id === currentLesson.id

                        const isComplete =
                          moduleLesson.isCompleted || completedIds.has(moduleLesson.id)

                        return (
                          <li key={moduleLesson.id}>
                            <button
                              type="button"
                              aria-current={isSelected ? 'page' : undefined}
                              onClick={() => onSelectLesson(moduleLesson.id)}
                              className={`flex min-h-11 w-full items-start gap-2.5 px-3 py-2.5 text-left text-xs transition-colors ${
                                isSelected
                                  ? 'bg-primary-subtle/70 text-primary'
                                  : 'hover:bg-surface-hover text-foreground'
                              }`}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              ) : (
                                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                              )}

                              <span className="min-w-0 flex-1">
                                <span
                                  className={`block leading-5 ${isSelected ? 'font-semibold' : ''}`}
                                >
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
  )
}

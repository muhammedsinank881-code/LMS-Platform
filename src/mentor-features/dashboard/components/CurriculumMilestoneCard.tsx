import { BookOpen, CheckCircle2 } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle, ProgressBar } from '@/components/ui'
import type { CurriculumModule } from '../types'

interface CurriculumMilestoneCardProps {
  moduleData: CurriculumModule
}

export function CurriculumMilestoneCard({ moduleData }: CurriculumMilestoneCardProps) {
  const steps = [
    { title: 'HTML & CSS Fundamentals', status: 'completed' },
    { title: 'Modern JavaScript (ES6+)', status: 'completed' },
    { title: 'React & State Management', status: 'current' },
    { title: 'Node.js & Express APIs', status: 'upcoming' },
    { title: 'Capstone Project Showcase', status: 'upcoming' },
  ]

  return (
    <Card className="border-border bg-surface shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">Batch Curriculum &amp; Roadmap</CardTitle>
        </div>
        <Badge tone="primary" appearance="soft" size="sm">
          Module {moduleData.moduleNumber} of {moduleData.totalModules}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Module overview */}
        <div className="rounded-lg bg-muted/60 p-4 space-y-3 border border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Current Focus</span>
              <h4 className="text-sm sm:text-base font-bold text-foreground">{moduleData.title}</h4>
            </div>
            <div className="sm:text-right">
              <span className="text-xs sm:text-sm font-semibold text-foreground">{moduleData.progress}% Complete</span>
            </div>
          </div>
          <ProgressBar value={moduleData.progress} tone="primary" size="md" aria-label="Curriculum Progress" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-muted-foreground pt-1">
            <span>Topic: <strong className="text-foreground">{moduleData.currentTopic}</strong></span>
            <span>Next Assessment: <strong className="text-foreground">{moduleData.nextMilestone}</strong></span>
          </div>
        </div>

        {/* Milestone Steps Roadmap */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Module Roadmap</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {steps.map((step, idx) => {
              const isCompleted = step.status === 'completed'
              const isCurrent = step.status === 'current'
              return (
                <div
                  key={step.title}
                  className={`rounded-md p-3 border text-xs space-y-1.5 transition-all ${
                    isCurrent
                      ? 'border-primary bg-primary/5 font-medium shadow-xs'
                      : isCompleted
                      ? 'border-success/30 bg-success/5 text-foreground'
                      : 'border-border bg-muted/30 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-[11px]">Step {idx + 1}</span>
                    {isCompleted ? (
                      <CheckCircle2 className="size-3.5 text-success shrink-0" />
                    ) : isCurrent ? (
                      <Badge tone="primary" size="sm">In Progress</Badge>
                    ) : null}
                  </div>
                  <p className="line-clamp-2 leading-snug">{step.title}</p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

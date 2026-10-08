import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Upload,
  Eye,
  Award,
} from 'lucide-react'
import { Badge, Button, ProgressBar, Avatar } from '@/components/ui'
import type { ProjectMilestone as MilestoneType, ProjectType } from '../types/project.types'

interface ProjectMilestoneProps {
  milestone: MilestoneType
  projectType: ProjectType
  onOpenSubmit: (milestone: MilestoneType) => void
  onOpenViewSubmission?: (milestoneId: string) => void
}

export function ProjectMilestone({
  milestone,
  projectType,
  onOpenSubmit,
  onOpenViewSubmission,
}: ProjectMilestoneProps) {
  const isGroup = projectType === 'group'

  const getStatusBadge = () => {
    switch (milestone.status) {
      case 'completed':
        return (
          <Badge tone="success" className="font-semibold">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Completed
          </Badge>
        )
      case 'under_review':
        return (
          <Badge tone="info" className="font-semibold">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> Under Review
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge tone="warning" className="font-semibold">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> In Progress
          </Badge>
        )
      case 'overdue':
        return (
          <Badge tone="destructive" className="font-semibold">
            <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-red-500" /> Overdue
          </Badge>
        )
      default:
        return (
          <Badge tone="neutral" className="font-medium">
            Pending
          </Badge>
        )
    }
  }

  const getMemberStatusIcon = (status: 'completed' | 'in_progress' | 'pending') => {
    if (status === 'completed') {
      return <span className="text-emerald-500 font-bold">✓</span>
    }
    if (status === 'in_progress') {
      return <span className="text-amber-500 font-bold">◐</span>
    }
    return <span className="text-muted-foreground/60 font-bold">○</span>
  }

  return (
    <div
      className={`relative rounded-md border p-5 transition-all ${
        milestone.status === 'in_progress'
          ? 'border-primary/40 bg-surface shadow-sm ring-1 ring-primary/20'
          : milestone.status === 'completed'
            ? 'border-emerald-500/20 bg-surface'
              : 'border-border bg-surface'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Main Details */}
        <div className="space-y-3 lg:max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-extrabold text-foreground">
              Milestone {milestone.milestoneNumber}
            </span>
            {getStatusBadge()}

            <span className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3.5 w-3.5" />
              Due: {milestone.dueDate}
            </span>

            {milestone.completedDate && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                • Completed: {milestone.completedDate}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground">{milestone.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {milestone.description}
            </p>
          </div>

          {/* Rubric Criteria Checklist */}
          {milestone.rubricCriteria.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs space-y-1.5">
              <span className="font-semibold text-foreground block mb-1">Rubric & Key Requirements:</span>
              {milestone.rubricCriteria.map((criterion, idx) => (
                <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                      milestone.status === 'completed' ? 'text-emerald-500' : 'text-primary/70'
                    }`}
                  />
                  <span>{criterion}</span>
                </div>
              ))}
            </div>
          )}

          {/* Group Team & Member Progress Breakdown */}
          {isGroup && milestone.memberProgress && milestone.memberProgress.length > 0 && (
            <div className="mt-3 rounded-xl border border-border/80 bg-surface/80 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" /> Team Progress
                </span>
                <span className="font-extrabold text-primary">{milestone.teamProgress || 0}%</span>
              </div>

              <ProgressBar value={milestone.teamProgress || 0} className="h-2" />

              {/* Per Member Status List */}
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Member Progress
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 text-xs">
                  {milestone.memberProgress.map((mem) => (
                    <div
                      key={mem.memberId}
                      className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/80 p-2"
                    >
                      <span className="shrink-0">{getMemberStatusIcon(mem.status)}</span>
                      <Avatar
                        name={mem.memberName}
                        src={mem.avatar}
                        size="xs"
                        className="border"
                      />
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-medium text-foreground block truncate text-[11px]">
                          {mem.memberName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{mem.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Points & Actions */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 lg:w-64">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Value:</span>
            <span className="font-bold text-foreground flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              {milestone.earnedPoints !== undefined
                ? `${milestone.earnedPoints} / ${milestone.totalPoints} Pts`
                : `${milestone.totalPoints} Pts`}
            </span>
          </div>

          <div className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Deliverable:</span>
            <p className="mt-0.5 truncate">{milestone.deliverableFormat}</p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2">
            {milestone.status === 'completed' || milestone.status === 'under_review' ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => onOpenViewSubmission?.(milestone.id)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View Submission
              </Button>
            ) : (
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => onOpenSubmit(milestone)}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Submit Milestone
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

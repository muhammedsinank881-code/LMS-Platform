import {
  Users,
  CheckCircle2,
  Clock,
  Crown,
  AlertTriangle,
  UserCheck,
} from 'lucide-react'
import { Badge, ProgressBar, Avatar } from '@/components/ui'
import type { Project, ProjectTeamMember } from '../types/project.types'

interface TeamWorkspaceProps {
  project: Project
}

export function TeamWorkspace({ project }: TeamWorkspaceProps) {
  if (project.projectType !== 'group' || !project.team) {
    return null
  }

  const { team, milestones } = project

  // Calculate dynamic summary stats from project data
  const totalTeamMilestones = milestones.length * team.members.length
  const completedTeamMilestones = team.members.reduce(
    (acc, m) => acc + m.completedMilestones,
    0
  )

  const inProgressMilestonesCount = milestones.filter(
    (m) => m.status === 'in_progress' || m.status === 'under_review'
  ).length

  const pendingMilestonesCount = milestones.filter(
    (m) => m.status === 'pending' || m.status === 'overdue'
  ).length

  const approvedSubmissions = project.submissions.filter(
    (s) => s.status === 'approved'
  ).length

  const getStatusBadge = (status: ProjectTeamMember['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge tone="info" className="font-medium">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case 'on_track':
        return (
          <Badge tone="success" className="font-medium">
            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500" /> On Track
          </Badge>
        )
      case 'at_risk':
        return (
          <Badge tone="warning" className="font-medium">
            <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" /> At Risk
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 rounded-md bg-surface border border-border bg-card p-6 shadow-sm">
      {/* Team Header Section */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Team Workspace</h3>
            <Badge tone="primary" className="text-xs font-semibold">
              Group Capstone
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Collaborative team tracking, member progress, sprint status, and mentor oversight.
          </p>
        </div>

        {/* Quick Header Summary Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground">
            <span className="text-muted-foreground mr-1.5">Members:</span>
            <span className="font-bold">{team.members.length} Members</span>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground">
            <span className="text-muted-foreground mr-1.5">Mentor:</span>
            <span className="font-bold">{team.mentor?.name || project.mentor.name}</span>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="mr-1 inline-block h-3.5 w-3.5" />
            {project.daysRemaining} Days Remaining
          </div>
        </div>
      </div>

      {/* Dynamic Team Progress Summary Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-center">
          <span className="text-2xl font-extrabold text-primary">{project.progressPercentage}%</span>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">Overall Progress</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-center">
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {completedTeamMilestones} / {totalTeamMilestones}
          </span>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">Milestones Completed</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-center">
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {inProgressMilestonesCount}
          </span>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">In Progress</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-center">
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {pendingMilestonesCount}
          </span>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">Pending</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-center">
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {team.members.length}
          </span>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">Team Members</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-center">
          <span className="text-2xl font-extrabold text-foreground">
            {approvedSubmissions} / {milestones.length}
          </span>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">Submissions Approved</p>
        </div>
      </div>

      {/* Team Members Progress Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            Team Members Progress ({team.members.length})
          </h4>
          <span className="text-xs text-muted-foreground">
            Updated in real-time based on member sprint commits
          </span>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ">
          {team.members.map((member) => (
            <div
              key={member.id}
              className={`relative flex flex-col justify-between rounded-xl border p-1 transition-all ${
                member.isCurrentUser
                  ? 'border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              {/* Member Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={member.name}
                    src={member.avatar}
                    size="md"
                    className="border border-border"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground text-sm">{member.name}</span>
                      {member.isCurrentUser && (
                        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {member.role === 'team_lead' ? (
                        <span className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Crown className="mr-1 h-3 w-3" /> Team Lead
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">Member</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>{getStatusBadge(member.status)}</div>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Progress</span>
                  <span className="font-bold text-foreground">{member.progress}%</span>
                </div>
                <ProgressBar
                  value={member.progress}
                  className={`h-2 ${
                    member.status === 'at_risk'
                      ? 'bg-amber-500/20 [&>div]:bg-amber-500'
                      : member.status === 'completed'
                        ? 'bg-blue-500/20 [&>div]:bg-blue-500'
                        : 'bg-primary/20 [&>div]:bg-primary'
                  }`}
                />
              </div>

              {/* Milestone & Activity Footers */}
              <div className="mt-4 space-y-1.5 pt-3 border-t border-border/60 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Completed:</span>
                  <span className="font-semibold text-foreground">
                    {member.completedMilestones} / {member.totalMilestones} milestones
                  </span>
                </div>

                {member.currentMilestone && (
                  <div className="flex items-start justify-between gap-2 text-muted-foreground">
                    <span className="shrink-0">Current:</span>
                    <span className="font-medium text-foreground truncate text-right">
                      {member.currentMilestone}
                    </span>
                  </div>
                )}

                {member.lastActivity && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" /> Last Active:
                    </span>
                    <span>{member.lastActivity}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

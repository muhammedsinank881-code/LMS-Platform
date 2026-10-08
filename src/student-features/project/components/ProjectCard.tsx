import {
  Users,
  GitBranch,
  ExternalLink,
  Clock,
  UserCheck,
  Crown,
  BookOpen,
  Layers,
} from 'lucide-react'
import { Badge, Button, ProgressBar } from '@/components/ui'
import type { Project } from '../types/project.types'

interface ProjectCardProps {
  project: Project
  onOpenSubmitForCurrent?: () => void
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isGroup = project.projectType === 'group'
  const teamLead = project.team?.members.find((m) => m.role === 'team_lead')

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md">
      {/* Decorative Top Accent Line */}
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          isGroup
            ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600'
            : 'bg-gradient-to-r from-emerald-500 to-teal-600'
        }`}
      />

      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        {/* Left Side: Title & Info */}
        <div className="space-y-4 lg:max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={isGroup ? 'primary' : 'success'}
              className={
                isGroup
                  ? 'border-primary/20 font-semibold'
                  : 'border-emerald-500/20 font-semibold'
              }
            >
              {isGroup ? (
                <>
                  <Users className="mr-1.5 h-3.5 w-3.5" /> Group Project
                </>
              ) : (
                <>
                  <Layers className="mr-1.5 h-3.5 w-3.5" /> Individual Project
                </>
              )}
            </Badge>

            <span className="flex items-center text-xs text-muted-foreground">
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              {project.courseName}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{project.title}</h2>
            {project.subtitle && (
              <p className="mt-1 text-sm font-medium text-muted-foreground">{project.subtitle}</p>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Group Team Highlights */}
          {isGroup && project.team && (
            <div className="mt-2 rounded-lg border border-border/60 bg-surface/60 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Team:</span>
                  <span className="font-bold text-primary">{project.team.name}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {project.team.members.length} Members
                  </span>
                </div>

                {teamLead && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    <span>Lead:</span>
                    <span className="font-medium text-foreground">{teamLead.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Progress & Quick Actions */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-5 lg:w-80">
          {/* Progress Card Header */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{isGroup ? 'Team Progress' : 'Overall Progress'}</span>
              <span className="font-bold text-foreground">{project.progressPercentage}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={project.progressPercentage} className="h-2.5" />
            </div>
          </div>

          {/* Key Quick Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border/50 bg-background/80 p-2.5">
              <span className="block text-[11px] text-muted-foreground">Mentor</span>
              <div className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{project.mentor.name}</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-background/80 p-2.5">
              <span className="block text-[11px] text-muted-foreground">Deadline</span>
              <div className="mt-1 flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{project.daysRemaining} Days Left</span>
              </div>
            </div>
          </div>

          {/* Links & Repository Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full text-xs font-medium">
                <GitBranch className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                GitHub Repository
              </Button>
            </a>

            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button size="sm" className="w-full text-xs font-medium">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Live Demo Preview
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

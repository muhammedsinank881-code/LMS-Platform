import { FolderKanban, Users, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { Project } from '../types/project.types'

interface ProjectSidebarProps {
  projects: Project[]
  activeProjectId: string
  onSelectProject: (id: string) => void
  onOpenCreateProject: () => void
  projectFilter: 'all' | 'group' | 'individual'
  onFilterChange: (filter: 'all' | 'group' | 'individual') => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function ProjectSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onOpenCreateProject,
  projectFilter,
  onFilterChange,
  isCollapsed,
  onToggleCollapse,
}: ProjectSidebarProps) {
  const filteredProjects = projects.filter((p) => {
    if (projectFilter === 'all') return true
    return p.projectType === projectFilter
  })

  if (isCollapsed) {
    return (
      <div className="flex shrink-0 flex-col items-center rounded-md border-r border-border bg-surface shadow-sm ">
        <button
          onClick={onToggleCollapse}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
          title="Expand Sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-64 shrink-0 flex-col space-y-4 rounded-xl border border-border bg-surface p-4 shadow-sm ">
      {/* Sidebar Header with Collapse Button */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Projects</h3>
        </div>
        <button
          onClick={onToggleCollapse}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Optimized Filter Tabs Row */}
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/40 p-1">
        {/* All Filter */}
        <button
          onClick={() => onFilterChange('all')}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-md px-1.5 py-1.5 text-[11px] font-semibold transition-all',
            projectFilter === 'all'
              ? 'shadow-xs bg-background text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <span>All</span>
          <span className="bg-surface-hover py-0.2 rounded-full px-1 text-[10px] font-bold tabular-nums">
            {projects.length}
          </span>
        </button>

        {/* Group Filter */}
        <button
          onClick={() => onFilterChange('group')}
          className={cn(
            'flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-semibold transition-all',
            projectFilter === 'group'
              ? 'shadow-xs bg-background text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Users className="h-3 w-3 shrink-0 text-primary" />
          <span>Group</span>
          <span className="bg-surface-hover py-0.2 rounded-full px-1 text-[10px] font-bold tabular-nums">
            {projects.filter((p) => p.projectType === 'group').length}
          </span>
        </button>

        {/* Individual Filter */}
        <button
          onClick={() => onFilterChange('individual')}
          className={cn(
            'flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-semibold transition-all',
            projectFilter === 'individual'
              ? 'shadow-xs bg-background text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <User className="h-3 w-3 shrink-0 text-emerald-500" />
          <span>Solo</span>
          <span className="bg-surface-hover py-0.2 rounded-full px-1 text-[10px] font-bold tabular-nums">
            {projects.filter((p) => p.projectType === 'individual').length}
          </span>
        </button>
      </div>

      {/* Project List */}
      <div className="max-h-[380px] space-y-1.5 overflow-y-auto pr-0.5">
        {filteredProjects.map((project) => {
          const isSelected = project.id === activeProjectId
          const isGroup = project.projectType === 'group'

          return (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={cn(
                'flex w-full flex-col gap-1 rounded-lg border p-3 text-left transition-all',
                isSelected
                  ? 'border-primary/50 bg-primary/10 shadow-sm ring-1 ring-primary/20'
                  : 'border-border/50 bg-background hover:border-border hover:bg-muted/40',
              )}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={cn(
                    'line-clamp-1 text-xs font-bold leading-snug',
                    isSelected ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {project.title}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between gap-2">
                <Badge
                  tone={isGroup ? 'primary' : 'success'}
                  size="sm"
                  className="px-1.5 py-0 text-[10px] font-medium"
                >
                  {isGroup ? 'Group' : 'Individual'}
                </Badge>
                <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {project.progressPercentage}%
                </span>
              </div>
            </button>
          )
        })}

        {filteredProjects.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No projects in this view.
          </div>
        )}
      </div>

      {/* Create New Project CTA */}
      <div className="border-t border-border pt-2">
        <Button
          onClick={onOpenCreateProject}
          variant="outline"
          size="sm"
          className="w-full justify-center text-xs font-bold"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5 text-primary" /> New Project
        </Button>
      </div>
    </div>
  )
}

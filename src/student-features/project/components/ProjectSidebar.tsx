import { FolderKanban, Users, User, Plus, PanelLeftOpen, PanelLeftClose } from 'lucide-react'
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

  return (
    <div
      className={cn(
        'flex shrink-0 flex-col overflow-hidden border border-border bg-surface shadow-sm',
        'transition-[width,padding,border-radius] duration-300 ease-in-out',
        isCollapsed ? 'w-8 items-center rounded-md ' : 'w-64 space-y-4 rounded-md p-4',
      )}
    >

      <div
        className={cn(
          'flex shrink-0 items-center border-b border-border',
          isCollapsed ? 'justify-center border-b-0 pb-0' : 'w-full justify-between pb-3',
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Projects</h3>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          aria-label={isCollapsed ? 'Expand project sidebar' : 'Collapse project sidebar'}
          aria-expanded={!isCollapsed}
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
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
        </>
      )}
    </div>
  )
}

import { ListFilter, Sparkles } from 'lucide-react'
import type { MilestoneFilter } from '../hooks/useProjectWorkspace'
import type { ProjectMilestone as MilestoneType, ProjectType } from '../types/project.types'
import { ProjectMilestone } from './ProjectMilestone'

interface ProjectMilestonesListProps {
  milestones: MilestoneType[]
  projectType: ProjectType
  statusFilter: MilestoneFilter
  onFilterChange: (filter: MilestoneFilter) => void
  onOpenSubmit: (milestone: MilestoneType) => void
  onOpenViewSubmission?: (milestoneId: string) => void
}

export function ProjectMilestonesList({
  milestones,
  projectType,
  statusFilter,
  onFilterChange,
  onOpenSubmit,
  onOpenViewSubmission,
}: ProjectMilestonesListProps) {
  const filterTabs: { label: string; value: MilestoneFilter; count?: number }[] = [
    { label: 'All Milestones', value: 'all' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
  ]

  return (
    <div className="space-y-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Project Milestones ({milestones.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Complete sequential sprint deliverables to progress towards final capstone evaluation.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onFilterChange(tab.value)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Milestones List */}
      {milestones.length > 0 ? (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <ProjectMilestone
              key={milestone.id}
              milestone={milestone}
              projectType={projectType}
              onOpenSubmit={onOpenSubmit}
              onOpenViewSubmission={onOpenViewSubmission}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-muted-foreground">
          <ListFilter className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-semibold text-foreground">No milestones match criteria</p>
          <p className="text-xs text-muted-foreground">Try selecting a different filter tab above.</p>
        </div>
      )}
    </div>
  )
}

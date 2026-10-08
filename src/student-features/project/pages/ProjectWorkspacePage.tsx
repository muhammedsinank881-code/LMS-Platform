import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectTasks } from '../components/ProjectTasks'
import { TaskHistory } from '../components/TaskHistory'
import { ProjectComments } from '../components/ProjectComments'
import { useProjectWorkspace } from '../hooks/useProjectWorkspace'
import { ProjectStatsOverview } from '../components/ProjectStatsOverview'
import { TeamWorkspace } from '../components/TeamWorkspace'

export function ProjectWorkspacePage() {
  const navigate = useNavigate()
  const {
    currentProject,
    activeProjectId,
    projectList,
    switchProject,
    isSidebarCollapsed,
    toggleSidebar,
    projectFilter,
    setProjectFilter,
    addTask,
    updateTaskStatus,
    addComment,
    stats,
    currentUserId,
    currentUserRole,
    currentUserName,
    currentUserAvatar,
  } = useProjectWorkspace()

  const handleSelectTaskFromHistory = (taskId: string) => {
    const el = document.getElementById(`task-item-${taskId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-primary')
      setTimeout(() => el.classList.remove('ring-2', 'ring-primary'), 2000)
    }
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Project Workspace"
          description="Manage project tasks, update completion workflow statuses, track task history, and collaborate in project discussions."
        />

        <div className="flex shrink-0 items-center gap-3">
          <Button
            onClick={() => navigate('/student/projects/new')}
            className="text-xs font-bold shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create New Project
          </Button>
        </div>
      </div>

      <div className="border-b border-border pb-3">
        <ProjectStatsOverview stats={stats} />
      </div>

      {/* Main Workspace Layout (Sidebar + Right Workspace) */}
      <div className="flex flex-col items-start gap-3 md:flex-row">
        {/* Left Sidebar */}
        <ProjectSidebar
          projects={projectList}
          activeProjectId={activeProjectId}
          onSelectProject={switchProject}
          onOpenCreateProject={() => navigate('/student/projects/new')}
          projectFilter={projectFilter}
          onFilterChange={setProjectFilter}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Right Main Workspace */}
        <div className="w-full min-w-0 flex-1 space-y-6">
          {/* Collapse expand indicator when collapsed */}
          {isSidebarCollapsed && (
            <div className="flex items-center justify-between rounded-md border border-border bg-surface p-2.5">
              <button
                onClick={toggleSidebar}
                className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                <ChevronRight className="h-4 w-4" /> Show Projects Sidebar ({projectList.length})
              </button>
              <span className="text-xs font-semibold text-muted-foreground">
                Active: <strong className="text-foreground">{currentProject.title}</strong>
              </span>
            </div>
          )}

          {/* 1. Project Overview */}
          <ProjectCard project={currentProject} />

          <TeamWorkspace project={currentProject} />  

          {/* 2. Project Tasks */}
          <ProjectTasks
            key={`tasks-${currentProject.id}`}
            project={currentProject}
            onAddTask={addTask}
            onUpdateTaskStatus={updateTaskStatus}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />

          {/* 3. Task History */}
          <TaskHistory tasks={currentProject.tasks} onSelectTask={handleSelectTaskFromHistory} />

          {/* 4. Project Discussion & Comments */}
          <ProjectComments
            key={`comments-${currentProject.id}`}
            comments={currentProject.comments}
            onAddComment={addComment}
            currentUserName={currentUserName}
            currentUserRole={
              currentUserRole === 'team_lead'
                ? 'Team Lead'
                : currentUserRole === 'student'
                  ? 'Student'
                  : 'Team Member'
            }
            currentUserAvatar={currentUserAvatar}
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectWorkspacePage

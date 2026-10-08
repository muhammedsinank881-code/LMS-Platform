import { useState, useMemo } from 'react'
import { MOCK_GROUP_PROJECT, MOCK_INDIVIDUAL_PROJECT } from '../data/mockProjectData'
import type {
  Project,
  ProjectTask,
  TaskStatus,
  ProjectComment,
  CreateProjectFormData,
  ProjectTeamMember,
} from '../types/project.types'

export type MilestoneFilter = 'all' | 'in_progress' | 'completed' | 'pending'

export function useProjectWorkspace() {
  const [projectMap, setProjectMap] = useState<Record<string, Project>>({
    [MOCK_GROUP_PROJECT.id]: MOCK_GROUP_PROJECT,
    [MOCK_INDIVIDUAL_PROJECT.id]: MOCK_INDIVIDUAL_PROJECT,
  })

  const [activeProjectId, setActiveProjectId] = useState<string>(MOCK_GROUP_PROJECT.id)

  // Sidebar Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [projectFilter, setProjectFilter] = useState<'all' | 'group' | 'individual'>('all')

  const currentProject = useMemo(() => {
    return projectMap[activeProjectId] || MOCK_GROUP_PROJECT
  }, [projectMap, activeProjectId])

  const projectList = useMemo(() => {
    return Object.values(projectMap)
  }, [projectMap])

  const switchProject = (projectId: string) => {
    if (projectMap[projectId]) {
      setActiveProjectId(projectId)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev)
  }

  // Current logged in user info
  const currentUserId = 'STD-1001'
  const currentUserName = 'Mohammed Sinan'
  const currentUserAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'

  const currentUserRole = useMemo<'student' | 'team_lead' | 'member' | 'mentor'>(() => {
    if (currentProject.projectType === 'individual') return 'student'
    const member = currentProject.team?.members.find(
      (m) => m.studentId === currentUserId || m.isCurrentUser,
    )
    if (member?.role === 'team_lead') return 'team_lead'
    return 'member'
  }, [currentProject, currentUserId])

  // Task Handlers
  const addTask = (taskData: {
    title: string
    description: string
    assigneeId?: string
    dueDate?: string
  }) => {
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const assigneeMember = currentProject.team?.members.find(
      (m) => m.studentId === taskData.assigneeId || m.id === taskData.assigneeId,
    )

    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      status: 'pending',
      createdAt: nowStr,
      createdBy: {
        name: currentUserName,
        role: currentUserRole,
        avatar: currentUserAvatar,
      },
      assignee: assigneeMember
        ? {
          id: assigneeMember.id,
          name: assigneeMember.name,
          avatar: assigneeMember.avatar,
          studentId: assigneeMember.studentId,
        }
        : {
          id: 'mem-curr',
          name: currentUserName,
          avatar: currentUserAvatar,
          studentId: currentUserId,
        },
      dueDate: taskData.dueDate || 'Nov 15, 2026',
    }

    setProjectMap((prev) => {
      const proj = prev[activeProjectId]
      if (!proj) return prev
      return {
        ...prev,
        [activeProjectId]: {
          ...proj,
          tasks: [newTask, ...proj.tasks],
        },
      }
    })
  }

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    setProjectMap((prev) => {
      const proj = prev[activeProjectId]
      if (!proj) return prev

      const updatedTasks = proj.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? nowStr : t.completedAt,
          }
        }
        return t
      })

      // Calculate new overall progress percentage based on completed tasks
      const completedCount = updatedTasks.filter((t) => t.status === 'completed').length
      const progressPercentage =
        updatedTasks.length > 0
          ? Math.round((completedCount / updatedTasks.length) * 100)
          : proj.progressPercentage

      return {
        ...prev,
        [activeProjectId]: {
          ...proj,
          tasks: updatedTasks,
          progressPercentage,
        },
      }
    })
  }

  // Comment Handler
  const addComment = (text: string) => {
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const newComment: ProjectComment = {
      id: `comm-${Date.now()}`,
      userName: currentUserName,
      userRole:
        currentUserRole === 'team_lead'
          ? 'Team Lead'
          : currentUserRole === 'student'
            ? 'Student'
            : 'Team Member',
      userAvatar: currentUserAvatar,
      date: nowStr,
      text,
      statusTag: 'general',
    }

    setProjectMap((prev) => {
      const proj = prev[activeProjectId]
      if (!proj) return prev
      return {
        ...prev,
        [activeProjectId]: {
          ...proj,
          comments: [newComment, ...proj.comments],
        },
      }
    })
  }

  // Project Creation Handler
  const createNewProject = (data: CreateProjectFormData): string => {
    const newId = `proj-custom-${Date.now()}`
    const startDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const techStack = data.techStackText
      ? data.techStackText.split(',').map((s) => s.trim()).filter(Boolean)
      : ['React 19', 'TypeScript', 'Tailwind CSS']

    const defaultTasks: ProjectTask[] = [
      {
        id: `task-${newId}-1`,
        title: 'Project Architecture Setup & Git Repository',
        description: 'Set up repository structure, install dependencies, and configure strict TypeScript rules.',
        status: 'in_progress',
        createdAt: startDate,
        createdBy: {
          name: currentUserName,
          role: data.projectType === 'group' ? 'team_lead' : 'student',
          avatar: currentUserAvatar,
        },
        assignee: {
          id: 'mem-curr',
          name: currentUserName,
          avatar: currentUserAvatar,
          studentId: currentUserId,
        },
        dueDate: data.targetDate || 'Nov 15, 2026',
      },
      {
        id: `task-${newId}-2`,
        title: 'Core UI Implementation & Components',
        description: 'Build responsive design system screens and integrate state persistence.',
        status: 'pending',
        createdAt: startDate,
        createdBy: {
          name: currentUserName,
          role: data.projectType === 'group' ? 'team_lead' : 'student',
          avatar: currentUserAvatar,
        },
        assignee: {
          id: 'mem-curr',
          name: currentUserName,
          avatar: currentUserAvatar,
          studentId: currentUserId,
        },
        dueDate: 'Dec 01, 2026',
      },
    ]

    let teamConfig
    if (data.projectType === 'group') {
      const convertedMembers: ProjectTeamMember[] = (data.groupMembers || []).map((m, idx) => ({
        id: `mem-new-${idx}-${Date.now()}`,
        name: m.name,
        avatar: m.avatar,
        role: m.role,
        email: m.email,
        studentId: m.studentId,
        progress: m.role === 'team_lead' ? 25 : 0,
        completedMilestones: 0,
        totalMilestones: 3,
        currentMilestone: 'Project Architecture & Setup',
        status: 'on_track',
        lastActivity: 'Just added',
        isCurrentUser: m.studentId === currentUserId,
      }))

      const hasCurrent = convertedMembers.some((m) => m.isCurrentUser)
      if (!hasCurrent) {
        convertedMembers.unshift({
          id: `mem-curr-${Date.now()}`,
          name: currentUserName,
          avatar: currentUserAvatar,
          role: 'team_lead',
          email: 'sinan@student.leadflow.io',
          studentId: currentUserId,
          progress: 25,
          completedMilestones: 0,
          totalMilestones: 3,
          currentMilestone: 'Project Architecture & Setup',
          status: 'on_track',
          lastActivity: 'Just created project',
          isCurrentUser: true,
        })
      }

      teamConfig = {
        id: `team-${newId}`,
        name: data.teamName || 'Capstone Group Team',
        description: data.teamDescription || 'Group project collaborative engineering team.',
        mentor: data.mentor || {
          name: 'Hasna PK',
          role: 'Senior Full-Stack Mentor',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          email: 'hasna.pk@leadflow.edu',
        },
        members: convertedMembers,
      }
    }

    const newProject: Project = {
      id: newId,
      title: data.title,
      subtitle: data.projectType === 'group' ? 'Group Capstone Project' : 'Individual Capstone Project',
      courseName: data.courseName || 'Full-Stack Web & AI Application Development',
      category: data.category || (data.projectType === 'group' ? 'Group Capstone' : 'Individual Capstone'),
      description: data.description,
      projectType: data.projectType,
      status: 'in_progress',
      progressPercentage: 15,
      repositoryUrl: data.repositoryUrl || 'https://github.com/leadflow-org/new-capstone-project',
      liveDemoUrl: data.liveDemoUrl || 'https://new-capstone.leadflow.app',
      startDate,
      targetDate: data.targetDate || 'Dec 15, 2026',
      daysRemaining: 45,
      techStack,
      mentor: data.mentor || {
        name: 'Hasna PK',
        role: 'Senior Full-Stack Mentor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        email: 'hasna.pk@leadflow.edu',
      },
      team: teamConfig,
      tasks: defaultTasks,
      comments: [
        {
          id: `comm-init-${Date.now()}`,
          userName: currentUserName,
          userRole: data.projectType === 'group' ? 'Team Lead' : 'Student',
          userAvatar: currentUserAvatar,
          date: startDate,
          text: `Initialized ${data.projectType === 'group' ? 'group' : 'individual'} workspace for ${data.title}.`,
          statusTag: 'general',
        },
      ],
      milestones: [],
      submissions: [],
      mentorComments: [],
    }

    setProjectMap((prev) => ({
      ...prev,
      [newId]: newProject,
    }))

    setActiveProjectId(newId)
    return newId
  }

  // Calculated Stats Overview
  const stats = useMemo(() => {
    const totalMilestones = currentProject.milestones.length
    const completedMilestones = currentProject.milestones.filter(
      (milestone) => milestone.status === 'completed',
    ).length
    const inProgressMilestones = currentProject.milestones.filter(
      (milestone) => milestone.status === 'in_progress',
    ).length

    return {
      totalMilestones,
      completedMilestones,
      inProgressMilestones,
      progressPercentage: currentProject.progressPercentage,
    }
  }, [currentProject])

  return {
    currentProject,
    activeProjectId,
    projectList,
    switchProject,
    createNewProject,

    isSidebarCollapsed,
    toggleSidebar,
    projectFilter,
    setProjectFilter,

    addTask,
    updateTaskStatus,
    addComment,
    stats,

    currentUserId,
    currentUserName,
    currentUserRole,
    currentUserAvatar,
  }
}

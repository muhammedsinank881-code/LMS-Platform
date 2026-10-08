export type ProjectType = 'individual' | 'group'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'rework'

export interface ProjectMentor {
  id?: string
  mentorId?: string
  name: string
  role: string
  avatar: string
  email?: string
}

export interface MentorLookup {
  mentorId: string
  name: string
  role: string
  email: string
  avatar: string
  department?: string
}

export interface ProjectTeamMember {
  id: string
  name: string
  avatar?: string
  role: 'team_lead' | 'member'
  email?: string
  progress: number
  completedMilestones: number
  totalMilestones?: number
  currentMilestone?: string
  status: 'on_track' | 'at_risk' | 'completed'
  lastActivity?: string
  isCurrentUser?: boolean
  studentId?: string
}

export interface ProjectTeam {
  id: string
  name: string
  description?: string
  members: ProjectTeamMember[]
  mentor?: ProjectMentor
}

export interface ProjectTask {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  createdBy: {
    name: string
    avatar?: string
    role: 'student' | 'team_lead' | 'member' | 'mentor'
  }
  assignee?: {
    id: string
    name: string
    avatar?: string
    studentId?: string
  }
  dueDate?: string
  completedAt?: string
}

export interface ProjectComment {
  id: string
  userName: string
  userRole?: string
  userAvatar?: string
  date: string
  text: string
  statusTag?: 'approved' | 'changes_requested' | 'praise' | 'general'
  rating?: number
}

// Retain legacy milestone & submission interfaces for compatibility if needed elsewhere
export interface MilestoneMemberProgress {
  memberId: string
  memberName: string
  avatar?: string
  progress: number
  status: 'completed' | 'in_progress' | 'pending'
}

export interface ProjectMilestone {
  id: string
  milestoneNumber: number
  title: string
  description: string
  dueDate: string
  status: 'completed' | 'in_progress' | 'under_review' | 'pending' | 'overdue'
  completedDate?: string
  deliverableFormat: string
  instructions: string
  rubricCriteria: string[]
  totalPoints: number
  earnedPoints?: number
  teamProgress?: number
  memberProgress?: MilestoneMemberProgress[]
}

export interface Submission {
  id: string
  milestoneId: string
  milestoneTitle: string
  submittedAt: string
  submittedBy: string
  status: 'approved' | 'under_review' | 'action_required' | 'pending'
  repositoryLink: string
  demoLink: string
  notes: string
  attachments?: string[]
  grade?: string
  feedbackSummary?: string
}

export interface MentorComment {
  id: string
  milestoneId?: string
  milestoneTitle?: string
  mentorName: string
  mentorRole: string
  mentorAvatar: string
  date: string
  text: string
  statusTag: 'approved' | 'changes_requested' | 'praise' | 'general'
  rating?: number
}

export interface Project {
  id: string
  title: string
  subtitle?: string
  courseName: string
  category: string
  description: string
  projectType: ProjectType
  status: 'in_progress' | 'under_review' | 'completed' | 'needs_revision'
  progressPercentage: number
  repositoryUrl: string
  liveDemoUrl: string
  mentor: ProjectMentor
  team?: ProjectTeam
  startDate: string
  targetDate: string
  daysRemaining: number
  techStack: string[]
  tasks: ProjectTask[]
  comments: ProjectComment[]
  // Kept for backward compatibility
  milestones: ProjectMilestone[]
  submissions: Submission[]
  mentorComments: MentorComment[]
}

export interface SubmitMilestoneFormData {
  milestoneId: string
  repositoryLink: string
  demoLink: string
  notes: string
  attachments?: string
}

export interface StudentLookup {
  studentId: string
  name: string
  email: string
  avatar: string
  course: string
  batch: string
  defaultRole?: string
}

export interface SelectedGroupMember {
  studentId: string
  name: string
  email: string
  avatar: string
  role: 'team_lead' | 'member'
  specificRole?: string
}

export interface CreateProjectFormData {
  title: string
  category: string
  courseName: string
  description: string
  projectType: ProjectType
  targetDate: string
  repositoryUrl?: string
  liveDemoUrl?: string
  techStackText?: string
  mentor?: ProjectMentor
  // Group Specific Fields
  teamName?: string
  teamDescription?: string
  groupMembers?: SelectedGroupMember[]
}

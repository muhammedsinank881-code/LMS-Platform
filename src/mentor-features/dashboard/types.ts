export interface QuickActionItem {
  id: string
  label: string
  iconName: 'attendance' | 'assignment' | 'upload' | 'schedule'
  colorTone: 'emerald' | 'blue' | 'amber' | 'purple'
}

export interface ScheduleItem {
  id: string
  startTime: string
  endTime: string
  title: string
  course: string
  location: string
  status: 'ongoing' | 'upcoming' | 'completed'
  iconType: 'code' | 'web' | 'list'
  classId?: string
  date?: string
  room?: string
  meetingLink?: string
  studentsCount?: number
  semester?: string
  description?: string
}

export interface RecentClassItem {
  id: string
  title: string
  course: string
  studentsCount: number
  iconType: 'code' | 'web' | 'list'
  bgAccent: 'blue' | 'emerald' | 'purple'
  courseCode?: string
  room?: string
  status?: 'active' | 'completed'
  attendanceRate?: number
  syllabusProgress?: number
}

export interface AnnouncementAttachment {
  name: string
  url: string
  size?: string
  type?: 'pdf' | 'doc' | 'link'
}

export interface AnnouncementItem {
  id: string
  title: string
  date: string
  category?: string
  isPinned?: boolean
  content?: string
  author?: string
  targetAudience?: string
  attachments?: AnnouncementAttachment[]
}

export interface MentorDashboardData {
  mentorName: string
  quickActions: QuickActionItem[]
  todaySchedule: ScheduleItem[]
  recentClasses: RecentClassItem[]
  announcements: AnnouncementItem[]
}

export interface CapstoneSummaryItem {
  id: string
  title?: string
  projectTitle: string
  teamName: string
  status: string
  progress: number
  membersCount: number
  health: string
}

export interface StudentSubmission {
  id: string
  studentName: string
  assignmentTitle: string
  submittedAt: string
  status: string
  batchName: string
}

export interface CurriculumModule {
  id: string
  title: string
  progress: number
  totalTopics: number
  completedTopics: number
  moduleNumber: number
  totalModules: number
  currentTopic: string
  nextMilestone: string
}

export interface HelpdeskTicketItem {
  id: string
  subject: string
  studentName: string
  priority: 'low' | 'medium' | 'high'
  status: string
  timeAgo: string
  category: string
}

export interface MentorProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: string
  activeBatch: string
  batchName: string
  batchCode: string
  totalStudents: number
  engagementRate: number
}

export interface MentoringSessionItem {
  id: string
  studentName: string
  topic: string
  scheduledAt: string
  status: string
  type: string
  time: string
  duration: string
}

export interface MentorKpiData {
  totalClasses: number
  totalStudents: number
  avgAttendance: number
  pendingReviews: number
  activeStudents: number
  attendanceRate: number
  avgCodeScore: number
  activeCapstones: number
  scheduledSessions: number
  openTickets: number
}

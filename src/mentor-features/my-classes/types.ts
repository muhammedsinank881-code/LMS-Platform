export interface StudentRosterItem {
  id: string
  name: string
  rollNumber: string
  email: string
  attendancePercentage: number
  statusToday: 'present' | 'absent' | 'late'
}

export interface MentorClass {
  id: string
  title: string
  courseCode: string
  courseName: string
  program: string
  year: string
  semester: string
  studentsCount: number
  room: string
  status: 'active' | 'completed'
  iconType: 'code' | 'web' | 'database' | 'algo' | 'mobile' | 'cloud'
  mentorId: string
  schedule: string
  description: string
  attendanceRate: number
  syllabusProgress: number
  enrolledStudents: StudentRosterItem[]
}

export type ClassFilterTab = 'all' | 'active' | 'completed'

export interface ClassSummaryStats {
  totalCount: number
  activeCount: number
  completedCount: number
}

export type StudentAttendanceStatus = 'present' | 'late' | 'absent'

export interface RecentAttendanceRecord {
  date: string
  status: StudentAttendanceStatus
}

export interface AcademicSummary {
  gpa: string
  assignmentsCompleted: number
  totalAssignments: number
  capstoneProject: string
}

export interface AssignedStudent {
  id: string
  mentorId: string
  name: string
  rollNumber: string
  avatarInitials: string
  classBatch: string
  email: string
  phone: string
  attendancePercentage: number
  statusToday: StudentAttendanceStatus
  assignedMentorName: string
  recentAttendance: RecentAttendanceRecord[]
  academicSummary: AcademicSummary
}

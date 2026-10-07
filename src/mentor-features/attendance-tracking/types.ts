export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface StudentAttendanceRecord {
  id: string
  name: string
  rollNumber: string
  avatarInitials: string
  status: AttendanceStatus
}

export interface ClassCohortOption {
  id: string
  name: string
  totalStudents: number
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'partial' | 'pending'

export interface TelemetryEvent {
  id: string
  type: 'join' | 'leave' | 'reconnect'
  label: string
  time: string
  description: string
}

export interface StudentAttendanceRecord {
  id: string
  name: string
  rollNumber: string
  avatarInitials: string
  status: AttendanceStatus
  hasLiveVideo?: boolean
  durationMinutes?: number
  totalMinutes?: number
  firstEntry?: string
  lastExit?: string
  lastTelemetry?: string
  verificationState?: 'Verified' | 'Pending' | 'Unverified'
  evidenceSource?: string
  calculationRuleText?: string
  telemetryEvents?: TelemetryEvent[]
}

export interface ClassCohortOption {
  id: string
  name: string
  totalStudents: number
  code?: string
}

export interface SessionInfo {
  id: string
  subject: string
  title: string
  badgeText: string
  lecture: string
  timeRange: string
  evidenceSource: string
  verificationState: string
}

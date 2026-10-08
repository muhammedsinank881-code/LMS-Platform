export type ClassType = 'in-person' | 'online'

export type ClassStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'

export type MeetingPlatform = 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Other'

export type CalendarViewMode = 'month' | 'week' | 'day'

export interface ScheduledClass {
  id: string
  title: string
  courseClass: string
  semester: string
  module: string
  date: string // YYYY-MM-DD format (e.g. '2026-10-08')
  startTime: string // e.g. '09:00 AM'
  endTime: string // e.g. '10:00 AM'
  duration: string // e.g. '1 hour'
  type: ClassType
  room?: string // e.g. 'Room 302', 'Lab 1', 'Hall A'
  meetingPlatform?: MeetingPlatform
  meetingLink?: string
  description?: string
  attachedMaterialTitles?: string[]
  capacity: number
  attendanceRequired: boolean
  allowRecording: boolean
  notifyStudents: boolean
  status: ClassStatus
}

export interface ScheduleFiltersState {
  search: string
  course: string
  semester: string
  module: string
  type: 'all' | ClassType
  status: 'all' | ClassStatus
  date: string
}

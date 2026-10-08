// Attendance Types
export type DayStatus = 'present' | 'absent' | 'late' | 'weekend' | 'holiday'
export type SessionStatus = 'completed' | 'active'
export type ActivityType = 'live' | 'video' | 'quiz' | 'assignment' | 'practice' | 'other'

export interface AttendanceSession {
  id: string
  checkIn: string       // e.g. "09:30 AM"
  checkOut: string | null  // null = active (not checked out yet)
  durationMinutes: number | null  // null if active
  platform: string      // e.g. "LeadFlow LMS"
  status: SessionStatus
}

export interface DailyActivity {
  id: string
  type: ActivityType
  title: string          // e.g. "Attended Python Fullstack live class"
  detail?: string        // e.g. "React Frontend · useState, useEffect"
  time: string           // e.g. "10:00 AM"
  durationMinutes?: number
}

export interface AttendanceDayRecord {
  date: string          // ISO "YYYY-MM-DD"
  displayDate: string   // e.g. "Oct 07, 2026"
  dayOfWeek: string     // e.g. "Wednesday"
  status: DayStatus
  totalMinutes: number
  sessionCount: number
  sessions: AttendanceSession[]
  activities: DailyActivity[]
}

export interface AttendanceSummaryStats {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  attendancePercentage: number
  currentStreakDays: number
  totalHoursThisMonth: number
  avgDailyHours: number
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function mins(h: number, m = 0) {
  return h * 60 + m
}

// ─── Mock Session Data ────────────────────────────────────────────────────────

export const MOCK_ATTENDANCE_RECORDS: AttendanceDayRecord[] = [
  {
    date: '2026-10-07',
    displayDate: 'Oct 07, 2026',
    dayOfWeek: 'Wednesday',
    status: 'present',
    totalMinutes: mins(7, 15),
    sessionCount: 3,
    sessions: [
      { id: 's1', checkIn: '09:15 AM', checkOut: '11:00 AM', durationMinutes: mins(1, 45), platform: 'LeadFlow LMS', status: 'completed' },
      { id: 's2', checkIn: '12:30 PM', checkOut: '03:45 PM', durationMinutes: mins(3, 15), platform: 'LeadFlow LMS', status: 'completed' },
      { id: 's3', checkIn: '04:30 PM', checkOut: null, durationMinutes: null, platform: 'LeadFlow LMS', status: 'active' },
    ],
    activities: [
      { id: 'a1', type: 'live', title: 'Attended Python Fullstack live class', detail: 'Django REST APIs', time: '09:30 AM', durationMinutes: mins(1, 30) },
      { id: 'a2', type: 'video', title: 'Watched 2 videos', detail: 'React Frontend · useState, useEffect', time: '12:45 PM', durationMinutes: 45 },
      { id: 'a3', type: 'practice', title: 'Solved 3 coding problems', detail: 'JavaScript arrays', time: '02:00 PM', durationMinutes: 50 },
      { id: 'a4', type: 'quiz', title: 'Completed JavaScript quiz', detail: 'Scored 8/10', time: '03:20 PM' },
      { id: 'a5', type: 'assignment', title: 'Started assignment', detail: 'Todo app with React', time: '04:35 PM' },
    ],
  },
  {
    date: '2026-10-06',
    displayDate: 'Oct 06, 2026',
    dayOfWeek: 'Tuesday',
    status: 'present',
    totalMinutes: mins(8, 0),
    sessionCount: 2,
    sessions: [
      { id: 's4', checkIn: '09:00 AM', checkOut: '01:00 PM', durationMinutes: mins(4, 0), platform: 'LeadFlow LMS', status: 'completed' },
      { id: 's5', checkIn: '02:00 PM', checkOut: '06:00 PM', durationMinutes: mins(4, 0), platform: 'LeadFlow LMS', status: 'completed' },
    ],
    activities: [
      { id: 'a6', type: 'live', title: 'Attended Python Fullstack live class', detail: 'Models and migrations', time: '09:00 AM', durationMinutes: mins(2) },
      { id: 'a7', type: 'video', title: 'Watched 3 videos', detail: 'React Frontend · Components and props', time: '11:30 AM', durationMinutes: 70 },
      { id: 'a8', type: 'assignment', title: 'Submitted assignment', detail: 'HTML & CSS landing page', time: '02:30 PM' },
      { id: 'a9', type: 'practice', title: 'Completed practice set', detail: 'Python functions', time: '04:00 PM', durationMinutes: 60 },
    ],
  },
  {
    date: '2026-10-05',
    displayDate: 'Oct 05, 2026',
    dayOfWeek: 'Monday',
    status: 'late',
    totalMinutes: mins(5, 30),
    sessionCount: 1,
    sessions: [
      { id: 's6', checkIn: '11:45 AM', checkOut: '05:15 PM', durationMinutes: mins(5, 30), platform: 'LeadFlow LMS', status: 'completed' },
    ],
    activities: [
      { id: 'a10', type: 'video', title: 'Watched 2 videos', detail: 'Python · Classes and objects', time: '12:00 PM', durationMinutes: 40 },
      { id: 'a11', type: 'live', title: 'Joined live doubt-clearing session', detail: 'Joined 45 min late', time: '02:00 PM', durationMinutes: 60 },
      { id: 'a12', type: 'quiz', title: 'Completed Python quiz', detail: 'Scored 7/10', time: '04:30 PM' },
    ],
  },
  {
    date: '2026-10-04',
    displayDate: 'Oct 04, 2026',
    dayOfWeek: 'Sunday',
    status: 'weekend',
    totalMinutes: 0,
    sessionCount: 0,
    sessions: [],
    activities: [],
  },
  {
    date: '2026-10-03',
    displayDate: 'Oct 03, 2026',
    dayOfWeek: 'Saturday',
    status: 'present',
    totalMinutes: mins(3, 45),
    sessionCount: 2,
    sessions: [
      { id: 's7', checkIn: '10:00 AM', checkOut: '11:30 AM', durationMinutes: mins(1, 30), platform: 'LeadFlow LMS', status: 'completed' },
      { id: 's8', checkIn: '12:45 PM', checkOut: '03:00 PM', durationMinutes: mins(2, 15), platform: 'LeadFlow LMS', status: 'completed' },
    ],
    activities: [
      { id: 'a13', type: 'live', title: 'Attended weekend revision class', detail: 'JavaScript fundamentals', time: '10:00 AM', durationMinutes: 90 },
      { id: 'a14', type: 'practice', title: 'Solved 5 coding problems', detail: 'Strings and loops', time: '12:45 PM', durationMinutes: mins(2, 15) },
    ],
  },
  {
    date: '2026-10-02',
    displayDate: 'Oct 02, 2026',
    dayOfWeek: 'Friday',
    status: 'present',
    totalMinutes: mins(7, 30),
    sessionCount: 1,
    sessions: [
      { id: 's9', checkIn: '09:15 AM', checkOut: '04:45 PM', durationMinutes: mins(7, 30), platform: 'LeadFlow LMS', status: 'completed' },
    ],
    activities: [
      { id: 'a15', type: 'live', title: 'Attended Python Fullstack live class', detail: 'Django views and URLs', time: '09:30 AM', durationMinutes: mins(2) },
      { id: 'a16', type: 'video', title: 'Watched 4 videos', detail: 'React Frontend · JSX and rendering', time: '12:00 PM', durationMinutes: 95 },
      { id: 'a17', type: 'assignment', title: 'Submitted assignment', detail: 'Python calculator', time: '03:00 PM' },
    ],
  },
  {
    date: '2026-10-01',
    displayDate: 'Oct 01, 2026',
    dayOfWeek: 'Thursday',
    status: 'absent',
    totalMinutes: 0,
    sessionCount: 0,
    sessions: [],
    activities: [],
  },
  {
    date: '2026-09-30',
    displayDate: 'Sep 30, 2026',
    dayOfWeek: 'Wednesday',
    status: 'present',
    totalMinutes: mins(6, 45),
    sessionCount: 2,
    sessions: [
      { id: 's10', checkIn: '09:30 AM', checkOut: '12:30 PM', durationMinutes: mins(3, 0), platform: 'LeadFlow LMS', status: 'completed' },
      { id: 's11', checkIn: '01:15 PM', checkOut: '05:00 PM', durationMinutes: mins(3, 45), platform: 'LeadFlow LMS', status: 'completed' },
    ],
    activities: [
      { id: 'a18', type: 'live', title: 'Attended Python Fullstack live class', detail: 'Django templates', time: '09:30 AM', durationMinutes: mins(2) },
      { id: 'a19', type: 'video', title: 'Watched 2 videos', detail: 'React Frontend · Event handling', time: '01:15 PM', durationMinutes: 40 },
      { id: 'a20', type: 'quiz', title: 'Completed React quiz', detail: 'Scored 9/10', time: '03:30 PM' },
    ],
  },
  {
    date: '2026-09-29',
    displayDate: 'Sep 29, 2026',
    dayOfWeek: 'Tuesday',
    status: 'present',
    totalMinutes: mins(7, 0),
    sessionCount: 3,
    sessions: [
      { id: 's12', checkIn: '09:00 AM', checkOut: '10:30 AM', durationMinutes: mins(1, 30), platform: 'LeadFlow LMS', status: 'completed' },
      { id: 's13', checkIn: '11:00 AM', checkOut: '01:00 PM', durationMinutes: mins(2, 0), platform: 'LeadFlow LMS', status: 'completed' },
      { id: 's14', checkIn: '02:30 PM', checkOut: '06:00 PM', durationMinutes: mins(3, 30), platform: 'LeadFlow LMS', status: 'completed' },
    ],
    activities: [
      { id: 'a21', type: 'video', title: 'Watched 2 videos', detail: 'Python · Dictionaries and sets', time: '09:00 AM', durationMinutes: 45 },
      { id: 'a22', type: 'live', title: 'Attended Python Fullstack live class', detail: 'Django ORM', time: '11:00 AM', durationMinutes: mins(2) },
      { id: 'a23', type: 'assignment', title: 'Submitted assignment', detail: 'Student records CRUD', time: '04:00 PM' },
    ],
  },
  {
    date: '2026-09-28',
    displayDate: 'Sep 28, 2026',
    dayOfWeek: 'Monday',
    status: 'absent',
    totalMinutes: 0,
    sessionCount: 0,
    sessions: [],
    activities: [],
  },
  {
    date: '2026-09-27',
    displayDate: 'Sep 27, 2026',
    dayOfWeek: 'Sunday',
    status: 'weekend',
    totalMinutes: 0,
    sessionCount: 0,
    sessions: [],
    activities: [],
  },
  {
    date: '2026-09-26',
    displayDate: 'Sep 26, 2026',
    dayOfWeek: 'Saturday',
    status: 'present',
    totalMinutes: mins(4, 0),
    sessionCount: 1,
    sessions: [
      { id: 's15', checkIn: '10:00 AM', checkOut: '02:00 PM', durationMinutes: mins(4, 0), platform: 'LeadFlow LMS', status: 'completed' },
    ],
    activities: [
      { id: 'a24', type: 'live', title: 'Attended weekend revision class', detail: 'HTML & CSS', time: '10:00 AM', durationMinutes: mins(2) },
      { id: 'a25', type: 'practice', title: 'Built a responsive navbar', detail: 'Flexbox practice', time: '12:30 PM', durationMinutes: mins(1, 30) },
    ],
  },
  {
    date: '2026-09-25',
    displayDate: 'Sep 25, 2026',
    dayOfWeek: 'Friday',
    status: 'late',
    totalMinutes: mins(4, 15),
    sessionCount: 1,
    sessions: [
      { id: 's16', checkIn: '11:15 AM', checkOut: '03:30 PM', durationMinutes: mins(4, 15), platform: 'LeadFlow LMS', status: 'completed' },
    ],
    activities: [
      { id: 'a26', type: 'video', title: 'Watched 3 videos', detail: 'JavaScript · Functions and scope', time: '11:30 AM', durationMinutes: 60 },
      { id: 'a27', type: 'quiz', title: 'Completed JavaScript quiz', detail: 'Scored 6/10', time: '01:30 PM' },
      { id: 'a28', type: 'practice', title: 'Solved 2 coding problems', detail: 'Array methods', time: '02:15 PM', durationMinutes: 60 },
    ],
  },
  {
    date: '2026-09-24',
    displayDate: 'Sep 24, 2026',
    dayOfWeek: 'Thursday',
    status: 'present',
    totalMinutes: mins(8, 30),
    sessionCount: 2,
    sessions: [
      { id: 's17', checkIn: '09:00 AM', checkOut: '01:30 PM', durationMinutes: mins(4, 30), platform: 'LeadFlow LMS', status: 'completed' },
      { id: 's18', checkIn: '02:00 PM', checkOut: '06:00 PM', durationMinutes: mins(4, 0), platform: 'LeadFlow LMS', status: 'completed' },
    ],
    activities: [
      { id: 'a29', type: 'live', title: 'Attended Python Fullstack live class', detail: 'Django forms', time: '09:00 AM', durationMinutes: mins(2, 30) },
      { id: 'a30', type: 'video', title: 'Watched 2 videos', detail: 'React Frontend · Introduction', time: '12:00 PM', durationMinutes: 50 },
      { id: 'a31', type: 'assignment', title: 'Submitted assignment', detail: 'Contact form with validation', time: '03:00 PM' },
    ],
  },
]

export const MOCK_ATTENDANCE_SUMMARY: AttendanceSummaryStats = {
  totalDays: 22,
  presentDays: 17,
  absentDays: 2,
  lateDays: 3,
  attendancePercentage: 92,
  currentStreakDays: 5,
  totalHoursThisMonth: 138,
  avgDailyHours: 7.2,
}
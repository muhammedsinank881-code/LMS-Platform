export type ExamStatus = 'ongoing' | 'upcoming' | 'completed' | 'results_pending'

export interface StudentGradeItem {
  id: string
  name: string
  rollNumber: string
  email: string
  marksObtained: number | null
  totalMarks: number
  grade?: string
  status: 'graded' | 'pending' | 'absent'
}

export interface MentorExam {
  id: string
  title: string
  classBatch: string
  courseName: string
  subject: string
  year: string
  date: string
  formattedDate: string // e.g. "05 Oct 2026"
  time: string // e.g. "02:00 PM"
  duration: string // e.g. "3 Hours"
  studentsCount: number
  room: string
  status: ExamStatus
  totalMarks: number
  passingMarks: number
  instructions?: string
  mentorId: string
  studentGrades: StudentGradeItem[]
}

export type ExamFilterTab = 'all' | 'upcoming' | 'today' | 'completed' | 'results_pending'

export interface ExamOverviewStats {
  total: number
  upcoming: number
  today: number
  resultsPending: number
  completed: number
}

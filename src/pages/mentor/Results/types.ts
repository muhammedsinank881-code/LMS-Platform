export type ResultStatus = 'published' | 'pending' | 'draft' | 'failed'

export interface StudentResult {
  id: string
  studentId: string // e.g. "BCA23001"
  studentName: string
  studentEmail: string
  examId: string
  examName: string
  subject: string
  classBatch: string
  courseName: string
  marksObtained: number
  totalMarks: number
  percentage: number
  grade: string // e.g. "A+", "A", "B+", "B", "C", "F"
  status: ResultStatus
  publishedDate?: string
  remarks?: string
  mentorId: string
}

export type ResultsFilterTab = 'all' | 'published' | 'pending' | 'failed'

export interface ResultsOverviewStats {
  total: number
  published: number
  pending: number
  averageScore: number
}

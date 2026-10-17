export type QuestionType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'true_false'
  | 'short_answer'

export type QuizStatus = 'active' | 'draft' | 'completed' | 'scheduled'

export interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizQuestion {
  id: string
  questionNumber: number
  type: QuestionType
  questionText: string
  options?: QuestionOption[]
  correctAnswer?: string | string[] | boolean
  marks: number
  explanation?: string
  isRequired: boolean
}

export interface QuizSettings {
  questionCount: number
  durationMinutes: number
  passingScore: number
  maxAttempts: number
  startDate?: string
  endDate: string
  randomizeQuestions: boolean
  randomizeOptions: boolean
  showResultsAfterSubmission: boolean
  allowRetake: boolean
}

export interface QuizItem {
  id: string
  title: string
  description: string
  classBatch: string
  subject: string
  status: QuizStatus
  questionCount: number
  durationMinutes: number
  totalMarks: number
  passingScore: number
  availableUntil: string
  startDate?: string
  submissionsCount: number
  totalStudents: number
  averageScore: number | null
  createdAt: string
  settings: QuizSettings
  questions: QuizQuestion[]
}

export interface QuizStudentAnswer {
  questionId: string
  studentAnswer: string | string[] | boolean
  isCorrect?: boolean
  scoreAwarded?: number
  mentorFeedback?: string
}

export interface QuizSubmissionItem {
  id: string
  quizId: string
  studentId: string
  studentName: string
  studentRoll: string
  studentEmail?: string
  studentAvatar?: string
  submittedAt: string
  score: number
  totalMarks: number
  percentage: number
  status: 'graded' | 'pending_review'
  attemptNumber: number
  answers: Record<string, QuizStudentAnswer>
}

export interface QuizResultSummary {
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number
  totalAttempts: number
}

export interface QuizKpiStats {
  activeCount: number
  draftCount: number
  totalSubmissions: number
  averageScore: number
}

export interface MentoringSession {
  id: string
  studentId: string
  mentorId: string
  scheduledAt: string
  durationMinutes: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export interface Submission {
  id: string
  studentId: string
  assignmentTitle: string
  submittedAt: string
  status: 'pending' | 'reviewed' | 'needs-revision'
  repoUrl?: string
}

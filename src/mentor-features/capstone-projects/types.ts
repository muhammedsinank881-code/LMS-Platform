export interface CapstoneProject {
  id: string
  title: string
  studentId: string
  mentorId: string
  status: 'proposal' | 'in-progress' | 'under-review' | 'approved'
  milestonesCompleted: number
  totalMilestones: number
}

export interface AssignmentItem {
  id: string
  title: string
  classBatch: string
  subject?: string
  dueDate: string
  startDate?: string
  submissionsCount: number
  totalStudents: number
  totalMarks?: number
  passingMarks?: number
  status: 'active' | 'graded' | 'draft'
  assignmentType?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  submissionType?: string
  description?: string
}

let assignmentsData: AssignmentItem[] = [
  {
    id: 'asg-1',
    title: 'React Custom Hooks & State Management Lab',
    classBatch: 'BCA - 3rd Year',
    subject: 'Web Development & React',
    dueDate: '10 Oct 2026',
    submissionsCount: 18,
    totalStudents: 24,
    totalMarks: 50,
    passingMarks: 20,
    status: 'active',
    assignmentType: 'Lab Assignment',
    difficulty: 'Medium',
  },
  {
    id: 'asg-2',
    title: 'Python Data Structures & Algorithms Problem Set',
    classBatch: 'BCA - 4th Semester',
    subject: 'Python Data Structures',
    dueDate: '12 Oct 2026',
    submissionsCount: 12,
    totalStudents: 14,
    totalMarks: 100,
    passingMarks: 40,
    status: 'active',
    assignmentType: 'Theory Homework',
    difficulty: 'Hard',
  },
  {
    id: 'asg-3',
    title: 'Relational Database Schema & SQL Querying Assignment',
    classBatch: 'BCA - 2nd Year',
    subject: 'Database Management Systems',
    dueDate: '02 Oct 2026',
    submissionsCount: 12,
    totalStudents: 12,
    totalMarks: 50,
    passingMarks: 20,
    status: 'graded',
    assignmentType: 'Lab Assignment',
    difficulty: 'Easy',
  },
  {
    id: 'asg-4',
    title: 'Capstone Project Milestone 2 Proposal Draft',
    classBatch: 'BCA - 3rd Year',
    subject: 'Capstone Project',
    dueDate: '18 Oct 2026',
    submissionsCount: 0,
    totalStudents: 24,
    totalMarks: 100,
    passingMarks: 50,
    status: 'draft',
    assignmentType: 'Project Milestone',
    difficulty: 'Medium',
  },
]

export function getAssignments(): AssignmentItem[] {
  return [...assignmentsData]
}

export function addAssignment(newAsg: Omit<AssignmentItem, 'id' | 'submissionsCount' | 'totalStudents'> & { totalStudents?: number }): AssignmentItem {
  const item: AssignmentItem = {
    ...newAsg,
    id: `asg-${Date.now()}`,
    submissionsCount: 0,
    totalStudents: newAsg.totalStudents || 24,
  }
  assignmentsData = [item, ...assignmentsData]
  return item
}

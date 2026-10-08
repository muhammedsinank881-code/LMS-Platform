// ─── Types ────────────────────────────────────────────────────────────────────

export type RequirementStatus = 'completed' | 'in_progress' | 'pending' | 'locked'
export type CertificateStatus = 'earned' | 'in_progress' | 'locked'

export interface CourseRequirement {
  id: string
  courseId: string
  title: string
  code: string
  completedModules: number
  totalModules: number
  completedLessons: number
  totalLessons: number
  progressPercent: number
  status: RequirementStatus
  /** Link target for the "Go to course" CTA */
  link: string
}

export interface AssignmentRequirement {
  id: string
  title: string
  courseCode: string
  type: 'assignment' | 'quiz'
  score?: string
  scorePercent?: number
  status: RequirementStatus
  dueDate?: string
}

export interface ProjectRequirement {
  id: string
  title: string
  type: 'individual' | 'group'
  status: RequirementStatus
  progressPercent: number
  milestonesSummary: string  // e.g. "3 / 5 milestones done"
  link: string
}

export interface FinalAssessmentRequirement {
  id: string
  title: string
  status: RequirementStatus
  score?: number
  passingScore: number
  maxAttempts: number
  attemptsMade: number
  scheduledDate?: string
}

export interface CertificateData {
  /** Certificate metadata */
  id: string
  title: string
  issuer: string
  courseName: string
  courseCode: string
  studentName: string
  studentId: string
  /** e.g. "2026-10-07" — set when all reqs are completed */
  issuedDate: string | null
  /** e.g. "CERT-FS-2026-001" */
  certificateNumber: string | null
  status: CertificateStatus

  /** 0–100 representing completeness across all requirements */
  overallProgress: number

  /** Requirement groups */
  courseRequirements: CourseRequirement[]
  assignmentRequirements: AssignmentRequirement[]
  projectRequirements: ProjectRequirement[]
  finalAssessment: FinalAssessmentRequirement
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_CERTIFICATE_DATA: CertificateData = {
  id: 'cert-fs-2026-001',
  title: 'Full-Stack Web & AI Development Certificate',
  issuer: 'LeadFlow Academy',
  courseName: 'Full-Stack Web & AI Application Development',
  courseCode: 'FS-2026',
  studentName: 'Mohammed Sinan K',
  studentId: 'STD-1001',
  issuedDate: null,           // null = not yet earned
  certificateNumber: null,
  status: 'in_progress',
  overallProgress: 61,

  courseRequirements: [
    {
      id: 'cr-1',
      courseId: 'course-fullstack-101',
      title: 'Full-Stack Web & AI Application Development',
      code: 'FS-2026',
      completedModules: 14,
      totalModules: 18,
      completedLessons: 42,
      totalLessons: 54,
      progressPercent: 78,
      status: 'in_progress',
      link: '/student/courses',
    },
    {
      id: 'cr-2',
      courseId: 'course-frontend-202',
      title: 'Frontend Engineering & React 19 Mastery',
      code: 'FE-2026',
      completedModules: 5,
      totalModules: 11,
      completedLessons: 18,
      totalLessons: 40,
      progressPercent: 45,
      status: 'in_progress',
      link: '/student/courses',
    },
    {
      id: 'cr-3',
      courseId: 'course-uiux-301',
      title: 'Modern UI/UX & Tailwind CSS Systems',
      code: 'UX-2025',
      completedModules: 8,
      totalModules: 8,
      completedLessons: 28,
      totalLessons: 28,
      progressPercent: 100,
      status: 'completed',
      link: '/student/courses',
    },
    {
      id: 'cr-4',
      courseId: 'course-ts-302',
      title: 'TypeScript & Zod Architecture Specialist',
      code: 'TS-2025',
      completedModules: 6,
      totalModules: 6,
      completedLessons: 22,
      totalLessons: 22,
      progressPercent: 100,
      status: 'completed',
      link: '/student/courses',
    },
  ],

  assignmentRequirements: [
    {
      id: 'ar-1',
      title: 'Recharts Dashboard & Data Visualization Project',
      courseCode: 'FE-2026',
      type: 'assignment',
      score: '98/100',
      scorePercent: 98,
      status: 'completed',
    },
    {
      id: 'ar-2',
      title: 'React 19 & Context API Knowledge Quiz',
      courseCode: 'FE-2026',
      type: 'quiz',
      score: '48/50',
      scorePercent: 96,
      status: 'completed',
    },
    {
      id: 'ar-3',
      title: 'Zustand Store Persistence & State Management',
      courseCode: 'SM-2025',
      type: 'assignment',
      status: 'in_progress',
      dueDate: 'Yesterday, 05:00 PM',
    },
    {
      id: 'ar-4',
      title: 'React Custom Hooks & Attendance Tracker Lab',
      courseCode: 'FS-2026',
      type: 'assignment',
      status: 'pending',
      dueDate: 'Today, 11:59 PM',
    },
    {
      id: 'ar-5',
      title: 'TypeScript Generics & Zod Validation Challenge',
      courseCode: 'FS-2026',
      type: 'quiz',
      status: 'pending',
      dueDate: 'Today, 06:00 PM',
    },
  ],

  projectRequirements: [
    {
      id: 'pr-1',
      title: 'E-Commerce Platform & LMS Suite',
      type: 'group',
      status: 'in_progress',
      progressPercent: 72,
      milestonesSummary: '2 / 5 milestones approved',
      link: '/student/projects',
    },
    {
      id: 'pr-2',
      title: 'AI Portfolio & Smart Assistant Workspace',
      type: 'individual',
      status: 'in_progress',
      progressPercent: 65,
      milestonesSummary: '2 / 4 milestones approved',
      link: '/student/projects',
    },
  ],

  finalAssessment: {
    id: 'fa-1',
    title: 'Full-Stack Capstone Final Assessment',
    status: 'locked',
    passingScore: 80,
    maxAttempts: 3,
    attemptsMade: 0,
    scheduledDate: 'Available after all requirements are met',
  },
}

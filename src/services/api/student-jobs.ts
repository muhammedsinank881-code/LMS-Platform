import type { TenantOwned } from '@/types'

export type StudentJobWorkMode = 'remote' | 'hybrid' | 'onsite'
export type StudentJobType = 'internship' | 'full-time' | 'part-time' | 'contract'

/** Job fields used by the student-facing listing and filter controls. */
export interface StudentJob {
  id: string
  title: string
  company: string
  description: string
  location: string
  workMode: StudentJobWorkMode
  jobType: StudentJobType
  salaryMinLpa: number | null
  salaryMaxLpa: number | null
  experience: string
  skills: string[]
  source: 'LMS job portal (demo)'
}

export interface StudentJobApplication extends TenantOwned {
  id: string
  studentId: string
  jobId: string
  appliedAt: string
  status: 'applied'
}

export interface StudentJobsOverview {
  jobs: StudentJob[]
  applications: StudentJobApplication[]
}

export interface StudentJobsApiClient {
  getOverview(): Promise<StudentJobsOverview>
  apply(jobId: string): Promise<StudentJobApplication>
}

import { ApiError } from '@/services/api/errors'
import type { StudentJobsApiClient } from '@/services/api/student-jobs'
import { DEMO_STUDENT_JOBS } from '../seed/student-jobs'
import { request } from '../core/context'
import { newId } from '../core/util'

function requireStudent(role: string): void {
  if (role !== 'student') {
    throw new ApiError('FORBIDDEN', 'Only students can access job listings and applications.')
  }
}

export const mockStudentJobsApi: StudentJobsApiClient = {
  getOverview: () =>
    request((ctx) => {
      requireStudent(ctx.actor.role)
      return {
        jobs: DEMO_STUDENT_JOBS,
        applications: ctx.db
          .all('studentJobApplications')
          .filter((application) => application.studentId === ctx.actor.id),
      }
    }),

  apply: (jobId) =>
    request((ctx) => {
      requireStudent(ctx.actor.role)
      const job = DEMO_STUDENT_JOBS.find((item) => item.id === jobId)
      if (!job) throw new ApiError('NOT_FOUND', 'This job listing is no longer available.')

      const existing = ctx.db
        .all('studentJobApplications')
        .find((application) => application.studentId === ctx.actor.id && application.jobId === jobId)
      if (existing) throw new ApiError('CONFLICT', 'You have already recorded an application for this job.')

      return ctx.db.insert('studentJobApplications', {
        id: newId('jobapp'),
        studentId: ctx.actor.id,
        jobId,
        appliedAt: ctx.timestamp,
        status: 'applied',
      })
    }),
}

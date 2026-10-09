import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ApiError } from '@/services/api/errors'
import { actAs, setupMock, teardownMock, USERS } from './helpers'

beforeEach(setupMock)
afterEach(teardownMock)

describe('student jobs API', () => {
  it('returns demo listings and records applications for the authenticated student only', async () => {
    actAs('user-student')
    const initial = await api.studentJobs.getOverview()
    expect(initial.jobs.length).toBeGreaterThan(0)
    expect(initial.jobs.every((job) => job.source === 'LMS job portal (demo)')).toBe(true)
    expect(initial.applications).toEqual([])

    const saved = await api.studentJobs.apply(initial.jobs[0].id)
    expect(saved).toMatchObject({ studentId: 'user-student', jobId: initial.jobs[0].id, status: 'applied' })
    expect((await api.studentJobs.getOverview()).applications).toEqual([saved])

    actAs(USERS.arjun, { role: 'student' })
    expect((await api.studentJobs.getOverview()).applications).toEqual([])
  })

  it('rejects duplicate applications and unknown jobs', async () => {
    actAs('user-student')
    await api.studentJobs.apply('demo-react-js-developer')
    await expect(api.studentJobs.apply('demo-react-js-developer')).rejects.toMatchObject({
      code: 'CONFLICT',
    })
    await expect(api.studentJobs.apply('not-a-job')).rejects.toBeInstanceOf(ApiError)
  })

  it('denies job listings and application access to non-students', async () => {
    actAs('user-arjun')
    await expect(api.studentJobs.getOverview()).rejects.toMatchObject({ code: 'FORBIDDEN' })
    await expect(api.studentJobs.apply('demo-react-js-developer')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })
})

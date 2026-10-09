import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { ApiError } from '@/services/api/errors'
import { actAs, setupMock, teardownMock } from './helpers'

beforeEach(setupMock)
afterEach(teardownMock)

describe('student profile API', () => {
  it('returns and updates only the signed-in student profile', async () => {
    actAs('user-student')
    const original = await api.studentProfile.get()
    expect(original.userId).toBe('user-student')
    expect(original.apaarId).toBeNull()

    const saved = await api.studentProfile.update({
      apaarId: '123456789012',
      careerLinks: { github: 'https://github.com/sinan' },
    })

    expect(saved.userId).toBe('user-student')
    expect(saved.apaarId).toBe('123456789012')
    expect(saved.careerLinks.github).toBe('https://github.com/sinan')
    expect(saved.careerLinks.linkedIn).toBeNull()
  })

  it('rejects direct attempts to modify official account fields', async () => {
    actAs('user-student')
    await expect(api.settings.profile.update({ name: 'Changed Student' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
    await expect(api.settings.profile.update({ phone: '+919999999999' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
    await expect(api.studentProfile.update({ studentId: 'forged' } as never)).rejects.toMatchObject({
      code: 'VALIDATION',
    })
  })

  it('validates APAAR IDs and career URLs in the API', async () => {
    actAs('user-student')
    await expect(api.studentProfile.update({ apaarId: 'not-a-number' })).rejects.toMatchObject({
      code: 'VALIDATION',
    })
    await expect(api.studentProfile.update({ careerLinks: { github: 'javascript:alert(1)' } })).rejects.toMatchObject({
      code: 'VALIDATION',
    })
  })

  it('keeps external certificates student-owned and separate from LMS certificates', async () => {
    actAs('user-student')
    const created = await api.studentProfile.addExternalCertificate({
      title: 'Accessibility Foundations',
      issuer: 'Example Institute',
      issueDate: '2026-09-15',
      credentialUrl: 'https://credentials.example.test/abc',
    })
    const certificate = created.externalCertificates[0]
    expect(certificate).toMatchObject({
      title: 'Accessibility Foundations',
      issuer: 'Example Institute',
    })

    const updated = await api.studentProfile.updateExternalCertificate(certificate.id, {
      title: 'Accessible Design Foundations',
    })
    expect(updated.externalCertificates[0].title).toBe('Accessible Design Foundations')

    const deleted = await api.studentProfile.deleteExternalCertificate(certificate.id)
    expect(deleted.externalCertificates).toEqual([])
  })

  it('does not allow non-students to read or change student profile records', async () => {
    actAs('user-arjun')
    await expect(api.studentProfile.get()).rejects.toBeInstanceOf(ApiError)
    await expect(api.studentProfile.update({ apaarId: '123456789012' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })
})

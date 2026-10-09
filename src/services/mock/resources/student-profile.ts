import { ApiError } from '@/services/api/errors'
import type {
  ExternalStudentCertificateInput,
  StudentProfile,
  StudentProfileApiClient,
  StudentProfilePatch,
  StudentProfileView,
} from '@/services/api/student-profile'
import type { RequestContext } from '../core/context'
import { newId } from '../core/util'
import { request } from '../core/context'
import { validationError } from '../core/validate'

function requireStudentRole(role: string): void {
  if (role !== 'student') {
    throw new ApiError('FORBIDDEN', 'Only students can access student profile data.')
  }
}

function getOrCreateProfile(ctx: RequestContext): StudentProfile {
  const existing = ctx.db.find('studentProfiles', ctx.actor.id)
  if (existing) return existing
  return ctx.db.insert('studentProfiles', {
    id: ctx.actor.id,
    userId: ctx.actor.id,
    apaarId: null,
    careerLinks: { github: null, linkedIn: null, portfolio: null },
    externalCertificates: [],
    updatedAt: ctx.timestamp,
  })
}

function presentProfile(ctx: RequestContext, profile: StudentProfile): StudentProfileView {
  const account = ctx.db.get('users', ctx.actor.id, 'User')
  return {
    ...profile,
    account: {
      name: account.name,
      email: account.email,
      phone: account.phone ?? null,
      avatarUrl: account.avatarUrl ?? null,
    },
  }
}

function optionalText(value: string | null | undefined, field: string, label: string, max: number) {
  if (value == null || value.trim() === '') return null
  const normalized = value.trim()
  if (normalized.length > max) throw validationError(field, `${label} must be ${max} characters or fewer.`)
  return normalized
}

function optionalUrl(value: string | null | undefined, field: string, label: string): string | null {
  const normalized = optionalText(value, field, label, 2048)
  if (normalized === null) return null
  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('unsupported protocol')
    return parsed.toString()
  } catch {
    throw validationError(field, `${label} must be a valid HTTP or HTTPS URL.`)
  }
}

function certificateInput(
  input: ExternalStudentCertificateInput,
  fieldPrefix = '',
): ExternalStudentCertificateInput {
  const title = optionalText(input.title, `${fieldPrefix}title`, 'Certificate title', 160)
  const issuer = optionalText(input.issuer, `${fieldPrefix}issuer`, 'Issuing organization', 160)
  if (!title) throw validationError(`${fieldPrefix}title`, 'Enter a certificate title.')
  if (!issuer) throw validationError(`${fieldPrefix}issuer`, 'Enter an issuing organization.')
  const issueDate = optionalText(input.issueDate, `${fieldPrefix}issueDate`, 'Issue date', 10)
  if (issueDate && !/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
    throw validationError(`${fieldPrefix}issueDate`, 'Enter a valid issue date.')
  }
  if (issueDate && Number.isNaN(Date.parse(`${issueDate}T00:00:00.000Z`))) {
    throw validationError(`${fieldPrefix}issueDate`, 'Enter a valid issue date.')
  }
  return {
    title,
    issuer,
    issueDate,
    credentialUrl: optionalUrl(input.credentialUrl, `${fieldPrefix}credentialUrl`, 'Credential URL'),
  }
}

function rejectUnknownKeys(input: object, allowed: readonly string[]) {
  const unknown = Object.keys(input).find((key) => !allowed.includes(key))
  if (unknown) throw validationError(unknown, 'This field cannot be updated from the student profile.')
}

export const mockStudentProfileApi: StudentProfileApiClient = {
  get: () =>
    request((ctx) => {
      requireStudentRole(ctx.actor.role)
      return presentProfile(ctx, getOrCreateProfile(ctx))
    }),

  update: (patch: StudentProfilePatch) =>
    request((ctx) => {
      requireStudentRole(ctx.actor.role)
      rejectUnknownKeys(patch, ['apaarId', 'careerLinks'])
      const profile = getOrCreateProfile(ctx)
      let apaarId = profile.apaarId
      if (patch.apaarId !== undefined) {
        apaarId = optionalText(patch.apaarId, 'apaarId', 'APAAR ID', 12)
        if (apaarId && !/^\d{12}$/.test(apaarId)) {
          throw validationError('apaarId', 'APAAR ID must contain 12 digits.')
        }
      }

      const links = patch.careerLinks
      if (links) rejectUnknownKeys(links, ['github', 'linkedIn', 'portfolio'])
      const careerLinks = {
        github:
          links?.github === undefined
            ? profile.careerLinks.github
            : optionalUrl(links.github, 'careerLinks.github', 'GitHub URL'),
        linkedIn:
          links?.linkedIn === undefined
            ? profile.careerLinks.linkedIn
            : optionalUrl(links.linkedIn, 'careerLinks.linkedIn', 'LinkedIn URL'),
        portfolio:
          links?.portfolio === undefined
            ? profile.careerLinks.portfolio
            : optionalUrl(links.portfolio, 'careerLinks.portfolio', 'Portfolio URL'),
      }

      const saved = ctx.db.save('studentProfiles', {
        ...profile,
        apaarId,
        careerLinks,
        updatedAt: ctx.timestamp,
      })
      return presentProfile(ctx, saved)
    }),

  addExternalCertificate: (input) =>
    request((ctx) => {
      requireStudentRole(ctx.actor.role)
      const profile = getOrCreateProfile(ctx)
      const certificate = {
        ...certificateInput(input),
        id: newId('externalcert'),
      }
      const saved = ctx.db.save('studentProfiles', {
        ...profile,
        externalCertificates: [...profile.externalCertificates, certificate],
        updatedAt: ctx.timestamp,
      })
      return presentProfile(ctx, saved)
    }),

  updateExternalCertificate: (id, patch) =>
    request((ctx) => {
      requireStudentRole(ctx.actor.role)
      rejectUnknownKeys(patch, ['title', 'issuer', 'issueDate', 'credentialUrl'])
      const profile = getOrCreateProfile(ctx)
      const index = profile.externalCertificates.findIndex((certificate) => certificate.id === id)
      if (index < 0) throw new ApiError('NOT_FOUND', 'External certificate not found.')
      const current = profile.externalCertificates[index]
      const next = certificateInput(
        {
          title: patch.title ?? current.title,
          issuer: patch.issuer ?? current.issuer,
          issueDate: patch.issueDate === undefined ? current.issueDate : patch.issueDate,
          credentialUrl:
            patch.credentialUrl === undefined ? current.credentialUrl : patch.credentialUrl,
        },
        'certificate.',
      )
      const externalCertificates = profile.externalCertificates.map((certificate, itemIndex) =>
        itemIndex === index ? { ...certificate, ...next } : certificate,
      )
      const saved = ctx.db.save('studentProfiles', {
        ...profile,
        externalCertificates,
        updatedAt: ctx.timestamp,
      })
      return presentProfile(ctx, saved)
    }),

  deleteExternalCertificate: (id) =>
    request((ctx) => {
      requireStudentRole(ctx.actor.role)
      const profile = getOrCreateProfile(ctx)
      if (!profile.externalCertificates.some((certificate) => certificate.id === id)) {
        throw new ApiError('NOT_FOUND', 'External certificate not found.')
      }
      const saved = ctx.db.save('studentProfiles', {
        ...profile,
        externalCertificates: profile.externalCertificates.filter((certificate) => certificate.id !== id),
        updatedAt: ctx.timestamp,
      })
      return presentProfile(ctx, saved)
    }),
}

import type { TenantOwned } from '@/types'

export interface ExternalStudentCertificate {
  id: string
  title: string
  issuer: string
  issueDate: string | null
  credentialUrl: string | null
}

/** Student-maintained profile data only; official student records are intentionally excluded. */
export interface StudentProfile extends TenantOwned {
  id: string
  userId: string
  apaarId: string | null
  careerLinks: {
    github: string | null
    linkedIn: string | null
    portfolio: string | null
  }
  externalCertificates: ExternalStudentCertificate[]
  updatedAt: string
}

export interface StudentProfileView extends StudentProfile {
  /** Read-only identity fields retrieved for the authenticated account only. */
  account: {
    name: string
    email: string
    phone: string | null
    avatarUrl: string | null
  }
}

export interface StudentProfilePatch {
  apaarId?: string | null
  careerLinks?: Partial<StudentProfile['careerLinks']>
}

export type ExternalStudentCertificateInput = Omit<ExternalStudentCertificate, 'id'>

export interface StudentProfileApiClient {
  /** Returns only the authenticated student's editable profile fields. */
  get(): Promise<StudentProfileView>
  update(patch: StudentProfilePatch): Promise<StudentProfileView>
  addExternalCertificate(input: ExternalStudentCertificateInput): Promise<StudentProfileView>
  updateExternalCertificate(
    id: string,
    patch: Partial<ExternalStudentCertificateInput>,
  ): Promise<StudentProfileView>
  deleteExternalCertificate(id: string): Promise<StudentProfileView>
}

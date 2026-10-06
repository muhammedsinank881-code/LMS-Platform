import type {
  FormStatus,
  FormSubmissionSummary,
  LeadForm,
  LeadFormInput,
  PublicLeadForm,
  PublicSubmitInput,
  PublicSubmitResult,
} from '@/types'

export interface LeadFormsApiClient {
  list(): Promise<LeadForm[]>
  get(id: string): Promise<LeadForm>
  create(input: LeadFormInput): Promise<LeadForm>
  update(id: string, input: LeadFormInput): Promise<LeadForm>
  setStatus(id: string, status: FormStatus): Promise<LeadForm>
  duplicate(id: string): Promise<LeadForm>
  submissions(id: string): Promise<FormSubmissionSummary>
  /** Public, no session: returns only what the page renders. */
  getPublic(id: string): Promise<PublicLeadForm>
  /** Public, no session: rate limited, honeypot protected, runs the ingestion pipeline. */
  submitPublic(id: string, input: PublicSubmitInput): Promise<PublicSubmitResult>
}

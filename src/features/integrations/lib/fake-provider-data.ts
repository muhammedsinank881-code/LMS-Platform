import type { LeadAdsProvider } from '@/types'

export interface FakeForm {
  formId: string
  formName: string
  questions: string[]
}

export interface FakeAccount {
  id: string
  name: string
  forms: FakeForm[]
}

/** What a provider's API would list after sign-in. Nothing here is fetched. */
export const FAKE_ACCOUNTS: Record<LeadAdsProvider, FakeAccount[]> = {
  facebook_lead_ads: [
    {
      id: '102938475610',
      name: 'Acme Home Interiors',
      forms: [
        { formId: 'fb-form-1', formName: 'Diwali offer lead form', questions: ['full_name', 'phone_number', 'email', 'budget'] },
        { formId: 'fb-form-2', formName: 'Free site visit', questions: ['full_name', 'phone_number', 'city', 'Which rooms need work?'] },
      ],
    },
    { id: '102938475611', name: 'Acme Outlet', forms: [{ formId: 'fb-form-3', formName: 'Clearance sale', questions: ['full_name', 'email', 'whatsapp_number'] }] },
  ],
  instagram: [
    { id: '17841400000001', name: '@acme.interiors', forms: [{ formId: 'ig-form-1', formName: 'Story swipe-up form', questions: ['full_name', 'phone_number', 'email'] }] },
  ],
  google_ads: [
    {
      id: '123-456-7890',
      name: 'Acme Search (123-456-7890)',
      forms: [
        { formId: 'gads-form-1', formName: 'Search lead extension', questions: ['FULL_NAME', 'PHONE_NUMBER', 'EMAIL', 'COMPANY_NAME'] },
        { formId: 'gads-form-2', formName: 'Performance Max leads', questions: ['FULL_NAME', 'PHONE_NUMBER', 'POSTAL_CODE'] },
      ],
    },
    { id: '987-654-3210', name: 'Acme Display (987-654-3210)', forms: [{ formId: 'gads-form-3', formName: 'Display lead form', questions: ['FULL_NAME', 'EMAIL'] }] },
  ],
  linkedin: [
    { id: 'urn:li:org:4455', name: 'Acme Pvt Ltd', forms: [{ formId: 'li-form-1', formName: 'B2B demo request', questions: ['First name', 'Last name', 'Work email', 'Company', 'Job title'] }] },
  ],
}

export const TELEPHONY_VENDORS = ['CloudCall', 'Knowlarity-style cloud PBX', 'Generic SIP trunk']

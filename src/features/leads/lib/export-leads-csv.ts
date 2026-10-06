import { downloadCsv, serializeCsv } from '@/lib/csv'
import { formatINR } from '@/lib/format'
import { formatPhone } from '@/lib/phone'
import type { Lead } from '@/types'
import { campaignById, sourceById, statusById, userById, type LeadLookups } from '../types'

const HEADERS = [
  'Lead ID',
  'Name',
  'Company',
  'Phone',
  'Email',
  'Source',
  'Campaign',
  'Status',
  'Score',
  'Assigned to',
  'Budget',
  'Tags',
  'Created',
]

export function exportLeadsCsv(leads: Lead[], lookups: LeadLookups, filename: string): void {
  const rows = leads.map((lead) => [
    lead.id,
    lead.name,
    lead.company,
    formatPhone(lead.phone),
    lead.email,
    sourceById(lookups, lead.sourceId)?.name ?? lead.sourceId,
    campaignById(lookups, lead.campaignId)?.name ?? '',
    statusById(lookups, lead.statusId)?.name ?? lead.statusId,
    lead.score,
    userById(lookups, lead.assignedTo)?.name ?? '',
    lead.budget === null ? '' : formatINR(lead.budget),
    lead.tags.join('; '),
    lead.createdAt,
  ])
  downloadCsv(filename, serializeCsv(HEADERS, rows))
}

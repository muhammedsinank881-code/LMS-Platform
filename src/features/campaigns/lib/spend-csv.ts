import Papa from 'papaparse'
import type { SpendImportRow } from '@/types'

const FIELD_BY_HEADER: Record<string, keyof SpendImportRow> = {
  date: 'date',
  amount: 'amount',
  spend: 'amount',
  'ad set': 'adSet',
  adset: 'adSet',
  ad: 'ad',
  notes: 'notes',
}

/** Header names are matched loosely, so "Ad Set", "adset" and "ad set" all work. */
export function parseSpendCsv(text: string): { rows: SpendImportRow[]; error: string | null } {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  })
  const headers = parsed.meta.fields ?? []
  if (!headers.includes('date') || !(headers.includes('amount') || headers.includes('spend'))) {
    return { rows: [], error: 'The file needs "date" and "amount" columns.' }
  }
  const rows = parsed.data.map((record) => {
    const row: SpendImportRow = { date: '', amount: '' }
    for (const [header, value] of Object.entries(record)) {
      const field = FIELD_BY_HEADER[header]
      if (field) row[field] = (value ?? '').trim()
    }
    return row
  })
  return { rows, error: rows.length === 0 ? 'The file has no rows.' : null }
}

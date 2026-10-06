import type { FieldMapping, LeadDefaults } from '@/types'

const RULES: Array<[RegExp, string]> = [
  [/whats\s*app/i, 'whatsapp'],
  [/e-?mail/i, 'email'],
  [/phone|mobile|contact\s*number|telephone/i, 'phone'],
  [/company|organi[sz]ation|business/i, 'company'],
  [/city|location|town|address|pin\s*code|zip/i, 'location'],
  [/budget|price|spend/i, 'budget'],
  [/product|service|interest/i, 'productInterest'],
  [/message|requirement|comment|enquiry|inquiry|need/i, 'requirement'],
  [/language/i, 'language'],
  [/name/i, 'name'],
]

/** A best-guess lead field for an ad-form question, or '' when nothing fits. */
export function suggestLeadField(question: string): string {
  return RULES.find(([pattern]) => pattern.test(question))?.[1] ?? ''
}

/** A first-pass mapping: each question points at its guess, and each lead field is used once. */
export function suggestMapping(questions: readonly string[]): FieldMapping[] {
  const used = new Set<string>()
  const mapping: FieldMapping[] = []
  for (const question of questions) {
    const leadField = suggestLeadField(question)
    if (leadField && !used.has(leadField)) {
      used.add(leadField)
      mapping.push({ sourceField: question, leadField })
    }
  }
  return mapping
}

export const emptyDefaults = (): LeadDefaults => ({ sourceId: null, campaignId: null, statusId: null, tags: [], assignMode: 'rules', assignUserId: null })

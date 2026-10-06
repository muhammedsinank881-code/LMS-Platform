import { useSearchParams } from 'react-router-dom'

export const LEAD_TABS = [
  'overview',
  'timeline',
  'follow-ups',
  'conversations',
  'deal',
  'qualification',
  'audit',
] as const

export type LeadTab = (typeof LEAD_TABS)[number]

function isLeadTab(value: string | null): value is LeadTab {
  return value !== null && (LEAD_TABS as readonly string[]).includes(value)
}

/** The detail tab, stored in `?tab=`. Overview omits the param. */
export function useLeadTab(): [LeadTab, (tab: LeadTab) => void] {
  const [params, setParams] = useSearchParams()
  const current = params.get('tab')
  const tab = isLeadTab(current) ? current : 'overview'
  const setTab = (next: LeadTab) => {
    setParams(
      (prev) => {
        const copy = new URLSearchParams(prev)
        if (next === 'overview') copy.delete('tab')
        else copy.set('tab', next)
        return copy
      },
      { replace: true },
    )
  }
  return [tab, setTab]
}

export interface LocaleOption {
  value: string
  label: string
}

/** Selectable workspace currencies. INR is the default. */
export const CURRENCY_OPTIONS: LocaleOption[] = [
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'AED', label: 'UAE Dirham (AED)' },
  { value: 'SGD', label: 'Singapore Dollar (S$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
]

export const TIMEZONE_OPTIONS: LocaleOption[] = [
  { value: 'Asia/Kolkata', label: 'India (IST, UTC+05:30)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST, UTC+04:00)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT, UTC+08:00)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Central Europe (CET/CEST)' },
  { value: 'America/New_York', label: 'New York (ET)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
]

export const DEFAULT_CURRENCY_CODE = 'INR'
export const DEFAULT_TIMEZONE = 'Asia/Kolkata'

/** The browser's timezone when we offer it, otherwise the default. */
export function detectTimezone(): string {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
  return TIMEZONE_OPTIONS.some((option) => option.value === detected) ? detected : DEFAULT_TIMEZONE
}

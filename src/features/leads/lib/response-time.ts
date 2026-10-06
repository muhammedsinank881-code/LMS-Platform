/** First-response target until workspace settings expose one. */
export const RESPONSE_TARGET_MINS = 15

export type ResponseTone = 'none' | 'good' | 'warning' | 'late'

export function responseTone(minutes: number | null): ResponseTone {
  if (minutes === null) return 'none'
  if (minutes <= RESPONSE_TARGET_MINS) return 'good'
  if (minutes <= 60) return 'warning'
  return 'late'
}

export const RESPONSE_TONE_CLASS: Record<ResponseTone, string> = {
  none: 'text-muted-foreground',
  good: 'text-success',
  warning: 'text-warning',
  late: 'text-destructive',
}

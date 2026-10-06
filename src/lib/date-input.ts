/** Accepts an ISO timestamp or `YYYY-MM-DD` and returns the date part. */
export function toDateInputValue(value: string): string {
  if (!value) return ''
  return value.length >= 10 ? value.slice(0, 10) : value
}

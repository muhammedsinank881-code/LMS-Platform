/** Text alternative for a sparkline. "Leads over the last 14 days: from 1 to 6, total 42." */
export function sparklineLabel(noun: string, values: readonly number[]): string {
  if (values.length === 0) return `${noun}: no data`
  const total = values.reduce((a, b) => a + b, 0)
  return `${noun} over the last ${values.length} days: from ${values[0]} to ${values[values.length - 1]}, total ${total}`
}

/** Escape one CSV field (RFC 4180): quote when it contains a comma, quote, or newline. */
export function escapeCsvField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  if (!/["\n\r,]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

export function serializeCsvRow(fields: ReadonlyArray<string | number | boolean | null | undefined>): string {
  return fields.map(escapeCsvField).join(',')
}

export function serializeCsv(
  headers: readonly string[],
  rows: ReadonlyArray<ReadonlyArray<string | number | boolean | null | undefined>>,
): string {
  return [serializeCsvRow(headers), ...rows.map(serializeCsvRow)].join('\r\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

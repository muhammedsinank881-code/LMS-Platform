/**
 * Downloads a table as an .xlsx file. The xlsx library is loaded on demand, so it only costs
 * anything when someone exports.
 */
export async function downloadXlsx(
  filename: string,
  headers: readonly string[],
  rows: ReadonlyArray<ReadonlyArray<string | number | null>>,
  sheetName = 'Report',
): Promise<void> {
  const XLSX = await import('xlsx')
  const sheet = XLSX.utils.aoa_to_sheet([[...headers], ...rows.map((row) => [...row])])
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, sheetName.slice(0, 31))
  XLSX.writeFile(book, filename.replace(/\.csv$/i, '') + '.xlsx')
}

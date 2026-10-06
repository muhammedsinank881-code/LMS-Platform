import { useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import type { SpendImportResult, SpendImportRow } from '@/types'
import { parseSpendCsv } from '../../lib/spend-csv'
import { useImportSpend } from '../../hooks/use-spend'

export function SpendImportDialog({
  open,
  campaignId,
  onOpenChange,
}: {
  open: boolean
  campaignId: string
  onOpenChange: (open: boolean) => void
}) {
  const importer = useImportSpend()
  const [rows, setRows] = useState<SpendImportRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SpendImportResult | null>(null)

  const close = (next: boolean) => {
    if (!next) {
      setRows([])
      setError(null)
      setResult(null)
    }
    onOpenChange(next)
  }

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Import spend from CSV</ModalTitle>
          <ModalDescription>Columns: date (yyyy-mm-dd), amount, and optionally ad set, ad and notes.</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div>
            <label htmlFor="spend-csv" className="mb-1 block text-sm font-medium">CSV file</label>
            <input
              id="spend-csv"
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-surface file:px-3 file:py-1.5"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                setResult(null)
                if (!file) return
                const parsed = parseSpendCsv(await file.text())
                setRows(parsed.rows)
                setError(parsed.error)
              }}
            />
          </div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          {rows.length > 0 && !result ? <p className="text-sm">{rows.length} rows ready to import.</p> : null}
          {result ? (
            <div role="status" className="space-y-2 text-sm">
              <p>Imported {result.imported} rows{result.skipped > 0 ? `, skipped ${result.skipped}` : ''}.</p>
              {result.errors.length > 0 ? (
                <ul className="max-h-40 list-disc space-y-1 overflow-y-auto pl-5 text-muted-foreground">
                  {result.errors.map((item) => <li key={`${item.row}-${item.message}`}>Row {item.row}: {item.message}</li>)}
                </ul>
              ) : null}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => close(false)}>{result ? 'Done' : 'Cancel'}</Button>
          {!result ? (
            <Button
              disabled={rows.length === 0}
              loading={importer.isPending}
              onClick={() => importer.mutate({ campaignId, rows }, { onSuccess: setResult })}
            >
              Import {rows.length > 0 ? `${rows.length} rows` : ''}
            </Button>
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

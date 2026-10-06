import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bookmark, Trash2 } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  toast,
} from '@/components/ui'
import { FormField } from '@/components/common/FormField'
import type { ReportTab } from '@/types'
import { useDeleteSavedReport, useSavedReports, useSaveReport } from '../hooks/use-advanced-reports'

/** Saved reports are named snapshots of the report URL: tab, dates, filters and toggles. */
export function SavedReportsMenu({ tab }: { tab: ReportTab }) {
  const navigate = useNavigate()
  const location = useLocation()
  const saved = useSavedReports()
  const save = useSaveReport()
  const remove = useDeleteSavedReport()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | undefined>()

  const submit = () => {
    setError(undefined)
    save.mutate(
      { name, tab, search: location.search },
      {
        onSuccess: () => {
          toast.success('Report saved')
          setOpen(false)
          setName('')
        },
        onError: (e) => setError(e.message),
      },
    )
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button size="sm" variant="outline">
            <Bookmark aria-hidden="true" /> Saved reports
          </Button>
        </DropdownTrigger>
        <DropdownContent align="end" className="w-64">
          {(saved.data ?? []).length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">Nothing saved yet.</p>
          ) : (
            (saved.data ?? []).map((report) => (
              <div key={report.id} className="flex items-center">
                <DropdownItem className="flex-1" onSelect={() => navigate(`/reports?${report.search.replace(/^\?/, '')}`)}>
                  <span className="truncate">{report.name}</span>
                </DropdownItem>
                <Button size="icon-sm" variant="ghost" aria-label={`Delete saved report ${report.name}`} onClick={() => remove.mutate(report.id)}>
                  <Trash2 />
                </Button>
              </div>
            ))
          )}
          <DropdownSeparator />
          <DropdownItem onSelect={() => setOpen(true)}>Save current report…</DropdownItem>
        </DropdownContent>
      </Dropdown>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Save this report</ModalTitle>
            <ModalDescription>Saves the tab, date range, filters and toggles you have set.</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <FormField id="saved-report-name" label="Name" required error={error}>
              {(c) => <Input id={c.id} invalid={c.invalid} aria-describedby={c['aria-describedby']} value={name} onChange={(e) => setName(e.target.value)} />}
            </FormField>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!name.trim()} loading={save.isPending} onClick={submit}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

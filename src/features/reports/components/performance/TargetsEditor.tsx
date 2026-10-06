import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
  toast,
} from '@/components/ui'
import { useDirectory } from '@/features/team/hooks/use-team'
import { useDeleteTarget, useSaveTarget, useTargets } from '../../hooks/use-performance'

const TEAM = 'team'

function Editor({ month, onDone }: { month: string; onDone: () => void }) {
  const directory = useDirectory()
  const existing = useTargets(month)
  const save = useSaveTarget()
  const remove = useDeleteTarget()
  const reps = (directory.data ?? []).filter((u) => u.role === 'salesperson' || u.role === 'team_leader')
  const [who, setWho] = useState(TEAM)
  const current = (existing.data ?? []).find((t) => (who === TEAM ? t.userId === null : t.userId === who))
  const [draft, setDraft] = useState({ revenue: '', dealsWon: '', leadsContacted: '' })
  const [error, setError] = useState<string | undefined>()

  const choose = (value: string) => {
    setWho(value)
    const found = (existing.data ?? []).find((t) => (value === TEAM ? t.userId === null : t.userId === value))
    setDraft({
      revenue: found ? String(found.revenue) : '',
      dealsWon: found ? String(found.dealsWon) : '',
      leadsContacted: found ? String(found.leadsContacted) : '',
    })
  }

  const submit = () => {
    setError(undefined)
    const numbers = { revenue: Number(draft.revenue), dealsWon: Number(draft.dealsWon), leadsContacted: Number(draft.leadsContacted) }
    if (Object.values(numbers).some((n) => !Number.isFinite(n) || n < 0)) {
      setError('Enter zero or more for every target.')
      return
    }
    save.mutate(
      { userId: who === TEAM ? null : who, month, ...numbers },
      { onSuccess: () => toast.success('Target saved'), onError: (e) => setError(e.message) },
    )
  }

  return (
    <>
      <ModalBody className="space-y-4">
        <FormField id="target-who" label="For">
          {(c) => (
            <Select id={c.id} value={who} onValueChange={choose} options={[{ value: TEAM, label: 'Whole team' }, ...reps.map((u) => ({ value: u.id, label: u.name }))]} />
          )}
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="target-revenue" label="Revenue (INR)">
            {(c) => <Input id={c.id} type="number" min={0} value={draft.revenue} onChange={(e) => setDraft({ ...draft, revenue: e.target.value })} />}
          </FormField>
          <FormField id="target-won" label="Deals won">
            {(c) => <Input id={c.id} type="number" min={0} value={draft.dealsWon} onChange={(e) => setDraft({ ...draft, dealsWon: e.target.value })} />}
          </FormField>
          <FormField id="target-contacted" label="Leads contacted">
            {(c) => <Input id={c.id} type="number" min={0} value={draft.leadsContacted} onChange={(e) => setDraft({ ...draft, leadsContacted: e.target.value })} />}
          </FormField>
        </div>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        {current ? (
          <Button size="sm" variant="ghost" onClick={() => remove.mutate(current.id, { onSuccess: () => choose(who) })}>
            <Trash2 aria-hidden="true" /> Remove this target
          </Button>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onDone}>Close</Button>
        <Button loading={save.isPending} onClick={submit}>Save target</Button>
      </ModalFooter>
    </>
  )
}

export function TargetsEditor({ open, month, onOpenChange }: { open: boolean; month: string; onOpenChange: (open: boolean) => void }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Targets for {month}</ModalTitle>
          <ModalDescription>Monthly targets per rep or for the whole team. Saving replaces the existing target.</ModalDescription>
        </ModalHeader>
        {open ? <Editor month={month} onDone={() => onOpenChange(false)} /> : null}
      </ModalContent>
    </Modal>
  )
}

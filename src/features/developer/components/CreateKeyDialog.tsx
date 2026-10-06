import { useState } from 'react'
import { FormField } from '@/components/common/FormField'
import { Button, Input, Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, Textarea } from '@/components/ui'
import { createApiKeySchema, type ApiScope } from '@/types'
import { useCreateApiKey } from '../hooks/use-api-keys'
import { ScopePicker } from './ScopePicker'

/** Asks for a name, scopes, an optional expiry and IP allowlist. The secret goes straight to `onCreated`. */
export function CreateKeyDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: (secret: string) => void }) {
  const create = useCreateApiKey()
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<ApiScope[]>([])
  const [expires, setExpires] = useState('')
  const [ips, setIps] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function reset() {
    setName('')
    setScopes([])
    setExpires('')
    setIps('')
    setErrors({})
    create.reset()
  }

  function submit() {
    const input = {
      name,
      scopes,
      expiresAt: expires ? new Date(`${expires}T23:59:59`).toISOString() : null,
      ipAllowlist: ips.split(/[\s,]+/).filter(Boolean),
    }
    const parsed = createApiKeySchema.safeParse(input)
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])))
      return
    }
    setErrors({})
    create.mutate(parsed.data as Parameters<typeof create.mutate>[0], {
      onSuccess: ({ secret }) => {
        onCreated(secret)
        reset()
        onOpenChange(false)
      },
    })
  }

  return (
    <Modal open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Create an API key</ModalTitle>
          <ModalDescription>Give it only the access the integration needs. You will see the full key once.</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <FormField id="key-name" label="Name" required error={errors.name} hint="Where it is used, such as “Zapier” or “Data warehouse”.">
            {(control) => <Input {...control} value={name} onChange={(event) => setName(event.target.value)} />}
          </FormField>
          <ScopePicker value={scopes} onChange={setScopes} error={errors.scopes} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="key-expiry" label="Expires" hint="Optional." error={errors.expiresAt}>
              {(control) => <Input {...control} type="date" value={expires} onChange={(event) => setExpires(event.target.value)} />}
            </FormField>
          </div>
          <FormField id="key-ips" label="IP allowlist" hint="Optional. One IPv4 address or CIDR range per line. Empty allows any address." error={errors.ipAllowlist}>
            {(control) => <Textarea {...control} rows={2} className="font-mono" value={ips} onChange={(event) => setIps(event.target.value)} />}
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button loading={create.isPending} onClick={submit}>Create key</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

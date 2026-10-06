import { useState } from 'react'
import { Button, toast } from '@/components/ui'
import { useTestCall, useUpdateIntegration } from '../../hooks/use-integrations'
import { TelephonyFields, type TelephonyConfig } from '../TelephonyFields'
import type { SettingsPanelProps } from './types'

/** Agent extensions and call options, with a simulated test call. */
export function TelephonySettings({ integration }: SettingsPanelProps) {
  const saved = integration.config as TelephonyConfig
  const update = useUpdateIntegration('telephony')
  const call = useTestCall()
  const [draft, setDraft] = useState(saved)
  const broken = integration.status !== 'connected'
  return (
    <div className="space-y-5">
      <TelephonyFields value={draft} onChange={setDraft} />
      <div className="flex flex-wrap gap-2">
        <Button loading={update.isPending} disabled={broken || JSON.stringify(draft) === JSON.stringify(saved) || !draft.vendor} onClick={() => update.mutate({ config: draft }, { onSuccess: () => toast.success('Telephony settings saved') })}>Save changes</Button>
        <Button variant="outline" disabled={broken} loading={call.isPending} onClick={() => call.mutate(undefined, { onSuccess: () => toast.success('Test call logged in the Inbox') })}>Run a test call</Button>
      </div>
    </div>
  )
}

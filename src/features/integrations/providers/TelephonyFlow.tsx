import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { Button, toast } from '@/components/ui'
import { FlowShell } from '../components/FlowShell'
import { TelephonyFields, type TelephonyConfig } from '../components/TelephonyFields'
import { useConnectIntegration, useTestCall } from '../hooks/use-integrations'
import type { ConnectFlowProps } from './types'

const STEPS = [
  { id: 'setup', label: 'Setup' },
  { id: 'test', label: 'Test' },
]

/** Cloud telephony: choose a provider, map agents to extensions, set the options, then log a simulated test call. */
export function TelephonyFlow({ onDone, onCancel }: ConnectFlowProps) {
  const connect = useConnectIntegration()
  const call = useTestCall()
  const [config, setConfig] = useState<TelephonyConfig>({ provider: 'telephony', vendor: '', clickToCall: true, syncCallLogs: true, extensions: [] })
  const [connected, setConnected] = useState(false)
  const [logged, setLogged] = useState(false)

  if (connected) {
    return (
      <FlowShell steps={STEPS} current={1} hideNext onNext={onDone} onBack={() => undefined} onCancel={onDone}>
        <div className="space-y-4 text-center">
          <div role="status"><CircleCheck aria-hidden="true" className="mx-auto h-10 w-10 text-success" /><p className="font-medium">{config.vendor} is connected</p></div>
          <p className="text-sm text-muted-foreground">Place a simulated call to see it appear in the Inbox call log.</p>
          {logged ? <p role="status" className="text-sm text-success">Test call logged.</p> : null}
          <div className="flex justify-center gap-2">
            <Button variant="outline" loading={call.isPending} onClick={() => call.mutate(undefined, { onSuccess: () => { setLogged(true); toast.success('Test call logged') } })}>Run a test call</Button>
            <Button onClick={onDone}>Done</Button>
          </div>
        </div>
      </FlowShell>
    )
  }

  return (
    <FlowShell steps={STEPS} current={0} canNext={Boolean(config.vendor)} nextLabel="Connect telephony" loading={connect.isPending} onCancel={onCancel} onBack={() => undefined} onNext={() => connect.mutate({ provider: 'telephony', accountLabel: config.vendor, config }, { onSuccess: () => setConnected(true) })}>
      <TelephonyFields value={config} onChange={setConfig} />
    </FlowShell>
  )
}

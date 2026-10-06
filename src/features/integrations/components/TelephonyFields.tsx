import { FormField } from '@/components/common/FormField'
import { Input, Select, Switch } from '@/components/ui'
import { useDirectory } from '@/features/team/hooks/use-team'
import type { IntegrationConfig } from '@/types'
import { TELEPHONY_VENDORS } from '../lib/fake-provider-data'

export type TelephonyConfig = Extract<IntegrationConfig, { provider: 'telephony' }>

/** Vendor, click-to-call, call log sync and which extension each agent dials from. */
export function TelephonyFields({ value, onChange }: { value: TelephonyConfig; onChange: (next: TelephonyConfig) => void }) {
  const directory = useDirectory()
  const agents = (directory.data ?? []).filter((user) => user.status === 'active')
  const extensionOf = (userId: string) => value.extensions.find((item) => item.userId === userId)?.extension ?? ''
  const setExtension = (userId: string, extension: string) =>
    onChange({ ...value, extensions: [...value.extensions.filter((item) => item.userId !== userId), ...(extension ? [{ userId, extension }] : [])] })

  return (
    <div className="space-y-5">
      <FormField id="tel-vendor" label="Provider" required>
        {(control) => <Select {...control} value={value.vendor || undefined} placeholder="Choose a provider" onValueChange={(vendor) => onChange({ ...value, vendor })} options={TELEPHONY_VENDORS.map((vendor) => ({ value: vendor, label: vendor }))} />}
      </FormField>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3"><label htmlFor="tel-click" className="text-sm">Click-to-call on leads</label><Switch id="tel-click" checked={value.clickToCall} onCheckedChange={(clickToCall) => onChange({ ...value, clickToCall })} /></div>
        <div className="flex items-center justify-between gap-3"><label htmlFor="tel-sync" className="text-sm">Sync call logs automatically</label><Switch id="tel-sync" checked={value.syncCallLogs} onCheckedChange={(syncCallLogs) => onChange({ ...value, syncCallLogs })} /></div>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Agent extensions</legend>
        <ul className="space-y-2">
          {agents.map((agent) => (
            <li key={agent.id} className="grid items-center gap-2 sm:grid-cols-[1fr_8rem]">
              <span className="truncate text-sm">{agent.name}</span>
              <Input aria-label={`Extension for ${agent.name}`} inputMode="numeric" placeholder="e.g. 101" value={extensionOf(agent.id)} onChange={(event) => setExtension(agent.id, event.target.value.replace(/\D/g, ''))} />
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  )
}

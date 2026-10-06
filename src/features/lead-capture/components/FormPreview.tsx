import { useState } from 'react'
import { Monitor, Smartphone, Tablet, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { LeadFormInput } from '@/types'
import { FormRenderer } from './FormRenderer'

type Device = 'mobile' | 'tablet' | 'desktop'

const DEVICES: Array<{ id: Device; label: string; icon: LucideIcon; width: string }> = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: 'max-w-[22rem]' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: 'max-w-[32rem]' },
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: 'max-w-[40rem]' },
]

/** A live, responsive preview. It reuses the public renderer, so it is the form as visitors see it. */
export function FormPreview({ draft }: { draft: LeadFormInput }) {
  const [device, setDevice] = useState<Device>('mobile')
  const [values, setValues] = useState<Record<string, string>>({})
  const [consent, setConsent] = useState(false)
  const width = DEVICES.find((item) => item.id === device)?.width ?? ''
  const dark = draft.style.theme === 'dark'

  return (
    <section aria-label="Live preview" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Preview</h3>
        <div role="group" aria-label="Preview size" className="flex gap-1">
          {DEVICES.map((item) => (
            <Button key={item.id} size="icon-sm" variant={device === item.id ? 'secondary' : 'ghost'} aria-label={item.label} aria-pressed={device === item.id} onClick={() => setDevice(item.id)}>
              <item.icon />
            </Button>
          ))}
        </div>
      </div>
      <div className={cn('rounded-lg border border-border p-3 sm:p-6', dark ? 'bg-gray-800' : 'bg-muted')}>
        <div className={cn('mx-auto w-full overflow-hidden border border-border shadow-sm', draft.style.rounded ? 'rounded-xl' : 'rounded-none', width)}>
          <FormRenderer
            preview
            form={draft}
            values={values}
            errors={{}}
            consent={consent}
            onValue={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
            onConsent={setConsent}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">The preview does not submit. Publish the form to try it for real.</p>
    </section>
  )
}

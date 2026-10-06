import { ExternalLink, QrCode } from 'lucide-react'
import { CopyField } from '@/components/common/CopyField'
import { Badge, Button } from '@/components/ui'
import type { LeadForm } from '@/types'
import { embedSnippets } from '../lib/form-draft'

/** How to put a saved form in front of visitors: hosted link, iframe, script and a QR placeholder. */
export function PublishPanel({ form }: { form: LeadForm | null }) {
  if (!form) {
    return <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">Save the form first. Then its link and embed code appear here.</p>
  }
  const snippets = embedSnippets(window.location.origin, form.id, form.name)
  return (
    <div className="space-y-6">
      {form.status !== 'active' ? (
        <p role="status" className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
          This form is <strong>{form.status}</strong>. Visitors see “not available” until you enable it.
        </p>
      ) : null}
      <div className="space-y-2">
        <CopyField label="Hosted link" value={snippets.link} hint="A standalone page. No sign-in, no app chrome." />
        <Button asChild size="sm" variant="outline">
          <a href={snippets.link} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" /> Open the page
          </a>
        </Button>
      </div>
      <CopyField label="Embed with an iframe" value={snippets.iframe} multiline />
      <CopyField label="Embed with a script" value={snippets.script} multiline hint="Passes the page's utm_* parameters through to the form." />
      <div className="flex items-center gap-4 rounded-md border border-border p-4">
        <div aria-hidden="true" className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
          <QrCode className="h-10 w-10" />
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-medium">QR code <Badge size="sm">Placeholder</Badge></p>
          <p className="text-muted-foreground">A scannable code for printed material is generated once the backend is connected.</p>
        </div>
      </div>
    </div>
  )
}

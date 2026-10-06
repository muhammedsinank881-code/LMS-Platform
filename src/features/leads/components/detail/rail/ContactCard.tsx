import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, toast } from '@/components/ui'
import { formatPhone } from '@/lib/phone'
import { EMPTY_VALUE } from '@/lib/format/shared'
import type { Lead } from '@/types'
import { mailtoHref, telHref, whatsappHref } from '../../../lib/contact-links'

export function ContactCard({ lead }: { lead: Lead }) {
  const phone = formatPhone(lead.phone) || EMPTY_VALUE
  const whatsapp = formatPhone(lead.whatsapp) || EMPTY_VALUE
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <ContactRow label="Phone" value={phone} href={telHref(lead.phone)} copyValue={lead.phone} />
        <ContactRow label="WhatsApp" value={whatsapp} href={whatsappHref(lead.whatsapp)} copyValue={lead.whatsapp} />
        <ContactRow label="Email" value={lead.email} href={mailtoHref(lead.email)} copyValue={lead.email} />
        <div>
          <p className="text-xs text-muted-foreground">Location</p>
          <p>{lead.location || EMPTY_VALUE}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ContactRow({
  label,
  value,
  href,
  copyValue,
}: {
  label: string
  value: string | null | undefined
  href: string | null
  copyValue: string | null | undefined
}) {
  const shown = value || EMPTY_VALUE
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a className="truncate font-medium text-primary hover:underline" href={href}>
            {shown}
          </a>
        ) : (
          <p className="truncate">{shown}</p>
        )}
      </div>
      {copyValue ? <CopyButton value={copyValue} label={label} /> : null}
    </div>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Copy ${label}`}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          toast.success('Copied')
          window.setTimeout(() => setCopied(false), 1500)
        })
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

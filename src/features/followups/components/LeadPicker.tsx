import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { Button, Input, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'

export interface LeadPickerProps {
  id?: string
  value: string
  onChange: (leadId: string, label: string) => void
  locked?: boolean
  lockedLabel?: string
  invalid?: boolean
  'aria-describedby'?: string
}

export function LeadPicker({
  id,
  value,
  onChange,
  locked,
  lockedLabel,
  invalid,
  'aria-describedby': describedBy,
}: LeadPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [label, setLabel] = useState(lockedLabel ?? '')
  const debounced = useDebouncedValue(query, 300)
  const leads = useLeads({ search: debounced || undefined, pageSize: 8 })

  if (locked) {
    return (
      <Input id={id} value={lockedLabel || label || value} readOnly aria-describedby={describedBy} />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        >
          {label || 'Search leads'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <Input
          value={query}
          placeholder="Name, phone, or company"
          aria-label="Search leads"
          onChange={(event) => setQuery(event.target.value)}
        />
        <ul className="mt-2 max-h-56 overflow-y-auto" role="listbox" aria-label="Matching leads">
          {leads.isLoading ? <li className="px-2 py-2 text-sm text-muted-foreground">Searching…</li> : null}
          {leads.data?.items.map((lead) => (
            <li key={lead.id}>
              <button
                type="button"
                role="option"
                aria-selected={lead.id === value}
                className="flex w-full flex-col rounded-md px-2 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  setLabel(lead.name)
                  onChange(lead.id, lead.name)
                  setOpen(false)
                }}
              >
                <span className="font-medium">{lead.name}</span>
                <span className="text-xs text-muted-foreground">{lead.company ?? lead.phone ?? lead.id}</span>
              </button>
            </li>
          ))}
          {!leads.isLoading && (leads.data?.items.length ?? 0) === 0 ? (
            <li className="px-2 py-2 text-sm text-muted-foreground">No matching leads</li>
          ) : null}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

import { useState } from 'react'
import { UserPlus, UserSearch } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { Avatar, Button, Input, Skeleton } from '@/components/ui'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { usePermission } from '@/hooks/use-permission'
import { formatPhone } from '@/lib/phone'
import type { Conversation } from '@/types'
import { useCreateLeadFromConversation, useLinkConversation } from '../hooks/use-conversations'

/** Shown for a number or address that matches no lead: create one, or link to an existing one. */
export function UnlinkedLeadCard({ conversation }: { conversation: Conversation }) {
  const create = useCreateLeadFromConversation()
  const link = useLinkConversation()
  const { can } = usePermission()
  const [name, setName] = useState(conversation.contactName ?? '')
  const [search, setSearch] = useState('')
  const leads = useLeads({ search: search || undefined, pageSize: 6 })
  const contact = conversation.contactPhone ? formatPhone(conversation.contactPhone) : (conversation.contactEmail ?? 'Unknown contact')
  return (
    <div className="space-y-5 p-4">
      <div className="space-y-1 rounded-lg border border-dashed border-warning/60 bg-warning/10 p-3">
        <p className="text-sm font-semibold">No lead linked</p>
        <p className="text-xs text-muted-foreground">
          {contact} doesn&apos;t match any lead. Create one or link this conversation to an existing lead.
        </p>
      </div>

      <section className="space-y-2" aria-label="Create lead">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <UserPlus className="h-4 w-4" aria-hidden="true" /> Create lead
        </h3>
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">
          Name
          <Input aria-label="Lead name" placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <p className="text-xs text-muted-foreground">{contact} is filled in from the conversation.</p>
        <Button
          type="button"
          size="sm"
          className="w-full"
          disabled={!can('leads', 'create')}
          loading={create.isPending}
          onClick={() => create.mutate({ id: conversation.id, input: { name: name || undefined } })}
        >
          Create lead
        </Button>
      </section>

      <section className="space-y-2" aria-label="Link to existing lead">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <UserSearch className="h-4 w-4" aria-hidden="true" /> Link to existing lead
        </h3>
        <SearchInput onValueChange={setSearch} placeholder="Search by name, phone or email" aria-label="Search leads" />
        {leads.isLoading ? <Skeleton className="h-24 w-full" /> : null}
        {!leads.isLoading && (leads.data?.items ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads match that search.</p>
        ) : null}
        <ul className="divide-y divide-border rounded-md border border-border">
          {(leads.data?.items ?? []).map((lead) => (
            <li key={lead.id}>
              <button
                type="button"
                disabled={link.isPending}
                onClick={() => link.mutate({ id: conversation.id, leadId: lead.id })}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:opacity-60"
              >
                <Avatar name={lead.name} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{lead.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{lead.phone ? formatPhone(lead.phone) : (lead.email ?? lead.company ?? '')}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

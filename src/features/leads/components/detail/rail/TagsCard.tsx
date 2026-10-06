import { useState } from 'react'
import { X } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import type { Lead } from '@/types'
import { useAddLeadTags, useRemoveLeadTags } from '../../../hooks/use-lead-mutations'
import type { LeadLookups } from '../../../types'

export function TagsCard({ lead, lookups, canEdit }: { lead: Lead; lookups: LeadLookups; canEdit: boolean }) {
  const [draft, setDraft] = useState('')
  const add = useAddLeadTags()
  const remove = useRemoveLeadTags()
  const query = draft.trim().toLowerCase()
  const suggestions = lookups.tags
    .map((tag) => tag.name)
    .filter((name) => !lead.tags.includes(name) && (!query || name.toLowerCase().includes(query)))
    .slice(0, 6)

  const addTag = (name: string) => {
    const cleaned = name.trim()
    if (!cleaned || lead.tags.includes(cleaned)) return
    add.mutate({ ids: [lead.id], tags: [cleaned] })
    setDraft('')
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {lead.tags.length === 0 ? <p className="text-sm text-muted-foreground">No tags</p> : null}
          {lead.tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
              {canEdit ? (
                <button type="button" className="ml-1" aria-label={`Remove ${tag}`} onClick={() => remove.mutate({ ids: [lead.id], tags: [tag] })}>
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </Badge>
          ))}
        </div>
        {canEdit ? (
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault()
              addTag(draft)
            }}
          >
            <Input aria-label="Add a tag" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a tag" />
            {query ? (
              <ul className="space-y-1">
                {suggestions.map((name) => (
                  <li key={name}>
                    <Button type="button" variant="ghost" size="sm" onClick={() => addTag(name)}>
                      {name}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}

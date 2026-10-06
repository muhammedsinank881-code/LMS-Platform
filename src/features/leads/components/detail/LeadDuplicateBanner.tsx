import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { DuplicateMatch } from '@/types'
import { readLeadListSearch } from '../../lib/list-return'

export function LeadDuplicateBanner({
  matches,
  onCompare,
}: {
  matches: DuplicateMatch[]
  onCompare: (leadId: string) => void
}) {
  const location = useLocation()
  const listSearch = readLeadListSearch(location.state)
  if (matches.length === 0) return null
  return (
    <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3" role="status">
      <p className="text-sm font-medium text-foreground">Possible duplicate lead found</p>
      <ul className="mt-2 space-y-2">
        {matches.map((match) => (
          <li key={match.lead.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              <Link
                to={`/leads/${match.lead.id}`}
                state={{ listSearch }}
                className="font-medium text-primary hover:underline"
              >
                {match.lead.name}
              </Link>
              <span className="text-muted-foreground">
                {' '}
                · {match.lead.id} · {match.matchedOn.join(', ')}
              </span>
            </span>
            <Button type="button" size="sm" variant="outline" onClick={() => onCompare(match.lead.id)}>
              Compare
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

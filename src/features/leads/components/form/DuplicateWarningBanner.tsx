import { Link } from 'react-router-dom'
import { FormAlert } from '@/components/common/FormField'
import { Button, Tooltip } from '@/components/ui'
import type { DuplicateMatch } from '@/types'

export function DuplicateWarningBanner({ matches }: { matches: DuplicateMatch[] }) {
  if (matches.length === 0) return null
  return (
    <FormAlert title="Possible duplicate lead found">
      <ul className="mt-1 space-y-1">
        {matches.map((match) => (
          <li key={match.lead.id}>
            <Link className="font-medium text-primary hover:underline" to={`/leads/${match.lead.id}`}>
              {match.lead.name}
            </Link>
            <span className="text-muted-foreground">
              {' '}
              · {match.lead.id} · matched on {match.matchedOn.join(', ')}
            </span>
          </li>
        ))}
      </ul>
      <Tooltip content="Coming in Step 6">
        <span className="mt-2 inline-block">
          <Button size="sm" variant="outline" disabled>
            Review and merge
          </Button>
        </span>
      </Tooltip>
    </FormAlert>
  )
}

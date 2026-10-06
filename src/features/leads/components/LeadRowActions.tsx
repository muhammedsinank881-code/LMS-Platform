import { MoreHorizontal } from 'lucide-react'
import { LeadDetailLink } from './LeadDetailLink'
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import type { Lead, LeadId } from '@/types'

export interface LeadRowActionsProps {
  lead: Lead
  onEdit: (id: LeadId) => void
  onAssign: (id: LeadId) => void
  onChangeStatus: (id: LeadId) => void
  onDelete: (id: LeadId) => void
  onFollowUp: (id: LeadId) => void
}

export function LeadRowActions({
  lead,
  onEdit,
  onAssign,
  onChangeStatus,
  onDelete,
  onFollowUp,
}: LeadRowActionsProps) {
  const { can } = usePermission()
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${lead.name}`}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownTrigger>
        <DropdownContent align="end">
          <DropdownItem asChild>
            <LeadDetailLink id={lead.id}>View</LeadDetailLink>
          </DropdownItem>
          <DropdownItem disabled={!can('leads', 'edit')} onSelect={() => onEdit(lead.id)}>
            Edit
          </DropdownItem>
          <DropdownItem disabled={!can('leads', 'assign')} onSelect={() => onAssign(lead.id)}>
            Assign
          </DropdownItem>
          <DropdownItem disabled={!can('leads', 'edit')} onSelect={() => onChangeStatus(lead.id)}>
            Change status
          </DropdownItem>
          <DropdownItem disabled={!can('followups', 'create')} onSelect={() => onFollowUp(lead.id)}>
            Schedule follow-up
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            destructive
            disabled={!can('leads', 'delete')}
            onSelect={() => onDelete(lead.id)}
          >
            Delete
          </DropdownItem>
        </DropdownContent>
    </Dropdown>
  )
}

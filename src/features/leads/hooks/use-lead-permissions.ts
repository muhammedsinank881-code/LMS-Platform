import { usePermission } from '@/hooks/use-permission'
import { useAuthStore } from '@/store/auth-store'
import type { Lead } from '@/types'

export interface LeadPermissions {
  userId: string | null
  /** A salesperson viewing a lead they do not own. */
  readOnly: boolean
  canEdit: boolean
  canAssign: boolean
  canDelete: boolean
  canConvert: boolean
  canMerge: boolean
}

export function useLeadPermissions(lead: Lead): LeadPermissions {
  const { can, role } = usePermission()
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const readOnly = role === 'salesperson' && lead.assignedTo !== userId
  const canEdit = can('leads', 'edit') && !readOnly
  return {
    userId,
    readOnly,
    canEdit,
    canAssign: can('leads', 'assign') && !readOnly,
    canDelete: can('leads', 'delete') && !readOnly,
    canConvert: can('customers', 'create') && canEdit && !lead.convertedToCustomerId,
    canMerge: canEdit,
  }
}

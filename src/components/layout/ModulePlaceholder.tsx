import { ShieldOff } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { RoleGate } from '@/components/common/RoleGate'
import type { Resource } from '@/types'
import { getNavItem } from './nav-config'
import { PageHeader } from './PageHeader'

export interface ModulePlaceholderProps {
  resource: Resource
}

/** Stand-in for a module page until its step ships. Also enforces `view` permission. */
export function ModulePlaceholder({ resource }: ModulePlaceholderProps) {
  const { label, description, icon } = getNavItem(resource)
  return (
    <RoleGate
      resource={resource}
      fallback={
        <EmptyState
          icon={ShieldOff}
          title="You don't have access to this page"
          description="Ask a workspace admin if you need access to this module."
        />
      }
    >
      <PageHeader title={label} description={description} />
      <div className="rounded-md border border-dashed border-border bg-surface">
        <EmptyState
          icon={icon}
          title={`${label} is coming soon`}
          description="This module is built in a later step. The navigation, permissions and layout around it are ready."
        />
      </div>
    </RoleGate>
  )
}

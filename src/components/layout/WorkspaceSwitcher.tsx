import { ChevronsUpDown } from 'lucide-react'
import {
  Avatar,
  Dropdown,
  DropdownContent,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownTrigger,
  toast,
} from '@/components/ui'
import { cn } from '@/lib/cn'
import { useSwitchTenant } from '@/features/auth'
import { getErrorMessage } from '@/services/api'
import { useAuthStore } from '@/store/auth-store'

export interface WorkspaceSwitcherProps {
  collapsed?: boolean
}

export function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
  const tenant = useAuthStore((state) => state.tenant)
  const tenants = useAuthStore((state) => state.tenants)
  const switchTenant = useSwitchTenant()

  if (!tenant) return null

  const handleChange = (tenantId: string) => {
    if (tenantId === tenant.id) return
    switchTenant.mutate(tenantId, {
      onSuccess: (session) => toast.success(`Switched to ${session.tenant.name}`),
      onError: (error) =>
        toast.error('Could not switch workspace', { description: getErrorMessage(error) }),
    })
  }

  return (
    <Dropdown>
      <DropdownTrigger
        disabled={switchTenant.isPending}
        aria-label={`Workspace: ${tenant.name}. Switch workspace`}
        className={cn(
          'flex w-full items-center gap-3 rounded-md border border-border bg-surface p-2 text-left transition-colors hover:bg-muted disabled:opacity-60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          collapsed && 'justify-center border-transparent p-1',
        )}
      >
        <Avatar name={tenant.name} shape="square" size="sm" />
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {tenant.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {switchTenant.isPending ? 'Switching…' : 'Workspace'}
              </span>
            </span>
            <ChevronsUpDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownTrigger>
      <DropdownContent align="start" side={collapsed ? 'right' : 'bottom'} className="w-64">
        <DropdownLabel>Workspaces</DropdownLabel>
        <DropdownRadioGroup value={tenant.id} onValueChange={handleChange}>
          {tenants.map((item) => (
            <DropdownRadioItem key={item.id} value={item.id}>
              <Avatar name={item.name} shape="square" size="xs" />
              <span className="truncate">{item.name}</span>
            </DropdownRadioItem>
          ))}
        </DropdownRadioGroup>
      </DropdownContent>
    </Dropdown>
  )
}

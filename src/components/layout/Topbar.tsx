import { useNavigate } from 'react-router-dom'
import { Menu, Plus, Search } from 'lucide-react'
import { Button, Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { getModifierKeyLabel } from '@/lib/platform'
import { useAuthStore } from '@/store/auth-store'
import { useUiStore } from '@/store/ui-store'
import { BrandMark } from './BrandMark'
import { NotificationBell } from './NotificationBell'
import { UserMenu } from './UserMenu'

export interface TopbarProps {
  onOpenNav: () => void
}

export function Topbar({ onOpenNav }: TopbarProps) {
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen)
  const openFollowUp = useUiStore((state) => state.openFollowUp)
  const userRole = useAuthStore((state) => state.user?.role)
  const { can } = usePermission()
  const navigate = useNavigate()
  const shortcut = `${getModifierKeyLabel()} K`

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 print:hidden lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenNav}
        aria-label="Open navigation"
      >
        <Menu aria-hidden="true" />
      </Button>
      <BrandMark iconOnly className="lg:hidden" />

      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        aria-label="Search or jump to a page"
        className="flex h-10 items-center gap-2 rounded-md border border-input bg-surface px-3 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface max-sm:hidden lg:w-80"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-sans text-xs">
          {shortcut}
        </kbd>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Search"
        >
          <Search aria-hidden="true" />
        </Button>
        {userRole === 'mentor' ? (
          <Dropdown>
            <DropdownTrigger asChild>
              <Button aria-label="Add">
                <Plus aria-hidden="true" />
                <span className="max-sm:hidden">Add</span>
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownItem onSelect={() => navigate('/mentor/classes')}>Add class</DropdownItem>
              <DropdownItem onSelect={() => navigate('/mentor/assignments')}>Create assignment</DropdownItem>
              <DropdownItem onSelect={() => navigate('/mentor/exams')}>Create exam</DropdownItem>
            </DropdownContent>
          </Dropdown>
        ) : can('leads', 'create') || can('followups', 'create') ? (
          <Dropdown>
            <DropdownTrigger asChild>
              <Button aria-label="Add">
                <Plus aria-hidden="true" />
                <span className="max-sm:hidden">Add</span>
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end">
              {can('leads', 'create') ? (
                <DropdownItem onSelect={() => navigate('/leads?compose=lead')}>Add lead</DropdownItem>
              ) : null}
              {can('followups', 'create') ? (
                <DropdownItem onSelect={() => openFollowUp()}>Schedule follow-up</DropdownItem>
              ) : null}
            </DropdownContent>
          </Dropdown>
        ) : null}
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}

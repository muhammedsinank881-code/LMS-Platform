import { LogOut, Settings, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Avatar,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui'
import { useLogout } from '@/features/auth'
import { ROLE_LABELS } from '@/lib/permissions'
import { useAuthStore } from '@/store/auth-store'

export function UserMenu() {
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()

  if (!user) return null

  return (
    <Dropdown>
      <DropdownTrigger
        aria-label={`Account menu for ${user.name}`}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-8 sm:w-8"
      >
        <Avatar name={user.name} src={user.avatarUrl} size="sm" />
      </DropdownTrigger>
      <DropdownContent align="end" className="w-60">
        <DropdownLabel className="space-y-0.5 py-2">
          <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
          <span className="block truncate text-xs font-normal">{user.email}</span>
          <span className="block text-xs font-normal">{ROLE_LABELS[user.role]}</span>
        </DropdownLabel>
        <DropdownSeparator />
        <DropdownItem asChild>
          <Link to={user.role === 'student' ? '/student/profile' : '/settings'}>
            <UserRound aria-hidden="true" />
            Profile
          </Link>
        </DropdownItem>
        {user.role === 'student' ? null : (
          <DropdownItem asChild>
            <Link to="/settings">
              <Settings aria-hidden="true" />
              Settings
            </Link>
          </DropdownItem>
        )}
        <DropdownSeparator />
        <DropdownItem destructive onSelect={logout}>
          <LogOut aria-hidden="true" />
          Log out
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}

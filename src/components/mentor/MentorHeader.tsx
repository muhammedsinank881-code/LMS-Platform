import { Bell, Menu, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserMenu } from '@/components/layout/UserMenu'
import { useAuthStore } from '@/store/auth-store'

interface MentorHeaderProps {
  onOpenMobileNav: () => void
}

export function MentorHeader({ onOpenMobileNav }: MentorHeaderProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/95 backdrop-blur-sm px-4 sm:px-6">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span>Mentor Portal</span>
          <span>/</span>
          <span className="font-semibold text-foreground">
            {user?.name || 'Ms. Husna'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Search Shortcut */}
        <button
          type="button"
          onClick={() => navigate('/mentor/students')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border"
        >
          <Search className="size-3.5" />
          <span>Search portal...</span>
        </button>

        {/* Notifications Icon */}
        <button
          type="button"
          onClick={() => navigate('/mentor/notifications')}
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
        </button>

        {/* User Profile Menu */}
        <UserMenu />
      </div>
    </header>
  )
}

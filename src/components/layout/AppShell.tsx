import { useState } from 'react'
import { Outlet, useNavigation } from 'react-router-dom'
import { CommandPalette } from '@/components/common/CommandPalette'
import { FollowUpComposer } from '@/features/followups/components/FollowUpComposer'
import { useReminderChecker } from '@/features/followups/hooks/use-reminder-checker'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, ProgressBar } from '@/components/ui'
import { useCommandPaletteShortcut } from '@/hooks/use-command-palette-shortcut'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/store/ui-store'
import { MobileTabBar } from './MobileTabBar'
import { OfflineBanner } from './OfflineBanner'
import { SimulatorFab } from '@/features/dev/components/SimulatorFab'
import { PwaPrompts } from '@/components/pwa/PwaPrompts'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useHideMobileTabs, useKeepFieldVisible } from './use-mobile-tabs'

export function AppShell() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const navigation = useNavigation()
  const hideTabs = useHideMobileTabs()
  useCommandPaletteShortcut()
  useReminderChecker()
  useKeepFieldVisible()

  return (
    <div className="flex h-dvh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <aside
        aria-label="Sidebar"
        className={cn(
          'hidden shrink-0 border-r border-border transition-[width] duration-200 print:hidden lg:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggleSidebar} />
      </aside>

      <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DrawerContent side="left" size="sm" className="max-w-72 sm:max-w-72 lg:hidden">
          <DrawerTitle className="sr-only">Navigation</DrawerTitle>
          <DrawerDescription className="sr-only">
            Jump to any section of LeadFlow.
          </DrawerDescription>
          <Sidebar collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
        </DrawerContent>
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenNav={() => setMobileNavOpen(true)} />
        <OfflineBanner />
        {navigation.state === 'loading' ? (
          <div className="fixed inset-x-0 top-0 z-50">
            <ProgressBar value={null} size="sm" aria-label="Loading page" />
          </div>
        ) : null}
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            'flex-1 scroll-pb-28 overflow-y-auto p-4 outline-none print:overflow-visible print:p-0 lg:px-6 lg:py-6',
            hideTabs ? 'pb-[max(1rem,env(safe-area-inset-bottom))]' : 'pb-24',
          )}
        >
          <div className="mx-auto w-full min-w-0 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {hideTabs ? null : <MobileTabBar onOpenMore={() => setMobileNavOpen(true)} />}
      <PwaPrompts />
      <CommandPalette />
      <FollowUpComposer />
      {import.meta.env.DEV ? <SimulatorFab /> : null}
    </div>
  )
}

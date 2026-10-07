import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui'
import { MentorHeader } from './MentorHeader'
import { MentorSidebar } from './MentorSidebar'

export function MentorLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-dvh bg-background text-foreground">
      {/* Desktop Fixed Left Sidebar */}
      <aside
        aria-label="Mentor Navigation Sidebar"
        className="hidden lg:block w-64 shrink-0 border-r border-border print:hidden"
      >
        <MentorSidebar />
      </aside>

      {/* Mobile Left Drawer Navigation */}
      <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DrawerContent
          side="left"
          size="sm"
          className="max-w-72 sm:max-w-72 lg:hidden rounded-r-2xl border-r-0 p-0 overflow-hidden"
        >
          <DrawerTitle className="sr-only">Mentor Navigation Menu</DrawerTitle>
          <DrawerDescription className="sr-only">
            Access mentor home, classes, students, attendance, assignments, and settings.
          </DrawerDescription>
          <MentorSidebar onNavigate={() => setMobileNavOpen(false)} />
        </DrawerContent>
      </Drawer>

      {/* Main Content View on Right */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MentorHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main
          id="mentor-main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 sm:p-6 outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MentorLayout

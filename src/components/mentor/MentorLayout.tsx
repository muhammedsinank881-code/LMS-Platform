import { AppShell } from '@/components/layout/AppShell'

/**
 * MentorLayout now re-exports AppShell directly so that the Mentor module
 * uses the exact same layout, header, sidebar container, width and spacing as Admin.
 */
export function MentorLayout() {
  return <AppShell />
}

export default MentorLayout

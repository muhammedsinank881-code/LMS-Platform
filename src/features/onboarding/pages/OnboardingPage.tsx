import { LogOut } from 'lucide-react'
import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui'
import { useLogout } from '@/features/auth'
import { OnboardingWizard } from '../components/OnboardingWizard'

/** Rendered outside the AppShell: no sidebar until setup is complete. */
export function OnboardingPage() {
  const logout = useLogout()

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-4 sm:px-8">
        <BrandMark />
        <Button variant="ghost" onClick={logout}>
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:items-center">
        <OnboardingWizard />
      </main>
    </div>
  )
}

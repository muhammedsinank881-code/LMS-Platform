import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

export function PwaPrompts() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  const [install, setInstall] = useState<InstallPromptEvent | null>(null)
  const [installHidden, setInstallHidden] = useState(false)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstall(event as InstallPromptEvent)
    }
    const onInstalled = () => setInstall(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  return (
    <>
      {needRefresh ? (
        <div
          role="status"
          className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface p-3 shadow-popover lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm"
        >
          <p className="text-sm">A new version of LeadFlow is ready.</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void updateServiceWorker(true)}>
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={() => setNeedRefresh(false)}>
              Later
            </Button>
          </div>
        </div>
      ) : null}
      {install && !installHidden ? (
        <div
          role="status"
          className="fixed inset-x-3 top-[4.5rem] z-40 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface p-3 shadow-popover lg:left-auto lg:right-4 lg:max-w-sm"
        >
          <p className="text-sm">Install LeadFlow for quicker access.</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                void install.prompt()
                setInstallHidden(true)
              }}
            >
              Install
            </Button>
            <Button size="sm" variant="outline" onClick={() => setInstallHidden(true)}>
              Not now
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}

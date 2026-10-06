import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))

  useEffect(() => {
    const markOnline = () => setOnline(true)
    const markOffline = () => setOnline(false)
    window.addEventListener('online', markOnline)
    window.addEventListener('offline', markOffline)
    return () => {
      window.removeEventListener('online', markOnline)
      window.removeEventListener('offline', markOffline)
    }
  }, [])

  if (online) return null

  return (
    <div role="status" className="bg-warning px-4 py-2 text-center text-sm text-warning-foreground">
      You&apos;re offline. Lists stay as they were, and changes wait until you&apos;re back online.
    </div>
  )
}

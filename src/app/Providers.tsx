import { useEffect, useState, type ReactNode } from 'react'
import { onlineManager, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, TooltipProvider } from '@/components/ui'
import { createQueryClient } from './query-client'
import { useResetCacheOnSessionChange } from './use-reset-cache-on-session-change'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)
  useResetCacheOnSessionChange(queryClient)
  useEffect(() => {
    return onlineManager.setEventListener((setOnline) => {
      const update = () => setOnline(navigator.onLine)
      window.addEventListener('online', update)
      window.addEventListener('offline', update)
      setOnline(navigator.onLine)
      return () => {
        window.removeEventListener('online', update)
        window.removeEventListener('offline', update)
      }
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

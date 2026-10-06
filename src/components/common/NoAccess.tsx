import { ShieldOff } from 'lucide-react'
import { EmptyState } from '@/components/ui'

export function NoAccess({ title = "You don't have access to this page" }: { title?: string }) {
  return (
    <EmptyState
      icon={ShieldOff}
      title={title}
      description="Ask a workspace admin if you need access."
    />
  )
}

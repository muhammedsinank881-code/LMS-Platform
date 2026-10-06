import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui'
import { useDirectory } from '@/features/team/hooks/use-team'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/auth-store'
import { ConversationFilters } from '../components/ConversationFilters'
import { DEFAULT_INBOX_FILTERS, type InboxFilters } from '../lib/inbox-filters'
import { ConversationList } from '../components/ConversationList'
import { LeadInfoPanel } from '../components/LeadInfoPanel'
import { ThreadPane } from '../components/ThreadPane'
import { useConversation } from '../hooks/use-conversations'

/** Three panes need room: below this width the contact panel slides over the thread instead. */
const INLINE_INFO_QUERY = '(min-width: 1440px)'
const SPLIT_QUERY = '(min-width: 768px)'
const DESKTOP_QUERY = '(min-width: 1024px)'

export function InboxPage() {
  const { conversationId } = useParams()
  const [params, setParams] = useSearchParams()
  const inlineInfo = useMediaQuery(INLINE_INFO_QUERY)
  const split = useMediaQuery(SPLIT_QUERY)
  const desktop = useMediaQuery(DESKTOP_QUERY)
  const user = useAuthStore((state) => state.user)
  const directory = useDirectory()
  const selected = useConversation(conversationId)
  const [filters, setFilters] = useState<InboxFilters>(DEFAULT_INBOX_FILTERS)
  const users = Object.fromEntries((directory.data ?? []).map((item) => [item.id, item.name]))
  const showList = split || !conversationId
  const showThread = split || Boolean(conversationId)
  const infoOpen = params.get('info') === '1'
  // The bottom tab bar shows below 1024px, except inside a thread.
  const tabBar = !desktop && !conversationId

  const setInfo = (open: boolean) => {
    const next = new URLSearchParams(params)
    if (open) next.set('info', '1')
    else next.delete('info')
    setParams(next, { replace: true })
  }

  if (!user) return null

  return (
    <div
      className={cn(
        '-m-4 flex min-h-0 overflow-hidden bg-surface lg:-m-6 lg:border-0',
        tabBar ? 'h-[calc(100dvh-7.5rem-env(safe-area-inset-bottom))] -mb-24' : 'h-[calc(100dvh-4rem)]',
      )}
    >
      {showList ? (
        <section
          aria-label="Conversation list"
          className="flex w-full min-w-0 flex-col border-r border-border bg-surface md:w-80 md:shrink-0"
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <h1 className="text-lg font-semibold">Inbox</h1>
          </div>
          <ConversationFilters value={filters} userId={user.id} onChange={setFilters} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList filters={filters} userId={user.id} users={users} />
          </div>
        </section>
      ) : null}
      {showThread ? (
        <section aria-label="Conversation" className="flex min-w-0 flex-1 flex-col bg-background">
          <ThreadPane
            conversationId={conversationId ?? null}
            showBack={!split}
            showInfoButton={!inlineInfo}
            onOpenInfo={() => setInfo(true)}
          />
        </section>
      ) : null}
      {inlineInfo && selected.data ? (
        <aside aria-label="Contact details" className="w-80 shrink-0 border-l border-border bg-surface">
          <LeadInfoPanel conversation={selected.data} />
        </aside>
      ) : null}
      {!inlineInfo ? (
        <Drawer open={infoOpen && Boolean(selected.data)} onOpenChange={setInfo}>
          <DrawerContent side="right" size="sm">
            <DrawerHeader className="p-4 pr-14">
              <DrawerTitle className="text-base">Contact details</DrawerTitle>
              <DrawerDescription className="sr-only">Lead summary, quick actions and recent activity.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="p-0">
              {selected.data ? <LeadInfoPanel conversation={selected.data} /> : null}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ) : null}
    </div>
  )
}

import { useState } from 'react'
import { ChevronDown, Reply } from 'lucide-react'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { Conversation, Lead } from '@/types'
import { CallComposer } from './composers/CallComposer'
import { EmailComposer } from './composers/EmailComposer'
import { WhatsAppComposer } from './composers/WhatsAppComposer'

export type ComposerTab = 'compose' | 'call'

/** The reply area for a thread: the channel's composer plus the "Log a call" form. */
export function ThreadComposer({
  conversation,
  lead,
  owner,
  tab,
  onTabChange,
}: {
  conversation: Conversation
  lead?: Lead | null
  owner?: { name: string } | null
  tab: ComposerTab
  onTabChange: (tab: ComposerTab) => void
}) {
  const phone = useMediaQuery('(max-width: 767px)')
  const [replying, setReplying] = useState(false)
  // A full email form would hide the thread on a phone, so it starts as a one-line Reply bar.
  // It is hidden, not unmounted, so a half-written email is never lost.
  const collapsed = phone && conversation.channel === 'email' && tab === 'compose' && !replying
  return (
    <>
      {collapsed ? (
        <div className="p-3">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setReplying(true)}
          >
            <Reply /> Reply to this email
          </Button>
        </div>
      ) : null}
      <div hidden={collapsed}>
        <Tabs value={tab} onValueChange={(value) => onTabChange(value as ComposerTab)}>
          {phone && conversation.channel === 'email' ? (
            <div className="flex justify-end px-3 pt-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setReplying(false)}>
                Collapse <ChevronDown />
              </Button>
            </div>
          ) : null}
          {conversation.channel !== 'call' ? (
            <TabsList aria-label="Composer" className="px-3 sm:px-4">
              <TabsTrigger value="compose">
                {conversation.channel === 'email' ? 'Email' : 'Message'}
              </TabsTrigger>
              <TabsTrigger value="call">Log a call</TabsTrigger>
            </TabsList>
          ) : null}
          {conversation.channel === 'whatsapp' ? (
            <TabsContent value="compose" className="mt-0">
              <WhatsAppComposer conversation={conversation} lead={lead} owner={owner} />
            </TabsContent>
          ) : null}
          {conversation.channel === 'email' ? (
            <TabsContent value="compose" className="mt-0">
              <EmailComposer conversation={conversation} lead={lead} owner={owner} />
            </TabsContent>
          ) : null}
          <TabsContent value="call" className="mt-0">
            <CallComposer conversation={conversation} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

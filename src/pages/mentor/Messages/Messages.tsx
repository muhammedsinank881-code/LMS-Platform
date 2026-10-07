import { useState } from 'react'
import { Search, Send } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'

interface MessageThread {
  id: string
  name: string
  role: string
  avatarInitials: string
  lastMessage: string
  time: string
  unread: boolean
}

const MOCK_THREADS: MessageThread[] = [
  {
    id: 'msg-1',
    name: 'Muhammad Riyan',
    role: 'Student • BCA - 3rd Year',
    avatarInitials: 'MR',
    lastMessage: 'Ma’am, I have uploaded the updated React lab code for review.',
    time: '10:42 AM',
    unread: true,
  },
  {
    id: 'msg-2',
    name: 'Fathima Nida',
    role: 'Student • BCA - 3rd Year',
    avatarInitials: 'FN',
    lastMessage: 'Thank you for the guidance on the E-Commerce capstone architecture!',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'msg-3',
    name: 'Alan Shihab',
    role: 'Student • BCA - 3rd Year',
    avatarInitials: 'AS',
    lastMessage: 'Can we schedule a quick 1-on-1 session tomorrow?',
    time: '02 Oct',
    unread: false,
  },
]

export function Messages() {
  const [activeThreadId, setActiveThreadId] = useState<string>('msg-1')
  const [replyText, setReplyText] = useState('')

  const activeThread = MOCK_THREADS.find((t) => t.id === activeThreadId) || MOCK_THREADS[0]

  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <PageHeader
        title="Student Messages"
        description="Direct communication channel with your assigned students"
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Messages' },
        ]}
      />

      {/* Messaging Layout */}
      <Card className="p-0 overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
        {/* Threads List */}
        <div className="border-r border-border p-3 space-y-2">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-input rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            {MOCK_THREADS.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full text-left p-3 rounded-md transition-colors flex items-start gap-3 cursor-pointer ${
                  activeThreadId === thread.id
                    ? 'bg-primary-subtle border border-primary/30'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary-subtle text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  {thread.avatarInitials}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground truncate">
                      {thread.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{thread.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-tight">
                    {thread.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-span-2 flex flex-col justify-between bg-muted/20">
          {/* Chat Header */}
          <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-subtle text-primary font-bold text-xs flex items-center justify-center">
                {activeThread?.avatarInitials}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {activeThread?.name}
                </h3>
                <p className="text-[11px] text-muted-foreground">{activeThread?.role}</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="bg-surface p-3 rounded-md border border-border max-w-md text-xs space-y-1">
              <p className="text-foreground">{activeThread?.lastMessage}</p>
              <span className="text-[10px] text-muted-foreground block text-right">{activeThread?.time}</span>
            </div>
          </div>

          {/* Composer */}
          <div className="p-3 bg-surface border-t border-border flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3 py-2 bg-surface border border-input rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring h-10"
            />
            <Button
              type="button"
              variant="primary"
              onClick={() => setReplyText('')}
              className="h-10"
            >
              <Send className="size-3.5 mr-1.5" />
              <span>Send</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Messages

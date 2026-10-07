import { useState } from 'react'
import { Search, Send } from 'lucide-react'

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
    <div className="max-w-6xl mx-auto space-y-4 text-[#17324D] dark:text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Student Messages</h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          Direct communication channel with your assigned students
        </p>
      </div>

      {/* Messaging Layout */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
        {/* Threads List */}
        <div className="border-r border-[#E2E8F0] dark:border-border p-3 space-y-2">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-border rounded-lg text-xs text-[#17324D] dark:text-foreground placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#0F9F83]"
            />
          </div>

          <div className="space-y-1">
            {MOCK_THREADS.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors flex items-start gap-3 cursor-pointer ${
                  activeThreadId === thread.id
                    ? 'bg-[#E8F7F3] dark:bg-[#0F9F83]/20 border border-[#0F9F83]/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-[#17324D] font-bold text-xs flex items-center justify-center shrink-0">
                  {thread.avatarInitials}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17324D] dark:text-foreground truncate">
                      {thread.name}
                    </span>
                    <span className="text-[10px] text-[#64748B]">{thread.time}</span>
                  </div>
                  <p className="text-xs text-[#64748B] truncate leading-tight">
                    {thread.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-span-2 flex flex-col justify-between bg-[#F8FAFC]/50 dark:bg-slate-900/20">
          {/* Chat Header */}
          <div className="p-4 bg-white dark:bg-card border-b border-[#E2E8F0] dark:border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0F9F83]/10 text-[#0F9F83] font-bold text-xs flex items-center justify-center">
                {activeThread?.avatarInitials}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#17324D] dark:text-foreground">
                  {activeThread?.name}
                </h3>
                <p className="text-[11px] text-[#64748B]">{activeThread?.role}</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="bg-white dark:bg-card p-3 rounded-xl border border-[#E2E8F0] dark:border-border max-w-md text-xs space-y-1">
              <p className="text-[#17324D] dark:text-foreground">{activeThread?.lastMessage}</p>
              <span className="text-[10px] text-[#64748B] block text-right">{activeThread?.time}</span>
            </div>
          </div>

          {/* Composer */}
          <div className="p-3 bg-white dark:bg-card border-t border-[#E2E8F0] dark:border-border flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-border rounded-xl text-xs text-[#17324D] dark:text-foreground placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#0F9F83] h-10"
            />
            <button
              type="button"
              onClick={() => setReplyText('')}
              className="px-4 py-2 bg-[#0F9F83] hover:bg-[#0b7e67] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 h-10 transition-colors cursor-pointer"
            >
              <Send className="size-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages

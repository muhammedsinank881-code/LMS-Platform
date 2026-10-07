import { useState } from 'react'
import { Send } from 'lucide-react'
import { Avatar, Button, Card, Input } from '@/components/ui'
import { MOCK_STUDENT_DATA, type ChatMessage } from '../../mock/student-data'

export function MentorChatWidget() {
  const { mentorChat } = MOCK_STUDENT_DATA
  const [messages, setMessages] = useState<ChatMessage[]>(mentorChat.messages)
  const [inputText, setInputText] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, newMsg])
    setInputText('')
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Avatar name={mentorChat.mentorName} src={mentorChat.avatar} size="sm" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">{mentorChat.mentorName}</h3>
            <p className="text-[10px] text-muted-foreground">{mentorChat.mentorRole}</p>
          </div>
        </div>
        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          WhatsApp Chat
        </span>
      </div>

      {/* Messages Feed (WhatsApp style) */}
      <div className="my-3 space-y-2 flex-1 overflow-y-auto max-h-52 p-2 rounded-lg bg-muted/40">
        {messages.map((msg) => {
          const isStudent = msg.sender === 'student'
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${isStudent
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-surface border border-border text-foreground rounded-bl-none'
                  }`}
              >
                <p>{msg.text}</p>
                <span className={`block mt-1 text-[9px] text-right ${isStudent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-1 border-t border-border">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask mentor a question..."
          className="h-8 text-xs flex-1"
        />
        <Button type="submit" size="icon" className="h-8 w-8 shrink-0">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </Card>
  )
}

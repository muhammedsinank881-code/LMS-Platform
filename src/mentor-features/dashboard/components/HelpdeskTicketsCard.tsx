import { HelpCircle, MessageSquare } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { HelpdeskTicketItem } from '../types'

interface HelpdeskTicketsCardProps {
  tickets: HelpdeskTicketItem[]
}

export function HelpdeskTicketsCard({ tickets }: HelpdeskTicketsCardProps) {
  return (
    <Card className="border-border bg-surface shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">Helpdesk &amp; Student Q&amp;A</CardTitle>
        </div>
        <Badge tone="destructive" appearance="soft" size="sm">
          {tickets.length} Unresolved
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="font-semibold text-foreground truncate">{ticket.studentName}</span>
                <span className="text-muted-foreground shrink-0">{ticket.timeAgo}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground/90 line-clamp-2 leading-snug">
                {ticket.subject}
              </p>
              <div className="flex items-center justify-between pt-1 gap-2">
                <Badge tone="info" size="sm" className="shrink-0">
                  {ticket.category}
                </Badge>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                  <MessageSquare className="size-3.5 mr-1 text-primary" />
                  Answer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

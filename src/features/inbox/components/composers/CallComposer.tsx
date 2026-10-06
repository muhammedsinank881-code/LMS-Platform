import { useState } from 'react'
import { PhoneIncoming, PhoneOutgoing } from 'lucide-react'
import { CALL_OUTCOME_LABEL } from '@/components/common/timeline/activity-meta'
import { Button, Input, Select, Textarea, toast } from '@/components/ui'
import { cn } from '@/lib/cn'
import { CALL_OUTCOMES, type CallOutcome, type Conversation, type MessageDirection } from '@/types'
import { useCreateCallLog } from '../../hooks/use-call-logs'

const QUICK_MINUTES = [1, 5, 10, 15]

const DIRECTIONS = [
  { value: 'outbound', label: 'Outgoing', icon: PhoneOutgoing },
  { value: 'inbound', label: 'Incoming', icon: PhoneIncoming },
] as const

export function CallComposer({ conversation }: { conversation: Conversation }) {
  const create = useCreateCallLog()
  const [direction, setDirection] = useState<MessageDirection>('outbound')
  const [outcome, setOutcome] = useState<CallOutcome>('connected')
  const [minutes, setMinutes] = useState('5')
  const [notes, setNotes] = useState('')
  const connected = outcome === 'connected'

  return (
    <form
      aria-label="Log a call"
      className="space-y-3 p-3 sm:px-4"
      onSubmit={(event) => {
        event.preventDefault()
        create.mutate(
          {
            conversationId: conversation.id,
            leadId: conversation.leadId,
            direction,
            outcome,
            durationSecs: connected ? Math.max(0, Math.round(Number(minutes) * 60)) : 0,
            notes,
          },
          {
            onSuccess: () => {
              setNotes('')
              toast.success('Call logged')
            },
          },
        )
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[auto_1fr_8rem]">
        <div role="radiogroup" aria-label="Direction" className="inline-flex rounded-md border border-border p-0.5">
          {DIRECTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={direction === item.value}
              onClick={() => setDirection(item.value)}
              className={cn(
                'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:h-10',
                direction === item.value ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" /> {item.label}
            </button>
          ))}
        </div>
        <Select
          aria-label="Outcome"
          value={outcome}
          onValueChange={(value) => setOutcome(value as CallOutcome)}
          options={CALL_OUTCOMES.map((item) => ({ value: item, label: CALL_OUTCOME_LABEL[item] }))}
        />
        <div className="relative">
          <Input
            aria-label="Duration in minutes"
            type="number"
            min={0}
            disabled={!connected}
            value={connected ? minutes : '0'}
            onChange={(event) => setMinutes(event.target.value)}
            className="pr-12"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">min</span>
        </div>
      </div>
      {connected ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick duration">
          {QUICK_MINUTES.map((value) => (
            <Button key={value} type="button" size="sm" variant={minutes === String(value) ? 'secondary' : 'outline'} onClick={() => setMinutes(String(value))}>
              {value} min
            </Button>
          ))}
        </div>
      ) : null}
      <Textarea aria-label="Call notes" rows={3} placeholder="What was discussed? Next steps?" value={notes} onChange={(event) => setNotes(event.target.value)} />
      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={create.isPending}>
          Save call
        </Button>
      </div>
    </form>
  )
}

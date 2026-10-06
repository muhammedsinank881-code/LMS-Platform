import { AlarmClock } from 'lucide-react'
import { Button, Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/ui'
import { minutesUntilTomorrowMorning } from '@/lib/followup-schedule'

export function SnoozeMenu({
  onSnooze,
  disabled,
}: {
  onSnooze: (minutes: number) => void
  disabled?: boolean
}) {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Snooze" disabled={disabled}>
          <AlarmClock />
        </Button>
      </DropdownTrigger>
      <DropdownContent align="end">
        <DropdownItem onSelect={() => onSnooze(15)}>15 min</DropdownItem>
        <DropdownItem onSelect={() => onSnooze(60)}>1 hour</DropdownItem>
        <DropdownItem onSelect={() => onSnooze(minutesUntilTomorrowMorning(new Date()))}>Tomorrow</DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}

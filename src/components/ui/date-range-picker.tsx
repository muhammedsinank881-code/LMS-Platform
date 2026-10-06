import { useState } from 'react'
import { CalendarRange } from 'lucide-react'
import { compareCaption, presetLabel, RANGE_PRESETS, type RangePreset } from '@/lib/date-range'
import { Button } from './button'
import { DatePicker } from './date-picker'
import { Label } from './label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Switch } from './switch'

export interface DateRangePickerProps {
  preset: RangePreset
  fromDay: string
  toDay: string
  compare: boolean
  onPreset: (preset: Exclude<RangePreset, 'custom'>) => void
  onCustom: (fromDay: string, toDay: string) => void
  onCompare: (compare: boolean) => void
}

export function DateRangePicker({ preset, fromDay, toDay, compare, onPreset, onCustom, onCompare }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(fromDay)
  const [draftTo, setDraftTo] = useState(toDay)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Date range">
          <CalendarRange aria-hidden="true" />
          {presetLabel(preset)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid grid-cols-2 gap-1">
          {RANGE_PRESETS.filter((item) => item !== 'custom').map((item) => (
            <Button
              key={item}
              size="sm"
              variant={preset === item ? 'secondary' : 'ghost'}
              onClick={() => {
                onPreset(item)
                setOpen(false)
              }}
            >
              {presetLabel(item)}
            </Button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="range-from">From</Label>
            <DatePicker id="range-from" value={draftFrom} onValueChange={setDraftFrom} aria-label="From" />
          </div>
          <div>
            <Label htmlFor="range-to">To</Label>
            <DatePicker id="range-to" value={draftTo} onValueChange={setDraftTo} aria-label="To" />
          </div>
        </div>
        <Button
          size="sm"
          className="mt-2 w-full"
          variant="outline"
          onClick={() => {
            onCustom(draftFrom, draftTo)
            setOpen(false)
          }}
        >
          Apply custom range
        </Button>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <Label htmlFor="compare-period">{compareCaption(preset)}</Label>
          <Switch id="compare-period" size="sm" checked={compare} onCheckedChange={onCompare} aria-label="Compare to previous period" />
        </div>
      </PopoverContent>
    </Popover>
  )
}

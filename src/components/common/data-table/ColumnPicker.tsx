import { Columns3 } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownCheckboxItem,
  DropdownContent,
  DropdownTrigger,
} from '@/components/ui'
import type { VisibilityState } from './types'

export interface ColumnOption {
  id: string
  label: string
}

export interface ColumnPickerProps {
  columns: ColumnOption[]
  visibility: VisibilityState
  onVisibilityChange: (visibility: VisibilityState) => void
}

export function ColumnPicker({ columns, visibility, onVisibilityChange }: ColumnPickerProps) {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Choose columns">
          <Columns3 />
          <span className="hidden sm:inline">Columns</span>
        </Button>
      </DropdownTrigger>
      <DropdownContent align="end">
        {columns.map((column) => {
          const visible = visibility[column.id] !== false
          return (
            <DropdownCheckboxItem
              key={column.id}
              checked={visible}
              onCheckedChange={(checked) =>
                onVisibilityChange({ ...visibility, [column.id]: checked === true })
              }
              onSelect={(event) => event.preventDefault()}
            >
              {column.label}
            </DropdownCheckboxItem>
          )
        })}
      </DropdownContent>
    </Dropdown>
  )
}

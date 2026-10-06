import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

export interface SearchInputProps {
  defaultValue?: string
  onValueChange: (value: string) => void
  placeholder?: string
  delay?: number
  id?: string
  className?: string
  'aria-label'?: string
}

export function SearchInput({
  defaultValue = '',
  onValueChange,
  placeholder = 'Search…',
  delay = 300,
  id,
  className,
  'aria-label': ariaLabel = 'Search',
}: SearchInputProps) {
  const [draft, setDraft] = useState(defaultValue)
  const debounced = useDebouncedValue(draft, delay)
  const onValueChangeRef = useRef(onValueChange)

  useEffect(() => {
    onValueChangeRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueChangeRef.current(debounced)
  }, [debounced])

  return (
    <Input
      id={id}
      className={className}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      placeholder={placeholder}
      inputMode="search"
      autoComplete="off"
      aria-label={ariaLabel}
      leftAdornment={<Search />}
      rightAdornment={
        draft ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Clear search"
            onClick={() => setDraft('')}
          >
            <X />
          </Button>
        ) : null
      }
    />
  )
}

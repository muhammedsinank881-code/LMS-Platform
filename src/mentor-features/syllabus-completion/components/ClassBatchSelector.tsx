import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check, BookOpen, Layers } from 'lucide-react'
import { Card, Badge } from '@/components/ui'
import type { MentorClass } from '@/mentor-features/my-classes/types'

interface ClassBatchSelectorProps {
  selectedClassId: string
  onClassChange: (classId: string) => void
  classes: MentorClass[]
}

export function ClassBatchSelector({
  selectedClassId,
  onClassChange,
  classes,
}: ClassBatchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0]

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault()
          setIsOpen(true)
          setFocusedIndex(classes.findIndex((c) => c.id === selectedClassId))
        }
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev < classes.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : classes.length - 1))
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < classes.length) {
          onClassChange(classes[focusedIndex].id)
          setIsOpen(false)
        }
      }
    },
    [isOpen, classes, focusedIndex, selectedClassId, onClassChange],
  )

  return (
    <Card className="overflow-visible bg-surface border-border shadow-2xs rounded-2xl">
      <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors cursor-pointer hover:bg-muted/40 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 select-none"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Select class or batch"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-muted-foreground block">
                CLASS / BATCH
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-foreground truncate">
                  {currentClass ? `${currentClass.program} - ${currentClass.year}` : 'Select Class'}
                </span>
                {currentClass ? (
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
                    • {currentClass.title} ({currentClass.semester})
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Chevron dropdown indicator */}
          <div
            className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-transform duration-200 border shrink-0 ${
              isOpen
                ? 'bg-primary/10 text-primary border-primary/30 rotate-180'
                : 'bg-muted text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </button>

        {/* Dropdown Popover */}
        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            aria-label="Class and Batch options"
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface border border-border rounded-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto"
          >
            {classes.map((cls, idx) => {
              const isSelected = cls.id === selectedClassId
              const isFocused = idx === focusedIndex

              return (
                <button
                  key={cls.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    e.stopPropagation()
                    onClassChange(cls.id)
                    setIsOpen(false)
                  }}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : isFocused
                      ? 'bg-muted text-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {cls.program} - {cls.year} • {cls.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>{cls.courseCode}</span>
                        <span>•</span>
                        <span>{cls.semester}</span>
                        <span>•</span>
                        <span>{cls.studentsCount} Students</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge
                      tone={cls.status === 'active' ? 'info' : 'neutral'}
                      size="sm"
                      className="text-[10px]"
                    >
                      {cls.status === 'active' ? 'Active' : 'Completed'}
                    </Badge>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0 font-bold" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

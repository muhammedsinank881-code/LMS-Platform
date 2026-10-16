import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { ClassCohortOption } from '../types'

interface ClassSelectorProps {
  selectedClass: string
  onClassChange: (classId: string) => void
  classes: ClassCohortOption[]
  getStudentCountForClass?: (classId: string) => number
}

export function ClassSelector({
  selectedClass,
  onClassChange,
  classes,
  getStudentCountForClass,
}: ClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const currentClass = classes.find((c) => c.id === selectedClass) || classes[0]

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
          setFocusedIndex(classes.findIndex((c) => c.id === selectedClass))
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
    [isOpen, classes, focusedIndex, selectedClass, onClassChange],
  )

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors cursor-pointer hover:bg-muted/30 rounded-t-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select class or batch"
      >
        <div className="space-y-0.5">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-muted-foreground block">
            CLASS / BATCH
          </span>
          <div className="text-sm sm:text-base font-bold text-foreground">
            {currentClass ? currentClass.name : 'Select Class'}
          </div>
        </div>

        {/* Green-tinted chevron button matching Screenshot reference */}
        <div
          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-transform duration-200 border shrink-0 ${
            isOpen
              ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 rotate-180'
              : 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
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
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface border border-border rounded-xl shadow-2xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {classes.map((cls, idx) => {
            const isSelected = cls.id === selectedClass
            const isFocused = idx === focusedIndex
            const studentCount = getStudentCountForClass
              ? getStudentCountForClass(cls.id)
              : cls.totalStudents

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
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold'
                    : isFocused
                    ? 'bg-muted text-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{cls.name}</span>
                  {studentCount !== undefined && (
                    <span className="text-xs text-muted-foreground font-normal">
                      ({studentCount} Students)
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold ml-2" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

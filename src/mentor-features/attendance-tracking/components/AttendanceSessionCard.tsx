import { useState, useRef, useEffect, useCallback } from 'react'
import { Video, ChevronsUpDown, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { SessionInfo } from '../types'
import { AVAILABLE_SESSIONS } from '../data/mockAttendanceData'

interface AttendanceSessionCardProps {
  session: SessionInfo
  availableSessions?: SessionInfo[]
  onSessionChange?: (session: SessionInfo) => void
  onSelectSession?: () => void
}

export function AttendanceSessionCard({
  session,
  availableSessions = AVAILABLE_SESSIONS,
  onSessionChange,
  onSelectSession,
}: AttendanceSessionCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  // Close dropdown on click outside
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
          setFocusedIndex(availableSessions.findIndex((s) => s.id === session.id))
        }
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((prev) =>
          prev < availableSessions.length - 1 ? prev + 1 : 0,
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : availableSessions.length - 1,
        )
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < availableSessions.length) {
          const selected = availableSessions[focusedIndex]
          if (onSessionChange) onSessionChange(selected)
          if (onSelectSession) onSelectSession()
          setIsOpen(false)
        }
      }
    },
    [isOpen, availableSessions, focusedIndex, session.id, onSessionChange, onSelectSession],
  )

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    if (!isOpen) {
      setFocusedIndex(availableSessions.findIndex((s) => s.id === session.id))
    }
  }

  const handleSelect = (s: SessionInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSessionChange) onSessionChange(s)
    if (onSelectSession) onSelectSession()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Card
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select subject or session"
        className={`p-3.5 sm:p-4 bg-surface border-border shadow-sm rounded-2xl cursor-pointer hover:border-emerald-500/40 transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 ${
          isOpen ? 'ring-2 ring-emerald-500/20 border-emerald-500/50' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Video Icon Container */}
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
            <Video className="h-5 w-5" />
          </div>

          {/* Center: Title + Live Badge + Lecture details */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {session.subject}
              </h2>
              {session.badgeText && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                  {session.badgeText}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
              {session.lecture} · {session.timeRange}
            </p>
          </div>

          {/* Right: Switch/Chevron Icon with active state */}
          <div
            className={`p-1.5 rounded-lg transition-transform duration-200 shrink-0 text-muted-foreground hover:text-foreground ${
              isOpen
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rotate-180'
                : 'hover:bg-muted'
            }`}
          >
            <ChevronsUpDown className="h-4 w-4" />
          </div>
        </div>
      </Card>

      {/* Selectable Subjects Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          aria-label="Available subjects and sessions"
          onKeyDown={handleKeyDown}
          className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-surface border border-border rounded-xl shadow-2xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
            Select Subject / Session
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-border/40">
            {availableSessions.map((s, idx) => {
              const isSelected = s.id === session.id
              const isFocused = idx === focusedIndex

              return (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => handleSelect(s, e)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold'
                      : isFocused
                      ? 'bg-muted text-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                      <Video className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm truncate">
                          {s.subject}
                        </span>
                        {s.badgeText && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50">
                            {s.badgeText}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {s.lecture} · {s.timeRange}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold ml-2" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

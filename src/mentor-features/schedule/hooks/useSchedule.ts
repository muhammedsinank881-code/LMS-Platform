import { useMemo, useState } from 'react'
import type {
  CalendarViewMode,
  ClassStatus,
  ClassType,
  ScheduleFiltersState,
  ScheduledClass,
} from '../types'
import { MOCK_SCHEDULED_CLASSES } from '../mockData'

// Utility to convert time string like "09:00 AM" to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()

  if (period === 'PM' && hours < 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  return hours * 60 + minutes
}

export function useSchedule() {
  const [classes, setClasses] = useState<ScheduledClass[]>(MOCK_SCHEDULED_CLASSES)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week')
  const [currentDate, setCurrentDate] = useState<string>('2026-10-08') // Base anchor date (Today)

  const [filters, setFilters] = useState<ScheduleFiltersState>({
    search: '',
    course: 'all',
    semester: 'all',
    module: 'all',
    type: 'all',
    status: 'all',
    date: '',
  })

  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedClassDetails, setSelectedClassDetails] = useState<ScheduledClass | null>(null)
  const [editingClass, setEditingClass] = useState<ScheduledClass | null>(null)
  const [reschedulingClass, setReschedulingClass] = useState<ScheduledClass | null>(null)
  const [cancellingClass, setCancellingClass] = useState<ScheduledClass | null>(null)

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      // Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchCourse = item.courseClass.toLowerCase().includes(q)
        const matchRoom = item.room?.toLowerCase().includes(q) || false
        const matchModule = item.module.toLowerCase().includes(q)
        if (!matchTitle && !matchCourse && !matchRoom && !matchModule) return false
      }

      // Course
      if (filters.course !== 'all' && item.courseClass !== filters.course) return false

      // Semester
      if (filters.semester !== 'all' && item.semester !== filters.semester) return false

      // Module
      if (filters.module !== 'all' && item.module !== filters.module) return false

      // Type
      if (filters.type !== 'all' && item.type !== filters.type) return false

      // Status
      if (filters.status !== 'all' && item.status !== filters.status) return false

      // Date
      if (filters.date && item.date !== filters.date) return false

      return true
    })
  }, [classes, filters])

  // Today's schedule items (matching '2026-10-08')
  const todaysClasses = useMemo(() => {
    return classes
      .filter((c) => c.date === '2026-10-08' && c.status !== 'cancelled')
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  }, [classes])

  // Upcoming classes items
  const upcomingClasses = useMemo(() => {
    return filteredClasses
      .filter((c) => c.status === 'scheduled' || c.status === 'ongoing')
      .sort((a, b) => {
        if (a.date !== b.date) {
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        }
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      })
  }, [filteredClasses])

  // Conflict Validator
  const validateScheduleConflict = (
    target: {
      id?: string
      date: string
      startTime: string
      endTime: string
      room?: string
      type: ClassType
    },
  ): string | null => {
    const startMins = timeToMinutes(target.startTime)
    const endMins = timeToMinutes(target.endTime)

    if (endMins <= startMins) {
      return 'End time must be later than start time.'
    }

    // Check overlap with active non-cancelled classes
    for (const c of classes) {
      if (c.id === target.id || c.status === 'cancelled') continue

      if (c.date === target.date) {
        const existingStart = timeToMinutes(c.startTime)
        const existingEnd = timeToMinutes(c.endTime)

        // Time overlap condition
        const isOverlap = startMins < existingEnd && endMins > existingStart

        if (isOverlap) {
          // Mentor time conflict
          return `Schedule conflict: You already have "${c.title}" at this time (${c.startTime} - ${c.endTime}).`
        }

        // Room conflict
        if (target.type === 'in-person' && target.room && c.room === target.room && isOverlap) {
          return `${target.room} is already booked for this time (${c.startTime} - ${c.endTime}).`
        }
      }
    }

    return null
  }

  // Handlers
  const handleAddClass = (
    data: Omit<ScheduledClass, 'id' | 'status'>,
  ): { success: boolean; error?: string } => {
    const error = validateScheduleConflict(data)
    if (error) return { success: false, error }

    const newClass: ScheduledClass = {
      ...data,
      id: `sch-${Date.now()}`,
      status: 'scheduled',
    }

    setClasses((prev) => [newClass, ...prev])
    setIsScheduleModalOpen(false)
    return { success: true }
  }

  const handleUpdateClass = (
    updated: ScheduledClass,
  ): { success: boolean; error?: string } => {
    const error = validateScheduleConflict(updated)
    if (error) return { success: false, error }

    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    if (selectedClassDetails?.id === updated.id) {
      setSelectedClassDetails(updated)
    }
    setEditingClass(null)
    setIsScheduleModalOpen(false)
    return { success: true }
  }

  const handleReschedule = (
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
  ): { success: boolean; error?: string } => {
    const existing = classes.find((c) => c.id === id)
    if (!existing) return { success: false, error: 'Class not found.' }

    const conflictErr = validateScheduleConflict({
      id: existing.id,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      room: existing.room,
      type: existing.type,
    })

    if (conflictErr) return { success: false, error: conflictErr }

    const updated: ScheduledClass = {
      ...existing,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'scheduled',
    }

    setClasses((prev) => prev.map((c) => (c.id === id ? updated : c)))
    if (selectedClassDetails?.id === id) {
      setSelectedClassDetails(updated)
    }
    setReschedulingClass(null)
    return { success: true }
  }

  const handleCancelClass = (id: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, status: 'cancelled' as ClassStatus }
          if (selectedClassDetails?.id === id) {
            setSelectedClassDetails(updated)
          }
          return updated
        }
        return c
      }),
    )
    setCancellingClass(null)
  }

  return {
    classes: filteredClasses,
    allClasses: classes,
    todaysClasses,
    upcomingClasses,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    // Modals
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    selectedClassDetails,
    setSelectedClassDetails,
    editingClass,
    setEditingClass,
    reschedulingClass,
    setReschedulingClass,
    cancellingClass,
    setCancellingClass,
    // Actions
    handleAddClass,
    handleUpdateClass,
    handleReschedule,
    handleCancelClass,
  }
}

import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { MOCK_MENTOR_CLASSES } from '../mockData'
import type { ClassFilterTab, ClassSummaryStats, MentorClass } from '../types'

export interface UseMentorClassesOptions {
  initialTab?: ClassFilterTab
}

export function useMentorClasses(options: UseMentorClassesOptions = {}) {
  const { initialTab = 'all' } = options

  const user = useAuthStore((state) => state.user)
  const mentorId = user?.id || 'user-mentor'

  const [classList, setClassList] = useState<MentorClass[]>(MOCK_MENTOR_CLASSES)
  const [activeTab, setActiveTab] = useState<ClassFilterTab>(initialTab)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Filter classes strictly assigned to the logged-in mentor
  const mentorAssignedClasses = useMemo(() => {
    return classList.filter((cls) => cls.mentorId === mentorId || cls.mentorId === 'user-mentor')
  }, [classList, mentorId])

  // 2. Dynamic counts based on mentor's assigned dataset
  const stats: ClassSummaryStats = useMemo(() => {
    const totalCount = mentorAssignedClasses.length
    const activeCount = mentorAssignedClasses.filter((c) => c.status === 'active').length
    const completedCount = mentorAssignedClasses.filter((c) => c.status === 'completed').length

    return {
      totalCount,
      activeCount,
      completedCount,
    }
  }, [mentorAssignedClasses])

  // 3. Filtered classes based on tab and search
  const filteredClasses = useMemo(() => {
    return mentorAssignedClasses.filter((cls) => {
      // Filter tab
      if (activeTab === 'active' && cls.status !== 'active') return false
      if (activeTab === 'completed' && cls.status !== 'completed') return false

      // Search query filter (matches class title, course name, code, program, year, semester)
      const q = searchQuery.toLowerCase().trim()
      if (q) {
        const matchesTitle = cls.title.toLowerCase().includes(q)
        const matchesCode = cls.courseCode.toLowerCase().includes(q)
        const matchesCourse = cls.courseName.toLowerCase().includes(q)
        const matchesProgram = cls.program.toLowerCase().includes(q)
        const matchesYear = cls.year.toLowerCase().includes(q)
        const matchesSemester = cls.semester.toLowerCase().includes(q)
        const matchesRoom = cls.room.toLowerCase().includes(q)

        if (
          !matchesTitle &&
          !matchesCode &&
          !matchesCourse &&
          !matchesProgram &&
          !matchesYear &&
          !matchesSemester &&
          !matchesRoom
        ) {
          return false
        }
      }

      return true
    })
  }, [mentorAssignedClasses, activeTab, searchQuery])

  // Retry action for error state simulation
  const handleRetry = () => {
    setError(null)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 450)
  }

  // Create/Add a new class
  const addClass = (newClass: Omit<MentorClass, 'id' | 'mentorId' | 'attendanceRate' | 'syllabusProgress' | 'enrolledStudents'>) => {
    const created: MentorClass = {
      ...newClass,
      id: `cls-${Date.now()}`,
      mentorId,
      attendanceRate: 0,
      syllabusProgress: 0,
      enrolledStudents: [],
    }
    setClassList((prev) => [created, ...prev])
  }

  return {
    classes: filteredClasses,
    allClassesCount: mentorAssignedClasses.length,
    stats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    setError,
    handleRetry,
    addClass,
  }
}

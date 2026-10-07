import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { MOCK_ASSIGNED_STUDENTS } from '../lib/mockData'

export interface UseAssignedStudentsOptions {
  pageSize?: number
}

export function useAssignedStudents(options: UseAssignedStudentsOptions = {}) {
  const { pageSize = 10 } = options
  const user = useAuthStore((state) => state.user)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedAttendanceRange, setSelectedAttendanceRange] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Conceptually scope to the logged-in mentor
  const assignedStudents = useMemo(() => {
    // If user has a specific mentor role or ID, we ensure assigned list corresponds
    if (!user) return MOCK_ASSIGNED_STUDENTS
    // Default mock dataset is scoped to mentor
    return MOCK_ASSIGNED_STUDENTS
  }, [user])

  // 2. Extract dynamic classes list
  const availableClasses = useMemo(() => {
    const classes = Array.from(
      new Set(assignedStudents.map((s) => s.classBatch)),
    )
    return classes.sort()
  }, [assignedStudents])

  // 3. Filter students
  const filteredStudents = useMemo(() => {
    return assignedStudents.filter((student) => {
      // Search: name, rollNumber, classBatch, email
      const q = searchQuery.toLowerCase().trim()
      if (q) {
        const matchesName = student.name.toLowerCase().includes(q)
        const matchesRoll = student.rollNumber.toLowerCase().includes(q)
        const matchesClass = student.classBatch.toLowerCase().includes(q)
        const matchesEmail = student.email.toLowerCase().includes(q)
        if (!matchesName && !matchesRoll && !matchesClass && !matchesEmail) {
          return false
        }
      }

      // Class filter
      if (selectedClass !== 'all' && student.classBatch !== selectedClass) {
        return false
      }

      // Status filter
      if (selectedStatus !== 'all' && student.statusToday !== selectedStatus) {
        return false
      }

      // Attendance Range Filter
      if (selectedAttendanceRange === 'high' && student.attendancePercentage < 90) {
        return false
      }
      if (
        selectedAttendanceRange === 'medium' &&
        (student.attendancePercentage < 75 || student.attendancePercentage >= 90)
      ) {
        return false
      }
      if (selectedAttendanceRange === 'low' && student.attendancePercentage >= 75) {
        return false
      }

      return true
    })
  }, [
    assignedStudents,
    searchQuery,
    selectedClass,
    selectedStatus,
    selectedAttendanceRange,
  ])

  // Overall statistics
  const stats = useMemo(() => {
    const totalAssigned = assignedStudents.length
    const classesCount = availableClasses.length
    const avgAttendance =
      totalAssigned > 0
        ? Math.round(
            assignedStudents.reduce(
              (acc, s) => acc + s.attendancePercentage,
              0,
            ) / totalAssigned,
          )
        : 0

    return {
      totalAssigned,
      classesCount,
      avgAttendance,
    }
  }, [assignedStudents, availableClasses])

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, currentPage, pageSize])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 400)
  }

  return {
    students: paginatedStudents,
    allFilteredStudents: filteredStudents,
    totalCount: filteredStudents.length,
    stats,
    availableClasses,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setCurrentPage(1)
    },
    selectedClass,
    setSelectedClass: (c: string) => {
      setSelectedClass(c)
      setCurrentPage(1)
    },
    selectedStatus,
    setSelectedStatus: (s: string) => {
      setSelectedStatus(s)
      setCurrentPage(1)
    },
    selectedAttendanceRange,
    setSelectedAttendanceRange: (r: string) => {
      setSelectedAttendanceRange(r)
      setCurrentPage(1)
    },
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    loading,
    error,
    handleRetry,
  }
}

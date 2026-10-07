import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { MOCK_MENTOR_EXAMS } from '../mockData'
import type { ExamFilterTab, ExamOverviewStats, MentorExam } from '../types'

export interface UseMentorExamsOptions {
  initialTab?: ExamFilterTab
}

export function useMentorExams(options: UseMentorExamsOptions = {}) {
  const { initialTab = 'all' } = options

  const user = useAuthStore((state) => state.user)
  const mentorId = user?.id || 'user-mentor'

  const [exams, setExams] = useState<MentorExam[]>(MOCK_MENTOR_EXAMS)
  const [activeTab, setActiveTab] = useState<ExamFilterTab>(initialTab)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Filter exams assigned to the logged-in mentor
  const mentorAssignedExams = useMemo(() => {
    return exams.filter((ex) => ex.mentorId === mentorId || ex.mentorId === 'user-mentor')
  }, [exams, mentorId])

  // 2. Extract available classes assigned to the mentor for the dropdown filter
  const availableClasses = useMemo(() => {
    const classSet = new Set(mentorAssignedExams.map((ex) => ex.classBatch))
    return Array.from(classSet).sort()
  }, [mentorAssignedExams])

  // 3. Dynamic metric calculations (Total, Upcoming, Today, Results Pending, Completed)
  const stats: ExamOverviewStats = useMemo(() => {
    const total = mentorAssignedExams.length
    const upcoming = mentorAssignedExams.filter((ex) => ex.status === 'upcoming').length
    const today = mentorAssignedExams.filter((ex) => ex.status === 'ongoing').length
    const resultsPending = mentorAssignedExams.filter((ex) => ex.status === 'results_pending').length
    const completed = mentorAssignedExams.filter((ex) => ex.status === 'completed').length

    return {
      total,
      upcoming,
      today,
      resultsPending,
      completed,
    }
  }, [mentorAssignedExams])

  // 4. Filtered exams based on search, tab, and class dropdown
  const filteredExams = useMemo(() => {
    return mentorAssignedExams.filter((ex) => {
      // Tab filter
      if (activeTab === 'upcoming' && ex.status !== 'upcoming') return false
      if (activeTab === 'today' && ex.status !== 'ongoing') return false
      if (activeTab === 'completed' && ex.status !== 'completed') return false
      if (activeTab === 'results_pending' && ex.status !== 'results_pending') return false

      // Class dropdown filter
      if (selectedClass !== 'all' && ex.classBatch !== selectedClass) return false

      // Search query filter
      const q = searchQuery.toLowerCase().trim()
      if (q) {
        const matchesTitle = ex.title.toLowerCase().includes(q)
        const matchesSubject = ex.subject.toLowerCase().includes(q)
        const matchesClass = ex.classBatch.toLowerCase().includes(q)
        const matchesCourse = ex.courseName.toLowerCase().includes(q)
        const matchesRoom = ex.room.toLowerCase().includes(q)

        if (!matchesTitle && !matchesSubject && !matchesClass && !matchesCourse && !matchesRoom) {
          return false
        }
      }

      return true
    })
  }, [mentorAssignedExams, activeTab, selectedClass, searchQuery])

  // 5. Group filtered exams into logical sections
  const todayExams = useMemo(
    () => filteredExams.filter((ex) => ex.status === 'ongoing'),
    [filteredExams],
  )
  const upcomingExams = useMemo(
    () => filteredExams.filter((ex) => ex.status === 'upcoming'),
    [filteredExams],
  )
  const resultsPendingExams = useMemo(
    () => filteredExams.filter((ex) => ex.status === 'results_pending'),
    [filteredExams],
  )
  const completedExams = useMemo(
    () => filteredExams.filter((ex) => ex.status === 'completed'),
    [filteredExams],
  )

  // Retry handler
  const handleRetry = () => {
    setError(null)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 450)
  }

  // Create Exam handler
  const createExam = (newExam: Omit<MentorExam, 'id' | 'mentorId' | 'studentGrades'>) => {
    const created: MentorExam = {
      ...newExam,
      id: `exam-${Date.now()}`,
      mentorId,
      studentGrades: [],
    }
    setExams((prev) => [created, ...prev])
  }

  return {
    exams: filteredExams,
    totalCount: filteredExams.length,
    stats,
    availableClasses,
    activeTab,
    setActiveTab,
    selectedClass,
    setSelectedClass,
    searchQuery,
    setSearchQuery,
    todayExams,
    upcomingExams,
    resultsPendingExams,
    completedExams,
    loading,
    error,
    handleRetry,
    createExam,
  }
}

import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { MOCK_STUDENT_RESULTS } from './mockData'
import type { ResultsFilterTab, ResultsOverviewStats, StudentResult } from './types'

export interface UseMentorResultsOptions {
  initialTab?: ResultsFilterTab
  pageSize?: number
}

export function useMentorResults(options: UseMentorResultsOptions = {}) {
  const { initialTab = 'all', pageSize = 8 } = options

  const user = useAuthStore((state) => state.user)
  const mentorId = user?.id || 'user-mentor'

  const [results, setResults] = useState<StudentResult[]>(MOCK_STUDENT_RESULTS)
  const [activeTab, setActiveTab] = useState<ResultsFilterTab>(initialTab)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedExam, setSelectedExam] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Filter results assigned to the logged-in mentor
  const mentorAssignedResults = useMemo(() => {
    return results.filter((res) => res.mentorId === mentorId || res.mentorId === 'user-mentor')
  }, [results, mentorId])

  // 2. Extract dynamic classes list assigned to mentor
  const availableClasses = useMemo(() => {
    const classSet = new Set(mentorAssignedResults.map((r) => r.classBatch))
    return Array.from(classSet).sort()
  }, [mentorAssignedResults])

  // 3. Extract dynamic exams list assigned to mentor's classes
  const availableExams = useMemo(() => {
    const examSet = new Set(mentorAssignedResults.map((r) => r.subject))
    return Array.from(examSet).sort()
  }, [mentorAssignedResults])

  // 4. Dynamic statistics calculation
  const stats: ResultsOverviewStats = useMemo(() => {
    const total = mentorAssignedResults.length
    const published = mentorAssignedResults.filter((r) => r.status === 'published').length
    const pending = mentorAssignedResults.filter((r) => r.status === 'pending' || r.status === 'draft').length
    
    const avgScore =
      total > 0
        ? Math.round(
            mentorAssignedResults.reduce((sum, r) => sum + r.percentage, 0) / total,
          )
        : 0

    return {
      total,
      published,
      pending,
      averageScore: avgScore,
    }
  }, [mentorAssignedResults])

  // 5. Filtered results based on search, status tab, class, and exam dropdowns
  const filteredResults = useMemo(() => {
    return mentorAssignedResults.filter((r) => {
      // Status tab filter
      if (activeTab === 'published' && r.status !== 'published') return false
      if (activeTab === 'pending' && r.status !== 'pending' && r.status !== 'draft') return false
      if (activeTab === 'failed' && r.status !== 'failed' && r.grade !== 'F') return false

      // Class dropdown filter
      if (selectedClass !== 'all' && r.classBatch !== selectedClass) return false

      // Exam dropdown filter
      if (selectedExam !== 'all' && r.subject !== selectedExam) return false

      // Search query filter
      const q = searchQuery.toLowerCase().trim()
      if (q) {
        const matchesName = r.studentName.toLowerCase().includes(q)
        const matchesId = r.studentId.toLowerCase().includes(q)
        const matchesExam = r.examName.toLowerCase().includes(q)
        const matchesSubject = r.subject.toLowerCase().includes(q)
        const matchesClass = r.classBatch.toLowerCase().includes(q)
        const matchesGrade = r.grade.toLowerCase().includes(q)

        if (
          !matchesName &&
          !matchesId &&
          !matchesExam &&
          !matchesSubject &&
          !matchesClass &&
          !matchesGrade
        ) {
          return false
        }
      }

      return true
    })
  }, [mentorAssignedResults, activeTab, selectedClass, selectedExam, searchQuery])

  // 6. Pagination calculation
  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredResults.slice(start, start + pageSize)
  }, [filteredResults, currentPage, pageSize])

  // Retry handler
  const handleRetry = () => {
    setError(null)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 450)
  }

  // Create or update result
  const saveResult = (resultData: Omit<StudentResult, 'id' | 'mentorId'>) => {
    const newResult: StudentResult = {
      ...resultData,
      id: `res-${Date.now()}`,
      mentorId,
    }
    setResults((prev) => [newResult, ...prev])
  }

  // Publish a result
  const publishResult = (id: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'published',
              publishedDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            }
          : r,
      ),
    )
  }

  return {
    results: paginatedResults,
    allFilteredResults: filteredResults,
    totalCount: filteredResults.length,
    stats,
    availableClasses,
    availableExams,
    activeTab,
    setActiveTab: (t: ResultsFilterTab) => {
      setActiveTab(t)
      setCurrentPage(1)
    },
    selectedClass,
    setSelectedClass: (c: string) => {
      setSelectedClass(c)
      setCurrentPage(1)
    },
    selectedExam,
    setSelectedExam: (e: string) => {
      setSelectedExam(e)
      setCurrentPage(1)
    },
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setCurrentPage(1)
    },
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    loading,
    error,
    handleRetry,
    saveResult,
    publishResult,
  }
}

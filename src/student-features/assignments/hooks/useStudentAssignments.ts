import { useMemo, useState } from 'react'
import {
  MOCK_TASKS_DATA,
  type AssignmentStats,
  type StudentTask,
  type TaskStatus,
  type TaskType,
} from '../data/assignmentsData'

export function useStudentAssignments() {
  const [tasks, setTasks] = useState<StudentTask[]>(MOCK_TASKS_DATA)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [typeTab, setTypeTab] = useState<'all' | TaskType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [courseFilter, setCourseFilter] = useState<string>('All')

  // Modals
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState<StudentTask | null>(null)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false)

  const [selectedTaskForQuiz, setSelectedTaskForQuiz] = useState<StudentTask | null>(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false)

  const [selectedTaskForFeedback, setSelectedTaskForFeedback] = useState<StudentTask | null>(null)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false)

  // Open / Close Modals
  const openSubmitModal = (task: StudentTask) => {
    setSelectedTaskForSubmission(task)
    setIsSubmitModalOpen(true)
  }

  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false)
    setSelectedTaskForSubmission(null)
  }

  const openQuizModal = (task: StudentTask) => {
    setSelectedTaskForQuiz(task)
    setIsQuizModalOpen(true)
  }

  const closeQuizModal = () => {
    setIsQuizModalOpen(false)
    setSelectedTaskForQuiz(null)
  }

  const openFeedbackModal = (task: StudentTask) => {
    setSelectedTaskForFeedback(task)
    setIsFeedbackModalOpen(true)
  }

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false)
    setSelectedTaskForFeedback(null)
  }

  // Submit Assignment
  const handleAssignmentSubmission = (taskId: string, repoUrl: string, notes: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'submitted',
            submittedAt: 'Just now',
            submittedRepoUrl: repoUrl || undefined,
            submittedNotes: notes || 'Submitted solution',
          }
        }
        return t
      })
    )
    closeSubmitModal()
  }

  // Submit Quiz Result
  const handleQuizCompletion = (taskId: string, earnedPoints: number, totalPoints: number) => {
    const percentage = Math.round((earnedPoints / totalPoints) * 100)
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'graded',
            score: `${earnedPoints}/${totalPoints}`,
            scorePercentage: percentage,
            submittedAt: 'Just now',
            feedbackNotes: percentage >= 80
              ? 'Great job! You showed strong mastery of the concepts.'
              : 'Good effort! Review the module notes for further improvement.',
          }
        }
        return t
      })
    )
    closeQuizModal()
  }

  // Available Courses list for dropdown
  const availableCourses = useMemo(() => {
    const coursesSet = new Set<string>()
    tasks.forEach((t) => coursesSet.add(t.course))
    return ['All', ...Array.from(coursesSet)]
  }, [tasks])

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Type Tab Filter
      if (typeTab !== 'all' && task.type !== typeTab) return false

      // Status Filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false

      // Course Filter
      if (courseFilter !== 'All' && task.course !== courseFilter) return false

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const matchTitle = task.title.toLowerCase().includes(query)
        const matchCourse = task.course.toLowerCase().includes(query)
        const matchMentor = task.mentorName.toLowerCase().includes(query)
        if (!matchTitle && !matchCourse && !matchMentor) return false
      }

      return true
    })
  }, [tasks, typeTab, statusFilter, courseFilter, searchQuery])

  // Stats calculation
  const stats: AssignmentStats = useMemo(() => {
    const totalTasks = tasks.length
    const pendingCount = tasks.filter((t) => t.status === 'pending').length
    const dueTodayCount = tasks.filter((t) => t.isDueToday && t.status === 'pending').length
    const submittedCount = tasks.filter((t) => t.status === 'submitted').length
    const gradedTasks = tasks.filter((t) => t.status === 'graded' && t.scorePercentage !== undefined)
    const gradedCount = gradedTasks.length
    const averageScore = gradedCount > 0
      ? Math.round(gradedTasks.reduce((acc, t) => acc + (t.scorePercentage || 0), 0) / gradedCount)
      : 95

    return {
      totalTasks,
      pendingCount,
      dueTodayCount,
      submittedCount,
      gradedCount,
      averageScore,
    }
  }, [tasks])

  return {
    tasks: filteredTasks,
    stats,
    searchQuery,
    setSearchQuery,
    typeTab,
    setTypeTab,
    statusFilter,
    setStatusFilter,
    courseFilter,
    setCourseFilter,
    availableCourses,
    // Modal states & openers
    selectedTaskForSubmission,
    isSubmitModalOpen,
    openSubmitModal,
    closeSubmitModal,
    handleAssignmentSubmission,

    selectedTaskForQuiz,
    isQuizModalOpen,
    openQuizModal,
    closeQuizModal,
    handleQuizCompletion,

    selectedTaskForFeedback,
    isFeedbackModalOpen,
    openFeedbackModal,
    closeFeedbackModal,
  }
}

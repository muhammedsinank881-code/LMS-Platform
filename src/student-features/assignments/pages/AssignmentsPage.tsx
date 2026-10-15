import { useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Card } from '@/components/ui'
import { AssignmentCard } from '../components/AssignmentCard'
import { AssignmentFilters } from '../components/AssignmentFilters'
import { AssignmentsStatsOverview } from '../components/AssignmentsStatsOverview'
import { FeedbackModal } from '../components/FeedbackModal'
import { QuizAttemptModal } from '../components/QuizAttemptModal'
import { QuizCard } from '../components/QuizCard'
import { SubmitAssignmentModal } from '../components/SubmitAssignmentModal'
import { useStudentAssignments } from '../hooks/useStudentAssignments'

export function AssignmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTaskId = searchParams.get('id')
  const {
    allTasks,
    tasks,
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
  } = useStudentAssignments()

  const selectedTask = requestedTaskId
    ? allTasks.find((task) => task.id === requestedTaskId)
    : undefined

  useEffect(() => {
    if (!requestedTaskId || !selectedTask || selectedTask.status !== 'pending') return

    if (selectedTask.type === 'quiz') openQuizModal(selectedTask)
    else openSubmitModal(selectedTask)

    setSearchParams((currentParams) => {
      currentParams.delete('id')
      return currentParams
    }, { replace: true })
  }, [openQuizModal, openSubmitModal, requestedTaskId, selectedTask, setSearchParams])

  const clearTaskSelection = () => {
    setSearchParams((currentParams) => {
      currentParams.delete('id')
      return currentParams
    }, { replace: true })
  }

  const selectionMessage = requestedTaskId
    ? !selectedTask
      ? 'Assignment not found. It may have been removed or is no longer available.'
      : selectedTask.status !== 'pending'
        ? 'This task is not currently available for submission.'
        : null
    : null

  const handleResetFilters = () => {
    setSearchQuery('')
    setTypeTab('all')
    setStatusFilter('all')
    setCourseFilter('All')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Assignments & Quizzes"
        description="Track your pending tasks, upcoming quizzes, due dates, and mentor feedback."
      />

      {selectionMessage ? (
        <Card role="status" className="flex flex-wrap items-center justify-between gap-3 border-dashed p-4">
          <p className="text-sm text-muted-foreground">{selectionMessage}</p>
          <Button variant="outline" size="sm" onClick={clearTaskSelection}>
            View all assignments & quizzes
          </Button>
        </Card>
      ) : null}

      <AssignmentsStatsOverview stats={stats} />
      <AssignmentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeTab={typeTab}
        onTypeTabChange={setTypeTab}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        courseFilter={courseFilter}
        onCourseFilterChange={setCourseFilter}
        availableCourses={availableCourses}
        totalCount={tasks.length}
      />
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) =>
            task.type === 'quiz' ? (
              <QuizCard
                key={task.id}
                task={task}
                onOpenQuiz={openQuizModal}
                onOpenFeedback={openFeedbackModal}
              />
            ) : (
              <AssignmentCard
                key={task.id}
                task={task}
                onOpenSubmit={openSubmitModal}
                onOpenFeedback={openFeedbackModal}
              />
            )
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">No tasks found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No assignments or quizzes match your current search query or filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="mt-4 text-xs"
          >
            Reset Filters & Search
          </Button>
        </div>
      )}

      {/* Interactive Modals */}
      <SubmitAssignmentModal
        task={selectedTaskForSubmission}
        open={isSubmitModalOpen}
        onOpenChange={closeSubmitModal}
        onSubmit={handleAssignmentSubmission}
      />

      <QuizAttemptModal
        task={selectedTaskForQuiz}
        open={isQuizModalOpen}
        onOpenChange={closeQuizModal}
        onCompleteQuiz={handleQuizCompletion}
      />

      <FeedbackModal
        task={selectedTaskForFeedback}
        open={isFeedbackModalOpen}
        onOpenChange={closeFeedbackModal}
      />
    </div>
  )
}

export default AssignmentsPage

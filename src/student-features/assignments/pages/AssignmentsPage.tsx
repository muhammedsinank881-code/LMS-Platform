import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui'
import { AssignmentCard } from '../components/AssignmentCard'
import { AssignmentFilters } from '../components/AssignmentFilters'
import { AssignmentsStatsOverview } from '../components/AssignmentsStatsOverview'
import { FeedbackModal } from '../components/FeedbackModal'
import { QuizAttemptModal } from '../components/QuizAttemptModal'
import { QuizCard } from '../components/QuizCard'
import { SubmitAssignmentModal } from '../components/SubmitAssignmentModal'
import { useStudentAssignments } from '../hooks/useStudentAssignments'

export function AssignmentsPage() {
  const {
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

      {/* Top 5 Stats Cards Overview */}
      <AssignmentsStatsOverview stats={stats} />

      {/* Filters, Tabs & Search Bar */}
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

      {/* Tasks List Grid */}
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
        /* Empty State */
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

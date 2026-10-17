import { useMemo, useState } from 'react'
import { FileQuestion, Plus } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  CreateQuizModal,
  QuizCard,
  QuizFilterToolbar,
  QuizStatsCards,
} from '../components'
import { useQuizzes } from '../hooks/useQuizzes'
import type { QuizItem, QuizStatus } from '../types'

export function QuizzesPage() {
  const { quizzes, stats, createQuiz, deleteQuiz } = useQuizzes()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | QuizStatus>('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Status counts for tabs
  const counts = useMemo(() => {
    return {
      all: quizzes.length,
      active: quizzes.filter((q) => q.status === 'active').length,
      draft: quizzes.filter((q) => q.status === 'draft').length,
      completed: quizzes.filter((q) => q.status === 'completed').length,
      scheduled: quizzes.filter((q) => q.status === 'scheduled').length,
    }
  }, [quizzes])

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        quiz.title.toLowerCase().includes(q) ||
        quiz.classBatch.toLowerCase().includes(q) ||
        quiz.subject.toLowerCase().includes(q)

      const matchesStatus =
        selectedStatus === 'all' || quiz.status === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [quizzes, searchQuery, selectedStatus])

  const handleCreateQuiz = (
    quizData: Omit<QuizItem, 'id' | 'createdAt' | 'submissionsCount' | 'averageScore'>,
  ) => {
    createQuiz(quizData)
  }

  const handleDeleteQuiz = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      deleteQuiz(id)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-foreground">
      {/* Page Header */}
      <PageHeader
        title="Quizzes"
        description="Create, manage, publish and evaluate quizzes for your classes"
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Quizzes' },
        ]}
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3.5 cursor-pointer font-semibold shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" aria-hidden="true" />
            <span>Create Quiz</span>
          </Button>
        }
      />

      {/* 4 Stat Cards */}
      <QuizStatsCards stats={stats} />

      {/* Search & Filter Toolbar */}
      <QuizFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        counts={counts}
      />

      {/* Quiz List Cards */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredQuizzes.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center space-y-3 bg-surface border-dashed">
            <div className="h-12 w-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto">
              <FileQuestion className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                No quizzes found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || selectedStatus !== 'all'
                  ? 'No quizzes match your current search or status filter. Try resetting filters.'
                  : 'Get started by creating your first quiz for your students.'}
              </p>
            </div>
            {searchQuery || selectedStatus !== 'all' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedStatus('all')
                }}
                className="text-xs cursor-pointer"
              >
                Reset Filters
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="text-xs cursor-pointer font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                <span>Create Your First Quiz</span>
              </Button>
            )}
          </Card>
        ) : (
          filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onDelete={handleDeleteQuiz}
            />
          ))
        )}
      </div>

      {/* Create Quiz Modal */}
      <CreateQuizModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreateQuiz}
      />
    </div>
  )
}

export default QuizzesPage

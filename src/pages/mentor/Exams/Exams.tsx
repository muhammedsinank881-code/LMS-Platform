import { useState } from 'react'
import {
  CreateExamModal,
  ExamClassFilter,
  ExamEmptyState,
  ExamErrorState,
  ExamFilterTabs,
  ExamHeader,
  ExamOverview,
  ExamSearch,
  ExamSectionGroup,
  ExamSkeleton,
} from './components'
import { useMentorExams } from './useMentorExams'

export function Exams() {
  const {
    exams,
    totalCount,
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
  } = useMentorExams()

  const [createModalOpen, setCreateModalOpen] = useState(false)

  const isFilterActive = searchQuery.trim() !== '' || activeTab !== 'all' || selectedClass !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setActiveTab('all')
    setSelectedClass('all')
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* 1. Header Section */}
      <ExamHeader onOpenCreateModal={() => setCreateModalOpen(true)} />

      {/* 2. Compact Dynamic Exam Overview */}
      <ExamOverview stats={stats} />

      {/* 3. Search Toolbar */}
      <ExamSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 4. Filter Tabs */}
      <ExamFilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
      />

      {/* 5. Class Dropdown & Count Indicator */}
      <ExamClassFilter
        availableClasses={availableClasses}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        totalExamsCount={totalCount}
      />

      {/* 6. Content Area: Loading / Error / Empty / Grouped Sections */}
      {loading ? (
        <ExamSkeleton />
      ) : error ? (
        <ExamErrorState onRetry={handleRetry} />
      ) : exams.length === 0 ? (
        <ExamEmptyState
          isFilterActive={isFilterActive}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className="space-y-6 pt-1">
          {/* Section 1: Today's Exams */}
          <ExamSectionGroup
            title="Today's Exams"
            count={todayExams.length}
            exams={todayExams}
          />

          {/* Section 2: Upcoming Exams */}
          <ExamSectionGroup
            title="Upcoming Exams"
            count={upcomingExams.length}
            exams={upcomingExams}
          />

          {/* Section 3: Results Pending */}
          <ExamSectionGroup
            title="Results Pending"
            count={resultsPendingExams.length}
            exams={resultsPendingExams}
          />

          {/* Section 4: Completed Exams */}
          <ExamSectionGroup
            title="Completed Exams"
            count={completedExams.length}
            exams={completedExams}
          />
        </div>
      )}

      {/* 7. Create Exam Modal */}
      <CreateExamModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        availableClasses={availableClasses}
        onCreateExam={createExam}
      />
    </div>
  )
}

export default Exams

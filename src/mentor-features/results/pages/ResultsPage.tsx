import { useState } from 'react'
import {
  EnterResultModal,
  ResultCard,
  ResultTable,
  ResultsDropdownFilters,
  ResultsEmptyState,
  ResultsErrorState,
  ResultsFilterTabs,
  ResultsHeader,
  ResultsOverview,
  ResultsPagination,
  ResultsSearch,
  ResultsSkeleton,
} from '../components'
import { useMentorResults } from '../hooks/useMentorResults'

export function ResultsPage() {
  const {
    results,
    allFilteredResults,
    totalCount,
    stats,
    availableClasses,
    availableExams,
    activeTab,
    setActiveTab,
    selectedClass,
    setSelectedClass,
    selectedExam,
    setSelectedExam,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    loading,
    error,
    handleRetry,
    saveResult,
  } = useMentorResults({ pageSize: 8 })

  const [enterModalOpen, setEnterModalOpen] = useState(false)

  const isFilterActive =
    searchQuery.trim() !== '' ||
    activeTab !== 'all' ||
    selectedClass !== 'all' ||
    selectedExam !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setActiveTab('all')
    setSelectedClass('all')
    setSelectedExam('all')
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* 1. Header Section */}
      <ResultsHeader onOpenEnterModal={() => setEnterModalOpen(true)} />

      {/* 2. Compact Dynamic Results Overview */}
      <ResultsOverview stats={stats} />

      {/* 3. Search Bar */}
      <ResultsSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 4. Filter Tabs */}
      <ResultsFilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
      />

      {/* 5. Class & Exam Dropdown Filters */}
      <ResultsDropdownFilters
        availableClasses={availableClasses}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        availableExams={availableExams}
        selectedExam={selectedExam}
        onExamChange={setSelectedExam}
        totalCount={totalCount}
      />

      {/* 6. Content Section: Loading / Error / Empty / Table & Cards */}
      {loading ? (
        <ResultsSkeleton />
      ) : error ? (
        <ResultsErrorState onRetry={handleRetry} />
      ) : results.length === 0 ? (
        <ResultsEmptyState
          isFilterActive={isFilterActive}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className="space-y-4 pt-1">
          {/* Desktop Results Table */}
          <ResultTable results={results} />

          {/* Mobile Results Cards List */}
          <div className="md:hidden space-y-3">
            {results.map((res) => (
              <ResultCard key={res.id} result={res} />
            ))}
          </div>

          {/* Pagination Controls */}
          <ResultsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={allFilteredResults.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* 7. Enter Result Modal */}
      <EnterResultModal
        open={enterModalOpen}
        onOpenChange={setEnterModalOpen}
        availableClasses={availableClasses}
        availableExams={availableExams}
        onSaveResult={saveResult}
      />
    </div>
  )
}

export const Results = ResultsPage
export default ResultsPage

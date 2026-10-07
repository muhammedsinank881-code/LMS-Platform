import { useState } from 'react'
import {
  AddClassModal,
  ClassEmptyState,
  ClassErrorState,
  ClassFilterTabs,
  ClassGrid,
  ClassHeader,
  ClassSearch,
  ClassSkeleton,
  ClassSummary,
} from '../components'
import { useMentorClasses } from '../hooks/useMentorClasses'

export function MyClassesPage() {
  const {
    classes,
    stats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    handleRetry,
    addClass,
  } = useMentorClasses()

  const [addModalOpen, setAddModalOpen] = useState(false)

  const isSearchActive = searchQuery.trim() !== '' || activeTab !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setActiveTab('all')
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* 1. Header Section */}
      <ClassHeader onOpenAddModal={() => setAddModalOpen(true)} />

      {/* 2. Compact Dynamic Summary */}
      <ClassSummary stats={stats} />

      {/* 3. Filter Tabs & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Filter Tabs */}
        <ClassFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
        />

        {/* Search Input */}
        <div className="w-full md:w-80 shrink-0">
          <ClassSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>

      {/* 4. Content Area: Loading / Error / Empty / Grid */}
      {loading ? (
        <ClassSkeleton />
      ) : error ? (
        <ClassErrorState onRetry={handleRetry} />
      ) : classes.length === 0 ? (
        <ClassEmptyState
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <ClassGrid classes={classes} />
      )}

      {/* 5. Add Class Modal */}
      <AddClassModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddClass={addClass}
      />
    </div>
  )
}

export const MyClasses = MyClassesPage
export default MyClassesPage

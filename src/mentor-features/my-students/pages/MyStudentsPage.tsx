import { useState } from 'react'
import {
  MyStudentsEmptyState,
  MyStudentsErrorState,
  MyStudentsFilters,
  MyStudentsHeader,
  MyStudentsPagination,
  MyStudentsSkeleton,
  MyStudentsSummary,
  MyStudentsTable,
  StudentDetailsDrawer,
} from '../components'
import { useAssignedStudents } from '../hooks/useAssignedStudents'
import type { AssignedStudent } from '../types'

export function MyStudentsPage() {
  const {
    students,
    totalCount,
    stats,
    availableClasses,
    searchQuery,
    setSearchQuery,
    selectedClass,
    setSelectedClass,
    selectedStatus,
    setSelectedStatus,
    selectedAttendanceRange,
    setSelectedAttendanceRange,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    loading,
    error,
    handleRetry,
  } = useAssignedStudents({ pageSize: 10 })

  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null)

  const isSearchActive =
    searchQuery.trim() !== '' ||
    selectedClass !== 'all' ||
    selectedStatus !== 'all' ||
    selectedAttendanceRange !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedClass('all')
    setSelectedStatus('all')
    setSelectedAttendanceRange('all')
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* Page Header */}
      <MyStudentsHeader />

      {/* Summary Statistics Bar */}
      <MyStudentsSummary
        totalAssigned={stats.totalAssigned}
        classesCount={stats.classesCount}
        avgAttendance={stats.avgAttendance}
      />

      {/* Filters & Search Toolbar */}
      <MyStudentsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availableClasses={availableClasses}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedAttendanceRange={selectedAttendanceRange}
        onAttendanceRangeChange={setSelectedAttendanceRange}
      />

      {/* Content Section: Loading / Error / Empty / Data Table */}
      {loading ? (
        <MyStudentsSkeleton />
      ) : error ? (
        <MyStudentsErrorState onRetry={handleRetry} />
      ) : totalCount === 0 ? (
        <MyStudentsEmptyState
          isSearch={isSearchActive}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className="space-y-4 pt-1">
          <MyStudentsTable
            students={students}
            onSelectStudent={(student) => setSelectedStudent(student)}
          />

          <MyStudentsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Student Details Drawer */}
      <StudentDetailsDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  )
}

export default MyStudentsPage

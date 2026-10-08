import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CancelClassDialog } from '../components/CancelClassDialog'
import { ClassDetailsModal } from '../components/ClassDetailsModal'
import { RescheduleModal } from '../components/RescheduleModal'
import { ScheduleCalendar } from '../components/ScheduleCalendar'
import { ScheduleClassModal } from '../components/ScheduleClassModal'
import { ScheduleFilters } from '../components/ScheduleFilters'
import { ScheduleHeader } from '../components/ScheduleHeader'
import { TodaysScheduleCompact } from '../components/TodaysScheduleCompact'
import { UpcomingClassesList } from '../components/UpcomingClassesList'
import { useSchedule } from '../hooks/useSchedule'
import type { ScheduledClass } from '../types'

export function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    classes,
    todaysClasses,
    upcomingClasses,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    selectedClassDetails,
    setSelectedClassDetails,
    editingClass,
    setEditingClass,
    reschedulingClass,
    setReschedulingClass,
    cancellingClass,
    setCancellingClass,
    handleAddClass,
    handleUpdateClass,
    handleReschedule,
    handleCancelClass,
  } = useSchedule()

  // Open modal automatically if query param ?open=true or ?schedule=true
  useEffect(() => {
    if (searchParams.get('open') === 'true' || searchParams.get('schedule') === 'true') {
      setIsScheduleModalOpen(true)
      setSearchParams((params) => {
        params.delete('open')
        params.delete('schedule')
        return params
      })
    }
  }, [searchParams, setSearchParams, setIsScheduleModalOpen])

  return (
    <div className="space-y-6 text-foreground">
      {/* 1. Page Header */}
      <ScheduleHeader onOpenScheduleModal={() => setIsScheduleModalOpen(true)} />

      {/* 2. Today's Classes Compact Section */}
      <TodaysScheduleCompact
        classes={todaysClasses}
        onSelectClass={(cls) => setSelectedClassDetails(cls)}
      />

      {/* 3. Main Calendar View */}
      <ScheduleCalendar
        classes={classes}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onSelectClass={(cls) => setSelectedClassDetails(cls)}
      />

      {/* 4. Filters Bar */}
      <ScheduleFilters
        filters={filters}
        onFiltersChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        totalCount={classes.length}
      />

      {/* 5. Upcoming Classes Cards Grid */}
      <UpcomingClassesList
        classes={upcomingClasses}
        onSelectClass={(cls) => setSelectedClassDetails(cls)}
        onEditClass={(cls) => setEditingClass(cls)}
        onRescheduleClass={(cls) => setReschedulingClass(cls)}
        onCancelClass={(cls) => setCancellingClass(cls)}
      />

      {/* 6. Schedule / Edit Class Modal */}
      <ScheduleClassModal
        open={isScheduleModalOpen || Boolean(editingClass)}
        onOpenChange={(open) => {
          if (!open) {
            setIsScheduleModalOpen(false)
            setEditingClass(null)
          }
        }}
        initialData={editingClass}
        onSubmit={(data) => {
          if (editingClass) {
            return handleUpdateClass(data as ScheduledClass)
          }
          return handleAddClass(data as Omit<ScheduledClass, 'id' | 'status'>)
        }}
      />

      {/* 7. Class Details Modal */}
      <ClassDetailsModal
        cls={selectedClassDetails}
        onClose={() => setSelectedClassDetails(null)}
        onEdit={(cls) => setEditingClass(cls)}
        onReschedule={(cls) => setReschedulingClass(cls)}
        onCancel={(cls) => setCancellingClass(cls)}
      />

      {/* 8. Dedicated Reschedule Modal */}
      <RescheduleModal
        cls={reschedulingClass}
        onClose={() => setReschedulingClass(null)}
        onReschedule={handleReschedule}
      />

      {/* 9. Cancel Confirmation Dialog */}
      <CancelClassDialog
        cls={cancellingClass}
        onClose={() => setCancellingClass(null)}
        onConfirmCancel={(id) => handleCancelClass(id)}
      />
    </div>
  )
}

export const Schedule = SchedulePage
export default SchedulePage

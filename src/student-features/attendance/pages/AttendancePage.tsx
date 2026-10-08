import { PageHeader } from '@/components/layout/PageHeader'
import { AttendanceSummary } from '../components/AttendanceSummary'
import { AttendanceCalendar } from '../components/AttendanceCalendar'
import { AttendanceDayDetails } from '../components/AttendanceDayDetails'
import { AttendanceFilters } from '../components/AttendanceFilters'
import { useAttendanceHistory } from '../hooks/useAttendanceHistory'
import { AttendanceDailyActivity } from '../components/Attendancedailyactivity'

export function AttendancePage() {
  const {
    records,
    selectedDate,
    setSelectedDate,
    selectedRecord,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    summary,
  } = useAttendanceHistory()

  return (
    <div className="space-y-4 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Attendance History"
        description="Monitor your daily login sessions, check-in times, platform hours, and overall attendance rate."
      />

      {/* Summary Stats & Progress Bar */}
      <AttendanceSummary summary={summary} />

      {/* Search & Filter Controls */}
      <AttendanceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={records.length}
      />

      {/* Main Content — Two Column Layout on large screens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        {/* Left: Daily log list — takes 3 of 5 cols */}
        <div className="lg:col-span-3">
          <AttendanceCalendar
            records={records}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Right: Day Detail Panel — takes 2 of 5 cols, sticky on desktop */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            <AttendanceDayDetails record={selectedRecord} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            <AttendanceDailyActivity
              displayDate={selectedRecord?.displayDate}
              activities={selectedRecord?.activities ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendancePage

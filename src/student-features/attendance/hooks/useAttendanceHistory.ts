import { useState, useMemo } from 'react'
import {
  MOCK_ATTENDANCE_RECORDS,
  MOCK_ATTENDANCE_SUMMARY,
  type AttendanceDayRecord,
  type DayStatus,
} from '../data/attendanceData'

export type MonthFilter = string  // e.g. "2026-10"

export function useAttendanceHistory() {
  const [selectedDate, setSelectedDate] = useState<string>(MOCK_ATTENDANCE_RECORDS[0]?.date ?? '')
  const [statusFilter, setStatusFilter] = useState<'all' | DayStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const selectedRecord = useMemo<AttendanceDayRecord | null>(() => {
    return MOCK_ATTENDANCE_RECORDS.find((r) => r.date === selectedDate) ?? null
  }, [selectedDate])

  const filteredRecords = useMemo(() => {
    return MOCK_ATTENDANCE_RECORDS.filter((record) => {
      if (statusFilter !== 'all' && record.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (
          !record.displayDate.toLowerCase().includes(q) &&
          !record.dayOfWeek.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [statusFilter, searchQuery])

  const summary = MOCK_ATTENDANCE_SUMMARY

  return {
    records: filteredRecords,
    allRecords: MOCK_ATTENDANCE_RECORDS,
    selectedDate,
    setSelectedDate,
    selectedRecord,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    summary,
  }
}

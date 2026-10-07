import { useState } from 'react'
import { BookOpen, Clock, MapPin } from 'lucide-react'

interface TimetableSlot {
  id: string
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  time: string
  subject: string
  classBatch: string
  location: string
}

const MOCK_SCHEDULE: TimetableSlot[] = [
  {
    id: 't-1',
    day: 'Monday',
    time: '09:00 AM - 10:30 AM',
    subject: 'Web Development & React Lab',
    classBatch: 'BCA - 3rd Year',
    location: 'Lab 204 (CS Block)',
  },
  {
    id: 't-2',
    day: 'Monday',
    time: '11:00 AM - 12:30 PM',
    subject: 'Python Data Structures',
    classBatch: 'BCA - 4th Semester',
    location: 'Hall A (Main Block)',
  },
  {
    id: 't-3',
    day: 'Tuesday',
    time: '02:00 PM - 03:30 PM',
    subject: 'Capstone Project Mentoring Session',
    classBatch: 'BCA - 3rd Year',
    location: 'Discussion Room 3',
  },
  {
    id: 't-4',
    day: 'Wednesday',
    time: '09:30 AM - 11:00 AM',
    subject: 'Database Management Systems',
    classBatch: 'BCA - 2nd Year',
    location: 'Hall B (CS Block)',
  },
  {
    id: 't-5',
    day: 'Thursday',
    time: '11:00 AM - 12:30 PM',
    subject: 'Web Development & React Lab',
    classBatch: 'BCA - 3rd Year',
    location: 'Lab 204 (CS Block)',
  },
  {
    id: 't-6',
    day: 'Friday',
    time: '10:00 AM - 11:30 AM',
    subject: 'Python Data Structures',
    classBatch: 'BCA - 4th Semester',
    location: 'Hall A (Main Block)',
  },
]

export function Timetable() {
  const [selectedDay, setSelectedDay] = useState<string>('Monday')
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const filteredSchedule = MOCK_SCHEDULE.filter((slot) => slot.day === selectedDay)

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-[#17324D] dark:text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Teaching Timetable</h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          View your weekly lecture schedule, lab sessions and mentoring office hours
        </p>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E2E8F0] dark:border-border">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 border-b-2 ${
              selectedDay === day
                ? 'border-[#0F9F83] text-[#0F9F83] bg-[#E8F7F3]/40 dark:bg-[#0F9F83]/10'
                : 'border-transparent text-[#64748B] hover:text-[#17324D] dark:hover:text-foreground'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Slots List */}
      <div className="space-y-3">
        {filteredSchedule.length === 0 ? (
          <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-8 text-center text-xs text-[#64748B]">
            No sessions scheduled for {selectedDay}.
          </div>
        ) : (
          filteredSchedule.map((slot) => (
            <div
              key={slot.id}
              className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-[#0F9F83]/40 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#E8F7F3] text-[#0F9F83] flex items-center justify-center shrink-0 font-bold">
                  <Clock className="size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-xs font-bold text-[#0F9F83]">
                    {slot.time}
                  </div>
                  <h3 className="text-base font-bold text-[#17324D] dark:text-foreground truncate leading-tight">
                    {slot.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-slate-400">
                    <span className="font-semibold text-[#17324D] dark:text-foreground flex items-center gap-1">
                      <BookOpen className="size-3.5 text-[#0F9F83]" />
                      {slot.classBatch}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {slot.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Timetable

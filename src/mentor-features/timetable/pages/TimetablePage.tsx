import { useState } from 'react'
import { BookOpen, Clock, MapPin } from 'lucide-react'
import { Card } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/PageHeader'

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

export function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState<string>('Monday')
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const filteredSchedule = MOCK_SCHEDULE.filter((slot) => slot.day === selectedDay)

  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <PageHeader
        title="Teaching Timetable"
        description="View your weekly lecture schedule, lab sessions and mentoring office hours"
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Timetable' },
        ]}
      />

      {/* Days Tabs */}
      <Tabs value={selectedDay} onValueChange={setSelectedDay} variant="pill">
        <TabsList>
          {days.map((day) => (
            <TabsTrigger key={day} value={day}>
              {day}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Schedule Slots List */}
      <div className="space-y-3">
        {filteredSchedule.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            No sessions scheduled for {selectedDay}.
          </Card>
        ) : (
          filteredSchedule.map((slot) => (
            <Card
              key={slot.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-11 h-11 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 font-bold">
                  <Clock className="size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-xs font-bold text-primary">
                    {slot.time}
                  </div>
                  <h3 className="text-base font-bold text-foreground truncate leading-tight">
                    {slot.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <BookOpen className="size-3.5 text-primary" />
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
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export const Timetable = TimetablePage
export default TimetablePage

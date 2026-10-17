import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Megaphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { MobileSummaryCarousel } from './MobileSummaryCarousel'
import { MobileAttendanceAndTasks } from './MobileAttendanceAndTasks'
import { MobileNeedsAttention } from './MobileNeedsAttention'
import { MobileNextClassCard } from './MobileNextClassCard'
import { MobileQuickActions } from './MobileQuickActions'
import { MobileScheduleTimeline } from './MobileScheduleTimeline'
import { MobileUpcomingDeadlines } from './MobileUpcomingDeadlines'
import { RecentClassesGrid } from '../RecentClassesGrid'
import { AnnouncementDetailsModal } from '../AnnouncementDetailsModal'
import type {
  AnnouncementItem,
  RecentClassItem,
  ScheduleItem,
} from '../../types'

interface MobileDashboardViewProps {
  totalStudents: number
  allClassesCount: number
  activeClassesCount: number
  attendanceRate: number
  syllabusProgress?: number
  schedule: ScheduleItem[]
  recentClasses: RecentClassItem[]
  announcements: AnnouncementItem[]
}

export function MobileDashboardView({
  totalStudents,
  allClassesCount,
  activeClassesCount,
  attendanceRate,
  syllabusProgress,
  schedule,
  recentClasses,
  announcements,
}: MobileDashboardViewProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementItem | null>(null)

  // Determine next class from schedule
  const nextClass =
    schedule.find((s) => s.status === 'ongoing') ||
    schedule.find((s) => s.status === 'upcoming') ||
    schedule[0]

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* 1. Horizontal Summary / Feature Cards */}
      <MobileSummaryCarousel
        totalStudents={totalStudents}
        allClassesCount={allClassesCount}
        activeClassesCount={activeClassesCount}
        attendanceRate={attendanceRate}
        syllabusProgress={syllabusProgress}
      />

      {/* 2. Attendance Rate + Pending Tasks (2 side-by-side cards) */}
      <MobileAttendanceAndTasks
        attendanceRate={attendanceRate}
        pendingAssignmentsCount={2}
        pendingAttendanceCount={1}
      />

      {/* 3. Needs Attention */}
      <MobileNeedsAttention
        pendingSubmissionsCount={18}
        unverifiedAttendanceCount={1}
        draftResultsCount={2}
      />

      {/* 4. Next Class */}
      <MobileNextClassCard nextClass={nextClass} />

      {/* 5. Quick Actions */}
      <MobileQuickActions />

      {/* 6. Today's Schedule */}
      <MobileScheduleTimeline schedule={schedule} />

      {/* 7. Upcoming Deadlines */}
      <MobileUpcomingDeadlines />

      {/* 8. Announcements */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase text-muted-foreground/90">
            Announcements
          </h2>
          <Link
            to="/mentor/announcements"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {announcements.slice(0, 2).map((item) => (
            <Card
              key={item.id}
              onClick={() => setSelectedAnnouncement(item)}
              className="bg-surface border-border shadow-2xs rounded-xl hover:border-primary/40 transition-all cursor-pointer select-none group"
            >
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Megaphone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-[10px] font-bold text-primary truncate">
                      {item.category || 'Academic Notice'}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {item.date}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                {item.content && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 9. Recent Classes */}
      <div className="pt-1">
        <RecentClassesGrid classes={recentClasses} />
      </div>

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <AnnouncementDetailsModal
          announcement={selectedAnnouncement}
          open={!!selectedAnnouncement}
          onOpenChange={(open) => {
            if (!open) setSelectedAnnouncement(null)
          }}
        />
      )}
    </div>
  )
}

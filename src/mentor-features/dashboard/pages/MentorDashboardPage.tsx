import { AnnouncementsCard } from '../components/AnnouncementsCard'
import { MentorWelcomeBanner } from '../components/MentorWelcomeBanner'
import { QuickActionsGrid } from '../components/QuickActionsGrid'
import { RecentClassesGrid } from '../components/RecentClassesGrid'
import { TodayScheduleTimeline } from '../components/TodayScheduleTimeline'
import type {
  AnnouncementItem,
  QuickActionItem,
  RecentClassItem,
  ScheduleItem,
} from '../types'

const MOCK_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'act-1',
    label: 'Take Attendance',
    iconName: 'attendance',
    colorTone: 'emerald',
  },
  {
    id: 'act-2',
    label: 'Create Assignment',
    iconName: 'assignment',
    colorTone: 'blue',
  },
  {
    id: 'act-3',
    label: 'Upload Material',
    iconName: 'upload',
    colorTone: 'amber',
  },
  {
    id: 'act-4',
    label: 'Schedule Class',
    iconName: 'schedule',
    colorTone: 'purple',
  },
]

const MOCK_TODAY_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch-1',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    title: 'Python Basics',
    course: 'BCA - 3rd Semester',
    location: 'Room 302',
    status: 'ongoing',
    iconType: 'code',
  },
  {
    id: 'sch-2',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    title: 'Web Development',
    course: 'BCA - 5th Semester',
    location: 'Online Class',
    status: 'upcoming',
    iconType: 'web',
  },
  {
    id: 'sch-3',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    title: 'Project Discussion',
    course: 'Final Year',
    location: 'Lab 1',
    status: 'upcoming',
    iconType: 'list',
  },
]

const MOCK_RECENT_CLASSES: RecentClassItem[] = [
  {
    id: 'cls-1',
    title: 'Python Basics',
    course: 'BCA - 3rd Semester',
    studentsCount: 32,
    iconType: 'code',
    bgAccent: 'blue',
  },
  {
    id: 'cls-2',
    title: 'Web Development',
    course: 'BCA - 5th Semester',
    studentsCount: 28,
    iconType: 'web',
    bgAccent: 'emerald',
  },
  {
    id: 'cls-3',
    title: 'Database Management',
    course: 'BCA - 4th Semester',
    studentsCount: 30,
    iconType: 'list',
    bgAccent: 'purple',
  },
  {
    id: 'cls-4',
    title: 'Data Structures & Algo',
    course: 'BCA - 3rd Semester',
    studentsCount: 35,
    iconType: 'code',
    bgAccent: 'blue',
  },
  {
    id: 'cls-5',
    title: 'Cloud Computing & DevOps',
    course: 'Final Year',
    studentsCount: 25,
    iconType: 'web',
    bgAccent: 'emerald',
  },
]

const MOCK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Internal Exam Schedule',
    date: '10 Oct 2026',
    category: 'Academic Notice',
    isPinned: true,
  },
  {
    id: 'ann-2',
    title: 'Capstone Final Project Submission',
    date: '15 Oct 2026',
    category: 'Project Evaluation',
  },
  {
    id: 'ann-3',
    title: 'Faculty & Mentors Review Meeting',
    date: '18 Oct 2026',
    category: 'Department Notice',
  },
]

export function MentorDashboardPage() {
  return (
    <div className="space-y-4 p-4 sm:p-5 max-w-[1500px] mx-auto min-h-screen">
      {/* 1. Mentor Welcome Header */}
      <MentorWelcomeBanner
        name="Prof. Alex Morgan"
        role="Lead Mentor"
        activeBatch="BCA Department - 2026"
      />

      {/* 2. Quick Actions Grid */}
      <QuickActionsGrid actions={MOCK_QUICK_ACTIONS} />

      {/* 3. Today's Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-4 sm:gap-5">
        <div className="lg:col-span-7 h-full">
          <TodayScheduleTimeline schedule={MOCK_TODAY_SCHEDULE} />
        </div>
        <div className="lg:col-span-5 h-full">
          <AnnouncementsCard announcements={MOCK_ANNOUNCEMENTS} />
        </div>
      </div>

      {/* 4. Recent Classes */}
      <div className="w-full pt-1">
        <RecentClassesGrid classes={MOCK_RECENT_CLASSES} />
      </div>
    </div>
  )
}

export default MentorDashboardPage

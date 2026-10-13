import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useMentorClasses } from '@/mentor-features/my-classes/hooks/useMentorClasses'
import { useSchedule } from '@/mentor-features/schedule/hooks/useSchedule'
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

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Internal Exam Schedule',
    date: '10 Oct 2026',
    category: 'Academic Notice',
    isPinned: true,
    author: 'Academic Controller',
    targetAudience: 'BCA Department (3rd & 5th Semester)',
    content:
      'The Mid-Term theory and lab internal examinations for BCA 3rd & 5th Semesters are scheduled to commence on 18th Oct 2026. Mentors are requested to verify student eligibility criteria and submit draft question banks by 14th Oct 2026.\n\nPlease ensure students have submitted all prior lab assignments and marked required attendance thresholds.',
    attachments: [
      {
        name: 'Internal_Exam_Schedule_Oct2026.pdf',
        url: '#',
        size: '1.4 MB',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'ann-2',
    title: 'Capstone Final Project Submission',
    date: '15 Oct 2026',
    category: 'Project Evaluation',
    author: 'Capstone Committee',
    targetAudience: 'BCA Final Year Students & Mentors',
    content:
      'Final phase capstone deliverables, GitHub repository links, and live production deployment URLs must be submitted through the Capstone Portal before 15 Oct 2026, 11:59 PM.\n\nMentors should schedule project evaluation interviews and complete code review scorecards before 20 Oct 2026.',
    attachments: [
      {
        name: 'Capstone_Evaluation_Rubric_2026.pdf',
        url: '#',
        size: '820 KB',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'ann-3',
    title: 'Faculty & Mentors Review Meeting',
    date: '18 Oct 2026',
    category: 'Department Notice',
    author: 'Dean of Academics',
    targetAudience: 'All Faculty & Mentors',
    content:
      'A quarterly mentor sync meeting with the Department Head is scheduled for 18th Oct 2026 at 04:00 PM in Conference Hall B to review student attendance, mid-term syllabus completion rates, and upcoming placement readiness.',
    attachments: [
      {
        name: 'Mentor_Review_Meeting_Agenda.docx',
        url: '#',
        size: '240 KB',
        type: 'doc',
      },
    ],
  },
]

export function MentorDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { classes: mentorClasses } = useMentorClasses()
  const { todaysClasses } = useSchedule()
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS)

  // Map mentorClasses hook data to RecentClassItem with backend IDs
  const recentClassesList: RecentClassItem[] = useMemo(() => {
    if (mentorClasses && mentorClasses.length > 0) {
      return mentorClasses.slice(0, 5).map((cls) => {
        let bgAccent: 'blue' | 'emerald' | 'purple' = 'blue'
        let iconType: 'code' | 'web' | 'list' = 'code'

        if (cls.iconType === 'web') {
          iconType = 'web'
          bgAccent = 'emerald'
        } else if (cls.iconType === 'database' || cls.iconType === 'cloud' || cls.iconType === 'mobile') {
          iconType = 'list'
          bgAccent = 'purple'
        } else {
          iconType = 'code'
          bgAccent = 'blue'
        }

        const shortTitle = cls.title.includes('&')
          ? cls.title.split('&')[0].trim()
          : cls.title

        return {
          id: cls.id,
          title: shortTitle,
          course: `${cls.program} - ${cls.semester}`,
          studentsCount: cls.studentsCount,
          iconType,
          bgAccent,
          courseCode: cls.courseCode,
          room: cls.room,
          status: cls.status,
          attendanceRate: cls.attendanceRate,
          syllabusProgress: cls.syllabusProgress,
        }
      })
    }

    return [
      {
        id: 'cls-104',
        title: 'Python Basics',
        course: 'BCA - 3rd Semester',
        studentsCount: 32,
        iconType: 'code',
        bgAccent: 'blue',
      },
      {
        id: 'cls-102',
        title: 'Web Development',
        course: 'BCA - 5th Semester',
        studentsCount: 28,
        iconType: 'web',
        bgAccent: 'emerald',
      },
      {
        id: 'cls-103',
        title: 'Database Management',
        course: 'BCA - 4th Semester',
        studentsCount: 30,
        iconType: 'list',
        bgAccent: 'purple',
      },
      {
        id: 'cls-101',
        title: 'Data Structures & Algo',
        course: 'BCA - 3rd Semester',
        studentsCount: 35,
        iconType: 'code',
        bgAccent: 'blue',
      },
      {
        id: 'cls-106',
        title: 'Cloud Computing & DevOps',
        course: 'Final Year',
        studentsCount: 25,
        iconType: 'web',
        bgAccent: 'emerald',
      },
    ]
  }, [mentorClasses])

  // Map todaysClasses hook data to ScheduleItem with backend IDs & class references
  const todayScheduleList: ScheduleItem[] = useMemo(() => {
    if (todaysClasses && todaysClasses.length > 0) {
      return todaysClasses.map((item) => {
        let iconType: 'code' | 'web' | 'list' = 'code'
        let classId = 'cls-104'

        if (item.title.toLowerCase().includes('web') || item.type === 'online') {
          iconType = 'web'
          classId = 'cls-102'
        } else if (
          item.title.toLowerCase().includes('capstone') ||
          item.title.toLowerCase().includes('project') ||
          item.title.toLowerCase().includes('database')
        ) {
          iconType = 'list'
          classId = 'cls-103'
        }

        const shortTitle = item.title.includes('&')
          ? item.title.split('&')[0].trim()
          : item.title.includes('Discussion')
            ? 'Project Discussion'
            : item.title

        return {
          id: item.id,
          classId,
          startTime: item.startTime,
          endTime: item.endTime,
          title: shortTitle,
          course: item.courseClass,
          location: item.type === 'online' ? 'Online Class' : (item.room || 'Room 302'),
          status: item.status === 'ongoing' ? 'ongoing' : 'upcoming',
          iconType,
          meetingLink: item.meetingLink,
          date: item.date,
          room: item.room,
          studentsCount: item.capacity,
          description: item.description,
        }
      })
    }

    return [
      {
        id: 'sch-101',
        classId: 'cls-104',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        title: 'Python Basics',
        course: 'BCA - 3rd Semester',
        location: 'Room 302',
        status: 'ongoing',
        iconType: 'code',
      },
      {
        id: 'sch-102',
        classId: 'cls-102',
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        title: 'Web Development',
        course: 'BCA - 5th Semester',
        location: 'Online Class',
        status: 'upcoming',
        iconType: 'web',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
      },
      {
        id: 'sch-103',
        classId: 'cls-103',
        startTime: '02:00 PM',
        endTime: '03:00 PM',
        title: 'Project Discussion',
        course: 'Final Year',
        location: 'Lab 1',
        status: 'upcoming',
        iconType: 'list',
      },
    ]
  }, [todaysClasses])

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  const handleEditAnnouncement = (updated: AnnouncementItem) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }

  return (
    <div className="space-y-6">
      {/* 1. Mentor Welcome Header */}
      <MentorWelcomeBanner
        name={user?.name || 'Prof. Alex Morgan'}
        title="Lead Mentor"
        activeBatch="BCA Department - 2026"
      />

      {/* 2. Quick Actions Grid */}
      <QuickActionsGrid actions={MOCK_QUICK_ACTIONS} />

      {/* 3. Today's Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-4 sm:gap-5">
        <div className="lg:col-span-7 h-full">
          <TodayScheduleTimeline schedule={todayScheduleList} />
        </div>
        <div className="lg:col-span-5 h-full">
          <AnnouncementsCard
            announcements={announcements}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onEditAnnouncement={handleEditAnnouncement}
          />
        </div>
      </div>

      {/* 4. Recent Classes */}
      <div className="w-full pt-1">
        <RecentClassesGrid classes={recentClassesList} />
      </div>
    </div>
  )
}

export default MentorDashboardPage

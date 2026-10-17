import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AnnouncementsCard } from '../components/AnnouncementsCard'
import { DashboardSummaryCards } from '../components/DashboardSummaryCards'
import { RecentClassesGrid } from '../components/RecentClassesGrid'
import { TodayScheduleTimeline } from '../components/TodayScheduleTimeline'
import type { AnnouncementItem, RecentClassItem, ScheduleItem } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Mentor Dashboard Interactive Sections', () => {
  describe('TodayScheduleTimeline', () => {
    const mockSchedule: ScheduleItem[] = [
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
    ]

    it('renders Today Schedule header and View All link pointing to /mentor/schedule', () => {
      render(
        <MemoryRouter>
          <TodayScheduleTimeline schedule={mockSchedule} />
        </MemoryRouter>,
      )

      expect(screen.getByText(/Today's Schedule/i)).toBeInTheDocument()
      const viewAllLink = screen.getByRole('link', { name: /View All/i })
      expect(viewAllLink).toHaveAttribute('href', '/mentor/schedule')
    })

    it('navigates ongoing class to active class view on card click', () => {
      mockNavigate.mockClear()
      render(
        <MemoryRouter>
          <TodayScheduleTimeline schedule={mockSchedule} />
        </MemoryRouter>,
      )

      const ongoingCard = screen.getByLabelText(/Open active class: Python Basics/i)
      fireEvent.click(ongoingCard)

      expect(mockNavigate).toHaveBeenCalledWith('/mentor/classes/cls-104')
    })

    it('navigates upcoming class to scheduled class details on card click', () => {
      mockNavigate.mockClear()
      render(
        <MemoryRouter>
          <TodayScheduleTimeline schedule={mockSchedule} />
        </MemoryRouter>,
      )

      const upcomingCard = screen.getByLabelText(/Open scheduled class: Web Development/i)
      fireEvent.click(upcomingCard)

      expect(mockNavigate).toHaveBeenCalledWith('/mentor/schedule?classId=sch-102')
    })

    it('triggers navigation on Enter key press for accessibility', () => {
      mockNavigate.mockClear()
      render(
        <MemoryRouter>
          <TodayScheduleTimeline schedule={mockSchedule} />
        </MemoryRouter>,
      )

      const ongoingCard = screen.getByLabelText(/Open active class: Python Basics/i)
      fireEvent.keyDown(ongoingCard, { key: 'Enter', code: 'Enter' })

      expect(mockNavigate).toHaveBeenCalledWith('/mentor/classes/cls-104')
    })
  })

  describe('AnnouncementsCard', () => {
    const mockAnnouncements: AnnouncementItem[] = [
      {
        id: 'ann-1',
        title: 'Internal Exam Schedule',
        date: '10 Oct 2026',
        category: 'Academic Notice',
        isPinned: true,
        author: 'Academic Controller',
        targetAudience: 'BCA Department (3rd & 5th Semester)',
        content: 'Internal exams will begin from 18 Oct 2026.',
        attachments: [
          {
            name: 'Exam_Schedule.pdf',
            url: '#',
            size: '1.2 MB',
            type: 'pdf',
          },
        ],
      },
    ]

    it('renders Announcements header and View All link pointing to /mentor/announcements', () => {
      render(
        <MemoryRouter>
          <AnnouncementsCard announcements={mockAnnouncements} />
        </MemoryRouter>,
      )

      expect(screen.getByText(/Announcements/i)).toBeInTheDocument()
      const viewAllLink = screen.getByRole('link', { name: /View All/i })
      expect(viewAllLink).toHaveAttribute('href', '/mentor/announcements')
    })

    it('opens announcement details modal on card click', () => {
      render(
        <MemoryRouter>
          <AnnouncementsCard announcements={mockAnnouncements} />
        </MemoryRouter>,
      )

      const card = screen.getByLabelText(/View notice: Internal Exam Schedule/i)
      fireEvent.click(card)

      expect(screen.getByText('Notice Details')).toBeInTheDocument()
      expect(screen.getByText('Internal exams will begin from 18 Oct 2026.')).toBeInTheDocument()
      expect(screen.getByText('Exam_Schedule.pdf')).toBeInTheDocument()
    })

    it('renders options button with accessible label for each announcement', () => {
      render(
        <MemoryRouter>
          <AnnouncementsCard announcements={mockAnnouncements} />
        </MemoryRouter>,
      )

      const threeDotBtn = screen.getByLabelText(/Actions for Internal Exam Schedule/i)
      expect(threeDotBtn).toBeInTheDocument()
      expect(threeDotBtn).toHaveAttribute('type', 'button')
    })
  })

  describe('RecentClassesGrid', () => {
    const mockRecentClasses: RecentClassItem[] = [
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
    ]

    it('renders View All link pointing to /mentor/classes', () => {
      render(
        <MemoryRouter>
          <RecentClassesGrid classes={mockRecentClasses} />
        </MemoryRouter>,
      )

      expect(screen.getByText(/Recent Classes/i)).toBeInTheDocument()
      const viewAllLink = screen.getByRole('link', { name: /View All/i })
      expect(viewAllLink).toHaveAttribute('href', '/mentor/classes')
    })

    it('navigates to class details with actual ID on card click', () => {
      mockNavigate.mockClear()
      render(
        <MemoryRouter>
          <RecentClassesGrid classes={mockRecentClasses} />
        </MemoryRouter>,
      )

      const classCard = screen.getByLabelText(/Open class: Web Development/i)
      fireEvent.click(classCard)

      expect(mockNavigate).toHaveBeenCalledWith('/mentor/classes/cls-102')
    })

    it('renders options dropdown button with accessible label without bubbling card navigation', () => {
      mockNavigate.mockClear()
      render(
        <MemoryRouter>
          <RecentClassesGrid classes={mockRecentClasses} />
        </MemoryRouter>,
      )

      const threeDotBtn = screen.getByLabelText(/Options for Web Development/i)
      expect(threeDotBtn).toBeInTheDocument()
      expect(threeDotBtn).toHaveAttribute('type', 'button')

      // Clicking three-dot button does not navigate to class details
      fireEvent.click(threeDotBtn)
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('DashboardSummaryCards - Syllabus Completion', () => {
    const defaultProps = {
      totalStudents: 140,
      allClassesCount: 6,
      activeClassesCount: 3,
      attendanceRate: 92,
    }

    it('renders real dynamic syllabus percentage, status badge, and phase', () => {
      render(
        <MemoryRouter>
          <DashboardSummaryCards
            {...defaultProps}
            syllabusProgress={85}
            syllabusBadgeText="On Track"
            syllabusBadgeTone="success"
            syllabusPhaseText="Advanced Modules Phase"
          />
        </MemoryRouter>,
      )

      // Shows dynamic percentage across desktop and mobile views
      expect(screen.getAllByText('85%').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Syllabus Completion').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('On Track').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Advanced Modules Phase').length).toBeGreaterThanOrEqual(1)
    })

    it('renders subtle progress indicator representing exact percentage', () => {
      render(
        <MemoryRouter>
          <DashboardSummaryCards
            {...defaultProps}
            syllabusProgress={79}
          />
        </MemoryRouter>,
      )

      const progressBars = screen.getAllByRole('progressbar')
      expect(progressBars.length).toBeGreaterThanOrEqual(1)
      expect(progressBars[0]).toHaveAttribute('aria-valuenow', '79')
    })

    it('navigates to /mentor/syllabus-completion when clicking View Syllabus', () => {
      mockNavigate.mockClear()
      render(
        <MemoryRouter>
          <DashboardSummaryCards
            {...defaultProps}
            syllabusProgress={79}
          />
        </MemoryRouter>,
      )

      const viewSyllabusAction = screen.getAllByText(/View Syllabus/i)[0]
      expect(viewSyllabusAction).toBeInTheDocument()
      fireEvent.click(viewSyllabusAction)
      expect(mockNavigate).toHaveBeenCalledWith('/mentor/syllabus-completion')
    })

    it('handles empty syllabus state without fake numbers or errors', () => {
      render(
        <MemoryRouter>
          <DashboardSummaryCards
            {...defaultProps}
            syllabusProgress={null}
            syllabusBadgeText="No Data"
            syllabusBadgeTone="neutral"
            syllabusPhaseText="No syllabus data"
          />
        </MemoryRouter>,
      )

      expect(screen.getAllByText('--').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('No Data').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('No syllabus data').length).toBeGreaterThanOrEqual(1)
      // No progress bar when no syllabus data
      expect(screen.queryByRole('progressbar')).toBeNull()
    })
  })
})

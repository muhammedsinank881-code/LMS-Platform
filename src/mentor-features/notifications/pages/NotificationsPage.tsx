import { useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  Clock,
  Eye,
  FileText,
  Megaphone,
  MoreVertical,
  Pin,
  Search,
  Share2,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  Input,
  toast,
} from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { AnnouncementDetailsModal } from '@/mentor-features/dashboard/components/AnnouncementDetailsModal'
import type { AnnouncementItem } from '@/mentor-features/dashboard/types'

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: 'attendance' | 'assignment' | 'system'
}

const MOCK_NOTIFS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Attendance Alert',
    description: 'Devadathan P was marked absent for 3 consecutive days in BCA - 4th Semester.',
    time: '30 mins ago',
    read: false,
    type: 'attendance',
  },
  {
    id: 'n-2',
    title: 'Assignment Submitted',
    description: 'Muhammad Riyan submitted "React Custom Hooks Lab" for review.',
    time: '2 hours ago',
    read: false,
    type: 'assignment',
  },
  {
    id: 'n-3',
    title: 'Mid-Term Exam Reminder',
    description: 'BCA - 4th Semester Mid-Term Practical Exam is scheduled for 15 Oct 2026.',
    time: 'Yesterday',
    read: true,
    type: 'system',
  },
]

const MOCK_ANNOUNCEMENTS_FEED: AnnouncementItem[] = [
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
  {
    id: 'ann-4',
    title: 'Guest Lecture: Scalable System Architecture',
    date: '22 Oct 2026',
    category: 'Guest Lecture',
    author: 'Placement & Industry Cell',
    targetAudience: 'All BCA Batches & Mentors',
    content:
      'Special webinar session with Senior Cloud Architect from Google Cloud on high availability, microservices design patterns, and caching strategies. Interactive Q&A for students and faculty.',
  },
]

export function NotificationsPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const isAnnouncementsPath = location.pathname.includes('/announcements')
  const [tabOverride, setTabOverride] = useState<'announcements' | 'notifications' | null>(null)
  const activeTab = tabOverride ?? (isAnnouncementsPath ? 'announcements' : 'notifications')

  const [notifs, setNotifs] = useState(MOCK_NOTIFS)
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(MOCK_ANNOUNCEMENTS_FEED)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null)
  const [closedUrlId, setClosedUrlId] = useState<string | null>(null)

  const activeAnnouncement = useMemo(() => {
    if (selectedAnnouncement) return selectedAnnouncement
    const id = searchParams.get('id')
    if (id && id !== closedUrlId) {
      return announcements.find((a) => a.id === id) || null
    }
    return null
  }, [selectedAnnouncement, searchParams, closedUrlId, announcements])

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const handleCopyLink = (ann: AnnouncementItem) => {
    const url = `${window.location.origin}/mentor/announcements?id=${ann.id}`
    void navigator.clipboard.writeText(url)
    toast.success('Announcement link copied to clipboard')
  }

  const handleDeleteAnnouncement = (ann: AnnouncementItem) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== ann.id))
    toast.success('Announcement removed')
  }

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      if (categoryFilter !== 'all' && ann.category !== categoryFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = ann.title.toLowerCase().includes(q)
        const matchContent = ann.content?.toLowerCase().includes(q) || false
        const matchCat = ann.category?.toLowerCase().includes(q) || false
        if (!matchTitle && !matchContent && !matchCat) return false
      }
      return true
    })
  }, [announcements, categoryFilter, searchQuery])

  const categories = useMemo(() => {
    const set = new Set<string>()
    announcements.forEach((a) => a.category && set.add(a.category))
    return Array.from(set)
  }, [announcements])

  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <PageHeader
        title={activeTab === 'announcements' ? 'Announcements & Notices' : 'Notifications'}
        description={
          activeTab === 'announcements'
            ? 'Campus notices, academic circulars, exam schedules, and department updates'
            : 'System updates, student submission alerts and attendance warnings'
        }
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: activeTab === 'announcements' ? 'Announcements' : 'Notifications' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'notifications' ? (
              <Button type="button" variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="size-4 mr-1.5" />
                <span>Mark all as read</span>
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Tabs navigation */}
      <div className="flex border-b border-border gap-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setTabOverride('announcements')}
          className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'announcements'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Announcements ({announcements.length})
        </button>
        <button
          type="button"
          onClick={() => setTabOverride('notifications')}
          className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Notifications ({notifs.filter((n) => !n.read).length} Unread)
        </button>
      </div>

      {activeTab === 'announcements' ? (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All Notices
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72">
              <Input
                type="search"
                size="sm"
                placeholder="Search announcements..."
                leftAdornment={<Search className="size-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Announcements Feed Cards */}
          <div className="space-y-3">
            {filteredAnnouncements.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Megaphone className="size-8 mx-auto mb-2 text-muted-foreground/60" />
                <p className="font-semibold text-foreground">No announcements found</p>
                <p className="text-xs mt-1">Try adjusting your filters or search keywords.</p>
              </Card>
            ) : (
              filteredAnnouncements.map((ann) => (
                <Card
                  key={ann.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedAnnouncement(ann)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedAnnouncement(ann)
                    }
                  }}
                  className="p-4 border-border bg-surface hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-lg bg-primary-subtle text-primary shrink-0 transition-transform group-hover:scale-105">
                        <Megaphone className="size-5" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {ann.title}
                          </h3>

                          {ann.category ? (
                            <Badge tone="info" appearance="soft" size="sm" className="text-[10px]">
                              {ann.category}
                            </Badge>
                          ) : null}

                          {ann.isPinned ? (
                            <Badge tone="warning" appearance="solid" size="sm" className="text-[10px] gap-1">
                              <Pin className="size-2.5 fill-current" />
                              <span>Pinned</span>
                            </Badge>
                          ) : null}
                        </div>

                        {ann.content ? (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {ann.content}
                          </p>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3 text-primary" /> {ann.date}
                          </span>
                          {ann.author ? (
                            <span>• By {ann.author}</span>
                          ) : null}
                          {ann.targetAudience ? (
                            <span className="flex items-center gap-1">
                              • <Users className="size-3" /> {ann.targetAudience}
                            </span>
                          ) : null}
                          {ann.attachments && ann.attachments.length > 0 ? (
                            <span className="flex items-center gap-1 text-primary">
                              • <FileText className="size-3" /> {ann.attachments.length} Attachment(s)
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAnnouncement(ann)
                          setClosedUrlId(null)
                        }}
                        className="text-xs"
                      >
                        <Eye className="size-3.5 mr-1 text-primary" />
                        <span>View Details</span>
                      </Button>

                      <Dropdown>
                        <DropdownTrigger asChild>
                          <button
                            type="button"
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                            aria-label={`Options for ${ann.title}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </DropdownTrigger>
                        <DropdownContent align="end" className="w-44">
                          <DropdownItem
                            onClick={() => {
                              setSelectedAnnouncement(ann)
                              setClosedUrlId(null)
                            }}
                          >
                            <Eye className="size-3.5 mr-2 text-primary" />
                            <span>View Full Notice</span>
                          </DropdownItem>
                          <DropdownItem onClick={() => handleCopyLink(ann)}>
                            <Share2 className="size-3.5 mr-2" />
                            <span>Share Link</span>
                          </DropdownItem>
                        </DropdownContent>
                      </Dropdown>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Notifications List */
        <div className="space-y-3">
          {notifs.map((n) => (
            <Card
              key={n.id}
              className={`p-4 flex items-start gap-3.5 transition-all ${
                n.read
                  ? 'bg-surface border-border'
                  : 'bg-primary-subtle/50 border-primary/30'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">
                {n.type === 'attendance' ? (
                  <UserCheck className="size-4" />
                ) : n.type === 'assignment' ? (
                  <FileText className="size-4" />
                ) : (
                  <Bell className="size-4" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> {n.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {n.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnnouncementDetailsModal
        announcement={activeAnnouncement}
        open={Boolean(activeAnnouncement)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAnnouncement(null)
            const id = searchParams.get('id')
            if (id) {
              setClosedUrlId(id)
            }
          }
        }}
        onDelete={handleDeleteAnnouncement}
      />
    </div>
  )
}

export const Notifications = NotificationsPage
export default NotificationsPage

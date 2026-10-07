export interface AttendanceDay {
  day: string
  hours: number
  checkIn: string
  checkOut: string
  status: 'present' | 'absent' | 'weekend'
}

export interface PendingClass {
  id: string
  title: string
  duration: string
  module: string
  status: 'now_watching' | 'up_next' | 'pending'
  thumbnail: string
  videoUrl?: string
}

export interface StudentAssignment {
  id: string
  title: string
  course: string
  dueDate: string
  isDueToday: boolean
  status: 'pending' | 'submitted' | 'graded'
  score?: string
}

export interface StudentCertificate {
  id: string
  title: string
  issuer: string
  issueDate: string
  credentialId: string
  badgeColor: string
}

export interface ChatMessage {
  id: string
  sender: 'student' | 'mentor'
  text: string
  timestamp: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
  tag: 'Important' | 'Notice' | 'Event' | 'Assignment'
}

export const MOCK_STUDENT_DATA = {
  studentName: 'Sinan',
  studentEmail: 'student@leadflow.test',

  // Top Stats
  stats: {
    attendancePercentage: 92,
    totalClasses: 50,
    attendedClasses: 46,
    absentClasses: 4,
    streakDays: 12,
    progressPercentage: 78,
    pendingTasksTodayCount: 2,
    lastCertificateTitle: 'Full-Stack React & TS Certification',
  },

  // Attendance Analytics & Chart
  attendance: {
    totalClasses: 50,
    attended: 46,
    absents: 4,
    percentage: 92,
    todayCheckIn: '09:15 AM',
    todayCheckOut: '05:30 PM',
    todayHours: 7.5,
    weeklyData: [
      { day: 'Mon', hours: 6.5, checkIn: '09:30 AM', checkOut: '04:00 PM', status: 'present' },
      { day: 'Tue', hours: 7.2, checkIn: '09:15 AM', checkOut: '04:30 PM', status: 'present' },
      { day: 'Wed', hours: 8.0, checkIn: '09:00 AM', checkOut: '05:00 PM', status: 'present' },
      { day: 'Thu', hours: 0, checkIn: '-', checkOut: '-', status: 'absent' },
      { day: 'Fri', hours: 7.5, checkIn: '09:15 AM', checkOut: '04:45 PM', status: 'present' },
      { day: 'Sat', hours: 4.0, checkIn: '10:00 AM', checkOut: '02:00 PM', status: 'present' },
      { day: 'Sun', hours: 0, checkIn: '-', checkOut: '-', status: 'weekend' },
    ] as AttendanceDay[],
  },

  // Active Main Course
  activeCourse: {
    id: 'course-fullstack-101',
    title: 'Full-Stack Web & AI Application Development',
    code: 'FS-2026',
    progress: 78,
    completedModules: 14,
    totalModules: 18,
    nextLesson: 'Building Realtime AI Chat Agents & Recharts Dashboard',
    mentorName: 'Hasna PK',
    mentorRole: 'Senior Full-Stack Mentor',
    mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isLiveClassActive: true,
    liveClassTitle: 'Live Q&A & Code Review with Hasna PK',
    liveClassTime: 'Starts at 05:00 PM',
    syllabusNotes: [
      'Module 1: Modern React 19 & Hooks Deep Dive',
      'Module 2: TypeScript Strict Architecture',
      'Module 3: State Management with Zustand & TanStack Query',
      'Module 4: Recharts Analytics & Visualizations',
      'Module 5: Building AI Agents & REST Integrations',
    ],
  },

  // Pending Classes Queue
  pendingClasses: [
    {
      id: 'class-1',
      title: 'Building Realtime AI Chat Agents & Recharts Dashboard',
      duration: '45 mins',
      module: 'Module 5: AI & Dashboard Architecture',
      status: 'now_watching',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      id: 'class-2',
      title: 'Advanced Recharts Analytics & Custom Tooltips',
      duration: '38 mins',
      module: 'Module 4: Data Visualization',
      status: 'up_next',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    {
      id: 'class-3',
      title: 'Optimizing React Apps & Vitest Unit Testing',
      duration: '52 mins',
      module: 'Module 6: Testing & Performance',
      status: 'pending',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      id: 'class-4',
      title: 'Deploying Production Full-Stack Web Apps',
      duration: '40 mins',
      module: 'Module 7: CI/CD & Deployment',
      status: 'pending',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
  ] as PendingClass[],

  // Assignments & Deadlines
  assignments: [
    {
      id: 'assign-1',
      title: 'React Custom Hooks & Attendance Tracker Lab',
      course: 'Full-Stack Web Development',
      dueDate: 'Today, 11:59 PM',
      isDueToday: true,
      status: 'pending',
    },
    {
      id: 'assign-2',
      title: 'TypeScript Generics & Zod Validation Challenge',
      course: 'Full-Stack Web Development',
      dueDate: 'Today, 06:00 PM',
      isDueToday: true,
      status: 'pending',
    },
    {
      id: 'assign-3',
      title: 'Zustand Store Persistence & State Management',
      course: 'State Management 101',
      dueDate: 'Tomorrow, 05:00 PM',
      isDueToday: false,
      status: 'submitted',
      score: '98/100',
    },
    {
      id: 'assign-4',
      title: 'Recharts Dashboard & Data Visualization Project',
      course: 'Frontend Engineering',
      dueDate: 'Oct 12, 2026',
      isDueToday: false,
      status: 'graded',
      score: '100/100',
    },
  ] as StudentAssignment[],

  // Certificates
  certificates: [
    {
      id: 'cert-1',
      title: 'Full-Stack React & TS Certification',
      issuer: 'LeadFlow Tech Academy',
      issueDate: 'Sep 2026',
      credentialId: 'LF-8849201',
      badgeColor: 'from-amber-500 to-orange-600',
    },
    {
      id: 'cert-2',
      title: 'Modern UI/UX Design Systems',
      issuer: 'Design Craft Guild',
      issueDate: 'Aug 2026',
      credentialId: 'DC-992104',
      badgeColor: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'cert-3',
      title: 'TypeScript Specialist Level 2',
      issuer: 'TypeScript Org Certified',
      issueDate: 'Jul 2026',
      credentialId: 'TS-302194',
      badgeColor: 'from-emerald-500 to-teal-600',
    },
  ] as StudentCertificate[],

  // Mentor Chat History
  mentorChat: {
    mentorName: 'Hasna PK',
    mentorRole: 'Senior Full-Stack Mentor',
    onlineStatus: 'Online',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    messages: [
      {
        id: 'msg-1',
        sender: 'mentor',
        text: 'Hi Sinan! How is your progress on the Recharts Dashboard lab?',
        timestamp: '10:30 AM',
      },
      {
        id: 'msg-2',
        sender: 'student',
        text: 'Hey Hasna! Going great. Just finishing up the weekly attendance graph component.',
        timestamp: '10:32 AM',
      },
      {
        id: 'msg-3',
        sender: 'mentor',
        text: 'Awesome! Don’t forget to join today’s Live Q&A at 5:00 PM if you have any questions.',
        timestamp: '10:35 AM',
      },
    ] as ChatMessage[],
  },

  // Announcements & Notices
  announcements: [
    {
      id: 'ann-1',
      title: 'Live Q&A & Live Code Review Session Today at 5:00 PM',
      content: 'Join Mentor Hasna PK for live debugging, Q&A, and project reviews.',
      date: 'Today',
      author: 'Hasna PK',
      tag: 'Important',
    },
    {
      id: 'ann-2',
      title: 'Mid-Term Project Submission Window Extended',
      content: 'You can submit your React & TS portfolio project until Sunday 11:59 PM.',
      date: 'Yesterday',
      author: 'Academic Team',
      tag: 'Notice',
    },
    {
      id: 'ann-3',
      title: 'New Module Released: Advanced Recharts & Analytics',
      content: 'Module 5 has been unlocked in your course dashboard!',
      date: '2 days ago',
      author: 'LeadFlow LMS',
      tag: 'Event',
    },
  ] as Announcement[],
}

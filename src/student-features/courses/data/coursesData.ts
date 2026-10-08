export type CourseCategory = 'All' | 'Full-Stack' | 'Frontend' | 'Backend' | 'UI/UX' | 'Mobile' | 'DevOps'
export type CourseStatusFilter = 'all' | 'in_progress' | 'completed' | 'bookmarked'

export interface CourseLesson {
  id: string
  title: string
  duration: string
  isCompleted: boolean
  isCurrent?: boolean
  videoUrl?: string
}

export interface CourseModule {
  id: string
  title: string
  duration: string
  completedLessonsCount: number
  totalLessonsCount: number
  lessons: CourseLesson[]
}

export interface StudentCourse {
  id: string
  title: string
  code: string
  category: Exclude<CourseCategory, 'All'>
  status: 'in_progress' | 'completed' | 'not_started'
  progress: number // 0 - 100
  completedModules: number
  totalModules: number
  completedLessons: number
  totalLessons: number
  totalDuration: string
  rating: number
  nextLessonId: string
  nextLessonTitle: string
  instructor: {
    name: string
    role: string
    avatar: string
  }
  thumbnail: string
  isBookmarked: boolean
  isLiveClassActive?: boolean
  liveClassTime?: string
  certificateId?: string
  certificateUrl?: string
  lastAccessed?: string
  description: string
  modules: CourseModule[]
}

export interface CourseStats {
  totalEnrolled: number
  inProgressCount: number
  completedCount: number
  totalHoursLearned: number
  overallCompletionRate: number
}

export const MOCK_COURSES_DATA: StudentCourse[] = [
  {
    id: 'course-fullstack-101',
    title: 'Full-Stack Web & AI Application Development',
    code: 'FS-2026',
    category: 'Full-Stack',
    status: 'in_progress',
    progress: 78,
    completedModules: 14,
    totalModules: 18,
    completedLessons: 42,
    totalLessons: 54,
    totalDuration: '48h 30m',
    rating: 4.9,
    nextLessonId: 'class-1',
    nextLessonTitle: 'Building Realtime AI Chat Agents & Recharts Dashboard',
    instructor: {
      name: 'Hasna PK',
      role: 'Senior Full-Stack Mentor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    isBookmarked: true,
    isLiveClassActive: true,
    liveClassTime: 'Today at 05:00 PM',
    lastAccessed: '2 hours ago',
    description: 'Master modern React 19, TypeScript architecture, Zustand state management, and building intelligent full-stack AI applications.',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Modern React 19 & Core Hooks Deep Dive',
        duration: '6h 15m',
        completedLessonsCount: 4,
        totalLessonsCount: 4,
        lessons: [
          { id: 'les-1-1', title: 'React 19 Compiler & Actions Overview', duration: '45m', isCompleted: true },
          { id: 'les-1-2', title: 'Custom Hooks Architecture & Clean Code', duration: '50m', isCompleted: true },
          { id: 'les-1-3', title: 'useActionState & Optimistic UI Updates', duration: '40m', isCompleted: true },
          { id: 'les-1-4', title: 'Context API vs Modular State Patterns', duration: '55m', isCompleted: true },
        ],
      },
      {
        id: 'mod-2',
        title: 'Module 2: TypeScript Strict Architecture',
        duration: '5h 45m',
        completedLessonsCount: 3,
        totalLessonsCount: 3,
        lessons: [
          { id: 'les-2-1', title: 'Strict Type Checking & Generics', duration: '40m', isCompleted: true },
          { id: 'les-2-2', title: 'Zod Validation Schemas in React', duration: '45m', isCompleted: true },
          { id: 'les-2-3', title: 'Discriminated Unions & Component Props', duration: '50m', isCompleted: true },
        ],
      },
      {
        id: 'mod-3',
        title: 'Module 3: State Management with Zustand & TanStack Query',
        duration: '7h 20m',
        completedLessonsCount: 4,
        totalLessonsCount: 4,
        lessons: [
          { id: 'les-3-1', title: 'Zustand Store Creation & Middleware Persistence', duration: '50m', isCompleted: true },
          { id: 'les-3-2', title: 'TanStack Query Data Fetching & Caching', duration: '55m', isCompleted: true },
          { id: 'les-3-3', title: 'Optimistic Cache Mutations', duration: '45m', isCompleted: true },
          { id: 'les-3-4', title: 'Query Key Strategies & Invalidation', duration: '40m', isCompleted: true },
        ],
      },
      {
        id: 'mod-4',
        title: 'Module 4: Recharts Analytics & Visualizations',
        duration: '6h 10m',
        completedLessonsCount: 3,
        totalLessonsCount: 3,
        lessons: [
          { id: 'les-4-1', title: 'Responsive Charts with Recharts Container', duration: '45m', isCompleted: true },
          { id: 'les-4-2', title: 'Custom Tooltips & Area Charts', duration: '38m', isCompleted: true },
          { id: 'les-4-3', title: 'Bar Charts & Interactive Filters', duration: '50m', isCompleted: true },
        ],
      },
      {
        id: 'mod-5',
        title: 'Module 5: Building AI Agents & REST Integrations',
        duration: '8h 30m',
        completedLessonsCount: 1,
        totalLessonsCount: 4,
        lessons: [
          { id: 'class-1', title: 'Building Realtime AI Chat Agents & Recharts Dashboard', duration: '45m', isCompleted: false, isCurrent: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 'class-2', title: 'Advanced Recharts Analytics & Custom Tooltips', duration: '38m', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { id: 'class-3', title: 'Optimizing React Apps & Vitest Unit Testing', duration: '52m', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 'class-4', title: 'Deploying Production Full-Stack Web Apps', duration: '40m', isCompleted: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
        ],
      },
    ],
  },
  {
    id: 'course-frontend-202',
    title: 'Frontend Engineering & React 19 Mastery',
    code: 'FE-2026',
    category: 'Frontend',
    status: 'in_progress',
    progress: 45,
    completedModules: 5,
    totalModules: 11,
    completedLessons: 18,
    totalLessons: 40,
    totalDuration: '32h 15m',
    rating: 4.8,
    nextLessonId: 'class-2',
    nextLessonTitle: 'Component Performance Optimization & React Profiler',
    instructor: {
      name: 'Alex Rivera',
      role: 'Lead UI Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    isBookmarked: true,
    lastAccessed: 'Yesterday',
    description: 'Deep dive into advanced frontend patterns, micro-interactions, headless UI design systems, and web performance.',
    modules: [
      {
        id: 'fe-mod-1',
        title: 'Module 1: Advanced Component Patterns & Composition',
        duration: '5h 20m',
        completedLessonsCount: 4,
        totalLessonsCount: 4,
        lessons: [
          { id: 'fe-1-1', title: 'Compound Components & Slot Pattern', duration: '45m', isCompleted: true },
          { id: 'fe-1-2', title: 'Polymorphic Components in TypeScript', duration: '50m', isCompleted: true },
          { id: 'fe-1-3', title: 'Control Props & Uncontrolled Components', duration: '40m', isCompleted: true },
          { id: 'fe-1-4', title: 'Render Props & Custom Hooks Integration', duration: '45m', isCompleted: true },
        ],
      },
      {
        id: 'fe-mod-2',
        title: 'Module 2: Web Performance & Profiling',
        duration: '6h 00m',
        completedLessonsCount: 1,
        totalLessonsCount: 4,
        lessons: [
          { id: 'class-2', title: 'Component Performance Optimization & React Profiler', duration: '45m', isCompleted: false, isCurrent: true },
          { id: 'fe-2-2', title: 'Code Splitting & Lazy Loading Routes', duration: '40m', isCompleted: false },
          { id: 'fe-2-3', title: 'Virtualization & Big Data Rendering', duration: '55m', isCompleted: false },
          { id: 'fe-2-4', title: 'Core Web Vitals & Bundle Optimization', duration: '50m', isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'course-uiux-301',
    title: 'Modern UI/UX & Tailwind CSS Systems',
    code: 'UX-2025',
    category: 'UI/UX',
    status: 'completed',
    progress: 100,
    completedModules: 8,
    totalModules: 8,
    completedLessons: 28,
    totalLessons: 28,
    totalDuration: '24h 00m',
    rating: 5.0,
    nextLessonId: '',
    nextLessonTitle: 'Course Completed',
    instructor: {
      name: 'Sarah Chen',
      role: 'Principal Product Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    isBookmarked: false,
    certificateId: 'DC-992104',
    certificateUrl: '/student/certificates',
    lastAccessed: '3 weeks ago',
    description: 'Design dark-mode first, glassmorphism UI design systems with Tailwind CSS, Radix UI primitives, and dynamic animations.',
    modules: [
      {
        id: 'ux-mod-1',
        title: 'Module 1: Design Tokens & CSS Custom Variables',
        duration: '4h 00m',
        completedLessonsCount: 4,
        totalLessonsCount: 4,
        lessons: [
          { id: 'ux-1-1', title: 'Building Scalable Theme Systems', duration: '50m', isCompleted: true },
          { id: 'ux-1-2', title: 'Color Palettes & Dark Mode Contrast', duration: '45m', isCompleted: true },
          { id: 'ux-1-3', title: 'Typography Hierarchy & Fluid Sizing', duration: '40m', isCompleted: true },
          { id: 'ux-1-4', title: 'Spacing, Grids & Responsive Breakpoints', duration: '45m', isCompleted: true },
        ],
      },
    ],
  },
  {
    id: 'course-ts-302',
    title: 'TypeScript & Zod Architecture Specialist',
    code: 'TS-2025',
    category: 'Backend',
    status: 'completed',
    progress: 100,
    completedModules: 6,
    totalModules: 6,
    completedLessons: 22,
    totalLessons: 22,
    totalDuration: '18h 45m',
    rating: 4.9,
    nextLessonId: '',
    nextLessonTitle: 'Course Completed',
    instructor: {
      name: 'Michael Chang',
      role: 'Senior Staff Engineer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1516116211223-48a12725222e?w=600&auto=format&fit=crop&q=80',
    isBookmarked: true,
    certificateId: 'TS-302194',
    certificateUrl: '/student/certificates',
    lastAccessed: '1 month ago',
    description: 'Master advanced TypeScript type manipulation, conditional types, template literals, and runtime validation with Zod.',
    modules: [
      {
        id: 'ts-mod-1',
        title: 'Module 1: Advanced Generics & Utility Types',
        duration: '3h 30m',
        completedLessonsCount: 3,
        totalLessonsCount: 3,
        lessons: [
          { id: 'ts-1-1', title: 'Infer Keyword & Conditional Types', duration: '45m', isCompleted: true },
          { id: 'ts-1-2', title: 'Mapped Types & Key Remapping', duration: '50m', isCompleted: true },
          { id: 'ts-1-3', title: 'Zod Runtime Schema Validation', duration: '40m', isCompleted: true },
        ],
      },
    ],
  },
  {
    id: 'course-backend-401',
    title: 'Node.js, Express & PostgreSQL Database Architecture',
    code: 'BE-2026',
    category: 'Backend',
    status: 'not_started',
    progress: 0,
    completedModules: 0,
    totalModules: 10,
    completedLessons: 0,
    totalLessons: 36,
    totalDuration: '36h 00m',
    rating: 4.7,
    nextLessonId: 'be-1-1',
    nextLessonTitle: 'Node.js Event Loop & Microservices Architecture',
    instructor: {
      name: 'David Miller',
      role: 'Lead Backend Architect',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    isBookmarked: false,
    description: 'Build enterprise REST & GraphQL APIs, microservices, connection pooling, and secure JWT authentication.',
    modules: [
      {
        id: 'be-mod-1',
        title: 'Module 1: Node.js Internals & Event Loop',
        duration: '4h 15m',
        completedLessonsCount: 0,
        totalLessonsCount: 4,
        lessons: [
          { id: 'be-1-1', title: 'Node.js Event Loop & Microservices Architecture', duration: '50m', isCompleted: false },
          { id: 'be-1-2', title: 'Streams & Buffer Management', duration: '45m', isCompleted: false },
        ],
      },
    ],
  },
]

export const MOCK_COURSE_STATS: CourseStats = {
  totalEnrolled: 5,
  inProgressCount: 2,
  completedCount: 2,
  totalHoursLearned: 123,
  overallCompletionRate: 64,
}

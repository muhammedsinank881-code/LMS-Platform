export type TaskType = 'assignment' | 'quiz'
export type TaskStatus = 'pending' | 'submitted' | 'graded'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctOptionIndex: number
  explanation?: string
}

export interface StudentTask {
  id: string
  title: string
  type: TaskType
  course: string
  courseCode: string
  dueDate: string
  isDueToday: boolean
  isOverdue?: boolean
  status: TaskStatus
  points: number
  score?: string // e.g., '98/100'
  scorePercentage?: number
  mentorName: string
  mentorAvatar: string
  description: string
  instructions?: string[]
  submittedAt?: string
  submittedRepoUrl?: string
  submittedNotes?: string
  feedbackNotes?: string
  timeLimitMinutes?: number // for quizzes
  questions?: QuizQuestion[] // for quizzes
}

export interface AssignmentStats {
  totalTasks: number
  pendingCount: number
  dueTodayCount: number
  submittedCount: number
  gradedCount: number
  averageScore: number
}

export const MOCK_TASKS_DATA: StudentTask[] = [
  {
    id: 'assign-1',
    title: 'React Custom Hooks & Attendance Tracker Lab',
    type: 'assignment',
    course: 'Full-Stack Web Development',
    courseCode: 'FS-2026',
    dueDate: 'Today, 11:59 PM',
    isDueToday: true,
    status: 'pending',
    points: 100,
    mentorName: 'Hasna PK',
    mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Implement a reusable custom hook for calculating student weekly attendance percentages and streak days with unit tests.',
    instructions: [
      'Create a hook `useAttendanceCalculator(weeklyData)` returning total hours, percentage, and status flags.',
      'Ensure strict TypeScript typing and error handling for missing dates.',
      'Provide a GitHub repository link or ZIP submit with React Testing Library test cases.',
    ],
  },
  {
    id: 'quiz-1',
    title: 'TypeScript Generics & Zod Validation Challenge',
    type: 'quiz',
    course: 'Full-Stack Web Development',
    courseCode: 'FS-2026',
    dueDate: 'Today, 06:00 PM',
    isDueToday: true,
    status: 'pending',
    points: 50,
    timeLimitMinutes: 15,
    mentorName: 'Hasna PK',
    mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Test your understanding of generic constraints, Zod schema inference, and runtime type checking in TypeScript.',
    questions: [
      {
        id: 'q1',
        question: 'Which TypeScript keyword is used to enforce that a generic type parameter extends a specific structure?',
        options: ['implements', 'extends', 'instanceof', 'keyof'],
        correctOptionIndex: 1,
        explanation: 'The `extends` keyword constrains generic type parameters, e.g., `<T extends { id: string }>`.',
      },
      {
        id: 'q2',
        question: 'What method in Zod infer typescript type from a schema definition?',
        options: ['z.typeOf<typeof schema>()', 'z.infer<typeof schema>', 'z.parse(schema)', 'schema.getType()'],
        correctOptionIndex: 1,
        explanation: '`z.infer<typeof schema>` extracts the TypeScript type representation of a Zod schema.',
      },
      {
        id: 'q3',
        question: 'What is the runtime outcome of calling `z.string().parse(123)`?',
        options: ['Returns 123 converted to string', 'Throws a ZodError at runtime', 'Returns undefined', 'Compiles with TS warning'],
        correctOptionIndex: 1,
        explanation: '`parse()` validates data at runtime and throws a `ZodError` if validation fails.',
      },
      {
        id: 'q4',
        question: 'How do you mark an object field as optional in Zod schema?',
        options: ['z.string().nullable()', 'z.string().optional()', 'z.optional(z.string())', 'Both B and C'],
        correctOptionIndex: 3,
        explanation: 'Either `z.string().optional()` or `z.optional(z.string())` marks a field optional in Zod.',
      },
    ],
  },
  {
    id: 'assign-2',
    title: 'Zustand Store Persistence & State Management',
    type: 'assignment',
    course: 'State Management 101',
    courseCode: 'SM-2025',
    dueDate: 'Yesterday, 05:00 PM',
    isDueToday: false,
    status: 'submitted',
    points: 100,
    mentorName: 'Alex Rivera',
    mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Build a persistent cart and session state store using Zustand with custom `persist` storage options and middleware.',
    submittedAt: 'Yesterday at 04:30 PM',
    submittedRepoUrl: 'https://github.com/student/leadflow-zustand-lab',
    submittedNotes: 'Implemented persistent store with localStorage fallback and custom hydration handler.',
    instructions: [
      'Create store with Zustand `create()` and wrap in `persist()` middleware.',
      'Filter out non-serializable properties before storing in local storage.',
    ],
  },
  {
    id: 'quiz-2',
    title: 'React 19 & Context API Knowledge Quiz',
    type: 'quiz',
    course: 'Frontend Engineering',
    courseCode: 'FE-2026',
    dueDate: '2 days ago',
    isDueToday: false,
    status: 'graded',
    points: 50,
    score: '48/50',
    scorePercentage: 96,
    timeLimitMinutes: 10,
    mentorName: 'Alex Rivera',
    mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Multiple choice assessment covering React 19 compiler optimizations and Context provider syntax.',
    submittedAt: 'Oct 5, 2026',
    feedbackNotes: 'Outstanding score! You mastered React 19 compiler semantics and Context API optimizations.',
    questions: [
      {
        id: 'q2-1',
        question: 'In React 19, how can `<Context>` be used directly without `<Context.Provider>`?',
        options: ['Using <Context> as a wrapper tag directly', 'Using <Context.Consumer>', 'Directly rendering <Context value={...}>', 'Both A and C'],
        correctOptionIndex: 3,
        explanation: 'In React 19, `<ThemeContext value="dark">` can be rendered directly without `.Provider`.',
      },
    ],
  },
  {
    id: 'assign-3',
    title: 'Recharts Dashboard & Data Visualization Project',
    type: 'assignment',
    course: 'Frontend Engineering',
    courseCode: 'FE-2026',
    dueDate: 'Oct 12, 2026',
    isDueToday: false,
    status: 'graded',
    points: 100,
    score: '98/100',
    scorePercentage: 98,
    mentorName: 'Hasna PK',
    mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Build responsive weekly attendance charts, bar graphs, and tooltips using Recharts inside Tailwind containers.',
    submittedAt: 'Oct 4, 2026',
    submittedRepoUrl: 'https://github.com/student/recharts-analytics-dashboard',
    submittedNotes: 'Created custom tooltip styling and responsive container wrappers.',
    feedbackNotes: 'Exceptional work! Tooltip styling and responsive chart containers are pixel-perfect and accessible.',
  },
  {
    id: 'assign-4',
    title: 'Modern UI/UX Glassmorphism Landing Page',
    type: 'assignment',
    course: 'UI/UX Design Systems',
    courseCode: 'UX-2025',
    dueDate: 'Oct 20, 2026',
    isDueToday: false,
    status: 'pending',
    points: 100,
    mentorName: 'Sarah Chen',
    mentorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    description: 'Design a dark-themed responsive SaaS hero section with glassmorphism backdrop blurs and subtle micro-animations.',
  },
]

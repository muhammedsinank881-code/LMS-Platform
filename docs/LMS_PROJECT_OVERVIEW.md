# LMS Project Overview

> **Application Name:** LeadFlow LMS  
> **Version:** 0.0.0  
> **Type:** Learning Management System (LMS) Frontend  
> **Build Tool:** Vite 8.x  
> **Language:** TypeScript 6.x  

---

## 1. Project Purpose and Objectives

LeadFlow is a **dual-purpose platform** that combines a **CRM (Customer Relationship Management)** system for sales teams with a full **Learning Management System (LMS)** for educational institutions. The LMS portion accommodates two learner/educator roles:

- **Mentor** — Educators/instructors who teach classes, manage assignments, track attendance, grade exams and support students.
- **Student** — Learners enrolled in courses who watch video classes, submit assignments, take quizzes, track attendance, and manage capstone projects.

The non-LMS portion of the app handles leads, pipelines, campaigns, and reporting for sales roles (`super_admin`, `admin`, `manager`, `team_leader`, `salesperson`).

---

## 2. Technology Stack and Dependencies

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI library |
| TypeScript | ~6.0.2 | Type safety |
| Vite | 8.3.x | Build tool & dev server |
| React Router DOM | 6.30.x | Client-side routing |

### State Management
| Library | Version | Purpose |
|---|---|---|
| Zustand | 5.0.x | Global auth state |
| TanStack React Query | 5.104.x | Server-state, caching, data fetching |
| React Hook Form | 7.89.x | Form state management |

### UI & Styling
| Library | Version | Purpose |
|---|---|---|
| Tailwind CSS | 3.4.x | Utility-first CSS framework |
| Radix UI (multiple) | Various | Headless accessible UI primitives |
| Lucide React | 1.51.x | Icon library |
| Recharts | 3.10.x | Charts and analytics |
| class-variance-authority | 0.7.x | Component variant management |
| clsx + tailwind-merge | Latest | Conditional class names |

### Forms & Validation
| Library | Version | Purpose |
|---|---|---|
| Zod | 4.6.x | Schema validation |
| @hookform/resolvers | 5.9.x | Zod–React Hook Form bridge |

### Data & Utilities
| Library | Version | Purpose |
|---|---|---|
| @dnd-kit/core, sortable | 6.x / 10.x | Drag-and-drop |
| date-fns | 4.4.x | Date formatting |
| papaparse | 5.7.x | CSV parsing |
| xlsx | 0.20.3 | Excel export |
| cmdk | 1.1.x | Command palette |
| @tanstack/react-table | 9.2.x | Headless data table |
| @tanstack/react-virtual | 3.14.x | Virtualized list/grid |

### PWA & Performance
| Library | Version | Purpose |
|---|---|---|
| vite-plugin-pwa | 2.0.x | Progressive Web App support |
| @fontsource-variable/inter | 5.3.x | Self-hosted Inter variable font |

### Development & Testing
| Library | Version | Purpose |
|---|---|---|
| Vitest | 5.0.x | Unit test runner |
| @testing-library/react | 16.3.x | React component testing |
| @faker-js/faker | 10.6.x | Mock data generation |
| axe-core | 4.13.x | Accessibility testing |
| ESLint + Prettier | Latest | Linting and formatting |

---

## 3. Project Folder Structure

```
LMS_MANAGEMENT-main/
├── index.html                    # HTML entry point, app name: "LeadFlow"
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite + PWA config
├── tailwind.config.ts            # Tailwind design tokens
├── tsconfig.json                 # TypeScript config
└── src/
    ├── main.tsx                  # React root mount
    ├── App.tsx                   # RouterProvider + Providers wrapper
    ├── app/                      # Application shell & routing
    │   ├── Providers.tsx         # QueryClient + Toaster + TooltipProvider
    │   ├── router.tsx            # createBrowserRouter entry
    │   ├── query-client.ts       # TanStack Query config
    │   ├── guards/
    │   │   ├── ProtectedRoute.tsx    # Auth + onboarding guard
    │   │   └── PublicOnlyRoute.tsx   # Prevents authenticated users on auth pages
    │   └── routes/
    │       ├── app-routes.tsx        # All protected routes (CRM + LMS/Student)
    │       └── public-routes.tsx     # Login, register, forgot-password
    ├── routes/
    │   └── mentorRoutes.tsx          # Mentor-specific route definitions
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx          # Main layout: sidebar + topbar
    │   │   ├── Sidebar.tsx           # Role-aware navigation sidebar
    │   │   ├── Topbar.tsx            # Header bar with workspace switcher
    │   │   ├── nav-config.ts         # CRM + Mentor sidebar nav items
    │   │   └── student-nav-config.ts # Student sidebar nav items
    │   └── ui/                       # Radix-based design system components
    ├── features/                     # CRM features (leads, pipeline, campaigns…)
    │   ├── auth/                     # Login, register, forgot-password pages
    │   ├── dashboard/                # CRM dashboard
    │   ├── leads/                    # Lead management
    │   ├── …                         # (23 CRM feature modules)
    ├── mentor-features/              # LMS: Mentor role modules
    │   ├── dashboard/                # Mentor dashboard
    │   ├── my-classes/               # Class management
    │   ├── my-students/              # Student roster
    │   ├── attendance-tracking/      # Attendance marking
    │   ├── materials/                # Learning materials
    │   ├── assignments/              # Assignment creation
    │   ├── quizzes/                  # Quiz management
    │   ├── exams/                    # Exam scheduling & grading
    │   ├── results/                  # Result publishing
    │   ├── syllabus-completion/      # Syllabus tracker
    │   ├── capstone-projects/        # Capstone project oversight
    │   ├── student-submissions-code-reviews/  # Code review
    │   ├── schedule/                 # Class schedule/calendar
    │   ├── timetable/                # Weekly timetable view
    │   ├── messages/                 # Mentor messaging
    │   ├── notifications/            # Announcements
    │   ├── helpdesk-resource-hub/    # Help desk tickets & resources
    │   ├── batch-overview/           # Batch-level analytics
    │   ├── performance-reports/      # Performance analytics
    │   ├── profile/                  # Mentor profile page
    │   └── settings/                 # Mentor settings page
    ├── student-features/             # LMS: Student role modules
    │   ├── student-Dashboard/        # Student dashboard page + widgets
    │   ├── courses/                  # My Courses listing
    │   ├── assignments/              # Assignments & Quizzes portal
    │   ├── attendance/               # Attendance page
    │   ├── project/                  # Project workspace
    │   ├── certificate/              # Certificates
    │   ├── jobs/                     # Job search
    │   ├── videoClass/               # Video class player components
    │   ├── profile/                  # Student profile page
    │   ├── schedule/                 # Student schedule
    │   ├── discussions/              # Discussions
    │   ├── mentor/                   # Student–Mentor interaction
    │   └── mock/                     # student-data.ts (mock data)
    ├── store/
    │   ├── auth-store.ts             # Zustand auth state (persisted)
    │   └── ui-store.ts               # UI state (sidebar open/close)
    ├── services/
    │   ├── api/                      # API client interfaces (contracts)
    │   │   ├── api.ts                # Master Api interface
    │   │   ├── auth.ts               # AuthApiClient interface
    │   │   ├── student-profile.ts    # StudentProfileApiClient interface
    │   │   ├── student-jobs.ts       # StudentJobsApiClient interface
    │   │   └── …                     # 30+ other API client interfaces
    │   └── mock/                     # In-memory mock implementations
    ├── types/                        # Global TypeScript types
    │   ├── auth.ts                   # User, Tenant, AuthSession, SessionUser
    │   ├── permissions.ts            # Role, Resource, Action, PermissionMatrix
    │   └── …                         # 30+ type files for CRM entities
    ├── hooks/                        # Shared custom hooks
    ├── lib/                          # Utility functions
    └── styles/
        └── globals.css               # Tailwind directives + CSS variables
```

---

## 4. Application Architecture

### Architecture Pattern
- **Feature-slice architecture**: Each feature is self-contained with its own `components/`, `pages/`, `hooks/`, `types.ts`, and `mockData.ts`.
- **API contract pattern**: `services/api/` defines TypeScript interfaces. `services/mock/` provides in-memory implementations. A future real REST client only needs to implement the same interfaces.
- **Lazy loading**: All page components are code-split via `lazyPage()` wrapper using React Router's `lazy:` property.
- **Role-based rendering**: The `AppShell` + `Sidebar` read the user's role from Zustand and render the appropriate navigation configuration (`NAV_ITEMS`, `MENTOR_NAV_ITEMS`, or `STUDENT_NAV_ITEMS`).

### Data Flow
```
User Action → React Component
           → TanStack Query (data fetching) or Zustand (auth/UI)
           → services/api/* interface
           → services/mock/* implementation (currently)
           → Local in-memory state (returned as Promise)
```

### State Layers
| Layer | Technology | Scope |
|---|---|---|
| Auth & Session | Zustand (persisted to localStorage) | Global |
| UI State | Zustand (in-memory) | Global |
| Server Data | TanStack React Query | Per-page cache |
| Form State | React Hook Form | Per-form |
| Local Preference | `usePersistentState` (localStorage) | Per-user |
| Component UI | `useState` / `useReducer` | Per-component |

---

## 5. Entry Points and Application Initialization

### Boot Sequence
1. `index.html` → loads `/src/main.tsx`
2. `main.tsx` → imports `globals.css`, Inter font, mounts `<App />` in `<StrictMode>`
3. `App.tsx` → wraps `<RouterProvider>` inside `<Providers>`
4. `Providers.tsx`:
   - Creates `QueryClient` (staleTime 30s, retry 2x on transient errors)
   - Registers online/offline event listeners via `onlineManager`
   - Resets query cache on session change (`useResetCacheOnSessionChange`)
   - Provides `<Toaster>` and `<TooltipProvider>`
5. `router.tsx` → `createBrowserRouter` with all public + protected routes
6. `ProtectedRoute` guard → checks authentication, onboarding status, and role

### Router Configuration (`app/router.tsx`)
- Public routes: `/login`, `/register`, `/forgot-password`, `/accept-invite`
- Protected routes: all others, wrapped in `<ProtectedRoute>`
  - Mentor routes: `/mentor/*` (defined in `routes/mentorRoutes.tsx`)
  - Student routes: `/student/*` (defined in `app/routes/app-routes.tsx`)
  - CRM routes: `/dashboard`, `/leads`, `/pipeline`, etc.

---

## 6. Environment Variables and Configuration

### Current `.npmrc`
```
shamefully-hoist=true
```

### Vite Environment Variables (Expected)
No `.env` file is present in the repository. The codebase references `import.meta.env.DEV` for conditional inclusion of developer tools. A production deployment would require:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | REST API base URL |
| `VITE_APP_ENV` | `development` / `production` |

### PWA Configuration
- `theme-color`: `#231bbb` (brand blue)
- `apple-mobile-web-app-title`: "LeadFlow"
- Icons at `/icons/icon-192.png`

### TanStack Query Default Options
| Option | Value |
|---|---|
| `staleTime` | 30,000 ms (30 seconds) |
| `retry` | Up to 2 times, only transient errors |
| `refetchOnWindowFocus` | `false` |
| Mutation retry | `false` |

---

## 7. Application Theme Color (`#231bbb`)

The primary brand color is a deep royal blue (`#231bbb`), consistent across:
- PWA theme color
- Tailwind `primary` token
- Sidebar active states
- Button and link highlights

---

## 8. Complete Frontend Route Inventory

### Public Routes
| Route | Component | Purpose |
|---|---|---|
| `/login` | `LoginPage` | Email + password login |
| `/register` | `RegisterPage` | New workspace registration |
| `/forgot-password` | `ForgotPasswordPage` | Password reset request |
| `/accept-invite` | `AcceptInvitePage` | Accept workspace invitation |

### Protected Routes — Student
| Route | Component | Purpose |
|---|---|---|
| `/student/dashboard` | `StudentDashboardPage` | Student home |
| `/student/courses` | `StudentCoursesPage` | Enrolled courses listing |
| `/student/assignments` | `StudentAssignmentsPage` | Assignments & Quizzes |
| `/student/attendance` | `StudentAttendancePage` | Attendance records |
| `/student/projects` | `StudentProjectsPage` | Project workspace list |
| `/student/projects/new` | `CreateProjectPage` | Create new project |
| `/student/projects/:projectId` | `StudentProjectsPage` | Project detail |
| `/student/certificates` | `StudentCertificatesPage` | Earned certificates |
| `/student/profile` | `StudentProfilePage` | Student profile |
| `/student/jobs` | `StudentJobsPage` | Job search/portal |
| `/student/video-class` | `StudentVideoClassPage` | Video class player (lesson viewer) |

### Protected Routes — Mentor
| Route | Component | Purpose |
|---|---|---|
| `/mentor` | `MentorDashboardPage` | Mentor home (index) |
| `/mentor/home` | `MentorDashboardPage` | Mentor home (alias) |
| `/mentor/dashboard` | `MentorDashboardPage` | Mentor home (alias) |
| `/mentor/classes` | `MyClassesPage` | All classes list |
| `/mentor/my-classes` | `MyClassesPage` | Alias for classes |
| `/mentor/classes/:classId` | `ClassDetailsPage` | Class detail |
| `/mentor/batch-overview` | `MyClassesPage` | Batch overview |
| `/mentor/syllabus-completion` | `SyllabusCompletionPage` | Syllabus progress |
| `/mentor/students` | `MyStudentsPage` | My students roster |
| `/mentor/my-students` | `MyStudentsPage` | Alias |
| `/mentor/attendance` | `AttendanceTrackingPage` | Attendance marking |
| `/mentor/attendance-tracking` | `AttendanceTrackingPage` | Alias |
| `/mentor/materials` | `MaterialsPage` | Learning materials |
| `/mentor/materials/upload` | `MaterialsPage` | Upload materials |
| `/mentor/assignments` | `AssignmentsPage` | Assignments list |
| `/mentor/assignments/create` | `CreateAssignmentPage` | Create assignment |
| `/mentor/assignments/new` | `CreateAssignmentPage` | Alias |
| `/mentor/quizzes` | `QuizzesPage` | Quizzes list |
| `/mentor/quizzes/:quizId` | `QuizDetailsPage` | Quiz detail |
| `/mentor/exams` | `ExamsPage` | Exams list |
| `/mentor/exams/:examId` | `ExamDetailsPage` | Exam detail + grading |
| `/mentor/results` | `ResultsPage` | Results overview |
| `/mentor/results/:resultId` | `ResultDetailsPage` | Result detail |
| `/mentor/performance-reports` | `ResultsPage` | Performance analytics |
| `/mentor/timetable` | `TimetablePage` | Weekly timetable |
| `/mentor/schedule` | `SchedulePage` | Class scheduling |
| `/mentor/schedule-1-on-1-sessions` | `SchedulePage` | 1-on-1 scheduling |
| `/mentor/messages` | `MessagesPage` | Messaging |
| `/mentor/notifications` | `NotificationsPage` | Notifications/announcements |
| `/mentor/announcements` | `NotificationsPage` | Alias |
| `/mentor/profile` | `ProfilePage` | Mentor profile |
| `/mentor/settings` | `SettingsPage` | Mentor settings |
| `/mentor/student-submissions-code-reviews` | `StudentSubmissionsCodeReviewsPage` | Code reviews |
| `/mentor/capstone-projects` | `CapstoneProjectsPage` | Capstone overview |
| `/mentor/helpdesk-resource-hub` | `HelpdeskResourceHubPage` | Help desk + resources |

### Protected Routes — CRM (Sales Roles)
| Route | Component | Purpose |
|---|---|---|
| `/dashboard` | `DashboardPage` | CRM KPI dashboard |
| `/follow-ups` | `FollowUpsPage` | Follow-ups |
| `/leads` | `LeadsPage` | Lead list |
| `/leads/:id` | `LeadDetailPage` | Lead detail |
| `/pipeline` | `PipelinePage` | Kanban pipeline |
| `/deals` | `DealsPage` | Deals list |
| `/deals/:id` | `DealDetailPage` | Deal detail |
| `/customers` | `CustomersPage` | Customer list |
| `/customers/:id` | `CustomerPlaceholderPage` | Customer detail |
| `/inbox` | `InboxPage` | Conversation inbox |
| `/inbox/:conversationId` | `InboxPage` | Conversation thread |
| `/tasks` | `TasksPage` | Tasks |
| `/campaigns` | `CampaignsPage` | Campaigns |
| `/campaigns/:id` | `CampaignDetailPage` | Campaign detail |
| `/automations` | `AutomationsPage` | Automation rules |
| `/automations/new` | `AutomationBuilderPage` | Create automation |
| `/automations/:id` | `AutomationBuilderPage` | Edit automation |
| `/reports` | `ReportsPage` | Reports |
| `/reports/performance` | `PerformancePage` | Team performance |
| `/reports/performance/:userId` | `RepDetailPage` | Rep performance |
| `/notifications` | `NotificationsPage` | Notifications |
| `/team` | `TeamPage` | Team management |
| `/audit-logs` | `AuditLogsPage` | Audit logs |
| `/settings/*` | `SettingsLayout` | Settings (16 sub-pages) |
| `/onboarding` | `OnboardingPage` | Initial workspace setup |
| `/dev/data-check` | `DataCheckPage` | Dev-only data checker |

---

## 9. Role-Permission Matrix

| Role | Default Landing Path | Navigation Set |
|---|---|---|
| `super_admin` | `/dashboard` | CRM nav (all resources) |
| `admin` | `/dashboard` | CRM nav (all resources) |
| `manager` | `/dashboard` | CRM nav (filtered) |
| `team_leader` | `/dashboard` | CRM nav (filtered) |
| `salesperson` | `/dashboard` | CRM nav (limited) |
| `mentor` | `/mentor/dashboard` | Mentor LMS nav |
| `student` | `/student/dashboard` | Student LMS nav |

### CRM Role Permissions Overview
The `permissions.ts` file defines `ACTIONS = ['view', 'create', 'edit', 'delete', 'assign', 'export', 'import']` and `DATA_SCOPES = ['own', 'team', 'all']`. Each role has a `PermissionMatrix` record per resource. The backend must enforce these at the API level.

### Feature Permissions (non-resource)
| Permission | Description |
|---|---|
| `view-spend` | View ad spend data |
| `manage-targets` | Manage performance targets |
| `send-broadcasts` | Send broadcast messages |

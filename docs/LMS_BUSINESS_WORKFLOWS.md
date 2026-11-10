# LMS Business Workflows

This document describes every end-to-end workflow supported by the LeadFlow LMS frontend. Each workflow is mapped to the actual components, hooks, state management, and API calls involved.

---

## 1. User Registration and Workspace Creation

**Supported by:** `/register` → `RegisterPage` → `features/auth`

### Flow
```
User visits /register
    → Fills form: Name, Workspace Name, Email, Password
    → Client-side validation via Zod `registerSchema`
    → On submit: POST /auth/register
    → On success: AuthSession returned (user + tenant + token)
    → useAuthStore.setSession(session) stores to Zustand + localStorage
    → ProtectedRoute detects onboardingCompleted === false
    → Redirect to /onboarding
```

### Onboarding Wizard (`/onboarding`)
```
User fills: Workspace Name, Currency, Timezone, Invite Emails
    → POST /auth/onboarding/complete
    → Returns updated Tenant with onboardingCompleted = true
    → useAuthStore.updateTenant(tenant)
    → ProtectedRoute detects onboardingCompleted === true
    → getDefaultPathForRole(user.role) → redirect to role dashboard
```

**State Affected:**
- `useAuthStore.user`, `tenant`, `tenants`, `token`
- `localStorage (leadflow-auth)`

---

## 2. User Login

**Supported by:** `/login` → `LoginPage`

### Flow
```
User visits /login (or is redirected with ?redirect=/student/dashboard)
    → Fills Email + Password
    → Zod validates: email format + password non-empty
    → POST /auth/login
    → On success: AuthSession returned
    → useAuthStore.setSession(session)
    → getSafeRedirect() resolves safe return path
    → Redirected to: /mentor/dashboard | /student/dashboard | /dashboard
```

**Security Notes:**
- `buildLoginUrl(returnTo)` prevents open redirect: only `/`-starting, non-auth-page paths allowed
- `getSafeRedirect()` strips invalid/dangerous redirect targets

---

## 3. Password Reset

**Supported by:** `/forgot-password` → `ForgotPasswordPage`

### Flow
```
User submits email on /forgot-password
    → Zod validates email format
    → POST /auth/forgot-password
    → Response is always 204 (no enumeration)
    → User shown generic success message: "If this email exists, a reset link has been sent"
```

**Note:** No password reset confirmation page (`/reset-password?token=...`) is implemented in the frontend yet.

---

## 4. Invitation Accept Flow

**Supported by:** `/accept-invite?token=...` → `AcceptInvitePage`

### Flow
```
Admin sends invitation email (via backend) with /accept-invite?token=<invite-token>
    → AcceptInvitePage mounts, reads ?token= from URL
    → GET /auth/invitations/:token → receives InvitationDetails
    → UI displays: "You've been invited to <workspace> as <role> by <name>"
    → User fills: Full Name, Password, Confirm Password
    → Zod validates: passwords match
    → POST /auth/invitations/:token/accept
    → AuthSession returned → setSession → redirect to onboarding or dashboard
```

---

## 5. Mentor: Class Management Workflow

**Supported by:** `/mentor/classes` + Quick Action on Dashboard

### 5.1 Add New Class
```
Mentor clicks "Create Class" → AddClassModal opens
    → Fills: Title, Course Code, Program, Year, Semester, Room, Schedule
    → useMentorClasses().addClass(classData)
    → Local mock store updated → class appears in list
    → Dashboard metrics recalculate (totalStudents, activeClassesCount, etc.)
```

### 5.2 View Class Details
```
Mentor clicks a class card → navigate to /mentor/classes/:classId
    → ClassDetailsPage loads class data by ID
    → Shows: class info, enrolled student roster, attendance rate, syllabus %
```

---

## 6. Mentor: Syllabus Completion Tracking Workflow

**Supported by:** `/mentor/syllabus-completion`

### Flow
```
Mentor views SyllabusCompletionPage
    → useSyllabusData() loads per-class syllabus records
    → Grid shows: all classes with module/topic breakdown
    → Mentor clicks a topic → modal to update status:
        completed / in_progress / not_started
    → PATCH /mentor/syllabus/:classId/topics/:topicId
    → Topic status updated → percentages recalculate
    → Dashboard summary card (Syllabus Progress %) updates via shared hook
```

**Note:** The `useSyllabusData()` hook is shared between the Syllabus Completion Page and the Mentor Dashboard Summary Card, ensuring consistent KPI data.

---

## 7. Mentor: Attendance Marking Workflow

**Supported by:** `/mentor/attendance`

### Flow
```
Mentor navigates to Attendance page
    → Selects class/cohort from ClassCohortOption dropdown
    → Session details (SessionInfo) are displayed: subject, time, lecture number
    → Student list loads with current status = "pending"
    → Mentor marks each student: present / absent / late / partial
    → Optionally views telemetry events (join/leave timestamps)
    → Clicks "Submit Attendance"
    → POST /mentor/attendance/sessions/:sessionId/submit
    → Attendance saved → confirmation toast shown
```

**Verification States:** `Verified | Pending | Unverified`
**Evidence Sources:** Include LMS check-in, live video telemetry

---

## 8. Mentor: Assignment Creation & Review Workflow

**Supported by:** `/mentor/assignments` + `/mentor/assignments/create`

### 8.1 Create Assignment
```
Mentor clicks "Create Assignment" → navigate to /mentor/assignments/create
    → CreateAssignmentPage renders form
    → Fills: Title, Batch, Subject, Due Date, Marks, Type, Difficulty, Description
    → Submit → addAssignment(data) updates mock store
    → Redirect back to /mentor/assignments list
```

### 8.2 Review Submissions
```
Mentor opens assignment in list
    → Views submission count vs total students
    → Click "View Submissions" → GET /mentor/assignments/:id/submissions
    → Lists student submissions with repo links
    → Navigate to /mentor/student-submissions-code-reviews for code review
```

---

## 9. Mentor: Exam Scheduling & Grading Workflow

**Supported by:** `/mentor/exams` + `/mentor/exams/:examId`

### 9.1 Schedule Exam
```
Mentor opens /mentor/exams → clicks "Schedule Exam"
    → Form: Title, Class, Subject, Date, Time, Duration, Room, Marks, Instructions
    → POST /mentor/exams
    → Exam appears with status = "upcoming"
```

### 9.2 Enter Grades
```
After exam: status changes to "results_pending"
    → Mentor opens /mentor/exams/:examId
    → ExamDetailsPage shows student grade list
    → Mentor enters marks per student: 0–totalMarks
    → Marks absent students
    → PATCH /mentor/exams/:examId/grades
    → Grades saved → status updates
```

---

## 10. Mentor: Results Publishing Workflow

**Supported by:** `/mentor/results`

### Flow
```
Mentor opens /mentor/results
    → Views all results: pending / published / failed
    → Filters by status
    → Selects results to publish (individual or bulk)
    → POST /mentor/results/:resultId/publish (or bulk)
    → Results status changes to "published"
    → Students can now view their results
```

---

## 11. Mentor: Schedule & Class Planning Workflow

**Supported by:** `/mentor/schedule`

### Flow
```
Mentor opens /mentor/schedule → Calendar view (month/week/day)
    → Existing classes displayed on calendar
    → Click "Add Class" → form: Title, Date, Time, Duration, Type, Room/MeetingLink
    → POST /mentor/schedule → Class appears on calendar
    → If online: meeting platform and link configured
    → Students notified if notifyStudents = true
```

---

## 12. Mentor: Learning Material Upload Workflow

**Supported by:** `/mentor/materials` + `/mentor/materials/upload`

### 12.1 Upload PDF
```
Mentor clicks "Upload Material" → MaterialsPage upload modal
    → Selects "PDF" type
    → Fills: Title, Description, Class, Semester, Module, Topic (opt), Status
    → Picks PDF file
    → POST /mentor/materials/pdf (multipart/form-data)
    → Material appears in list with status = draft or published
```

### 12.2 Add Video (URL)
```
Mentor selects "Video" type
    → Selects "Link" source
    → Pastes YouTube/Vimeo URL
    → POST /mentor/materials/video
    → Video card appears in list
```

---

## 13. Student: Course Video Class Viewing Workflow

**Supported by:** `/student/video-class?id=<lessonId>&courseId=<courseId>`

### Flow
```
Student navigates from /student/courses → clicks "Continue Learning" or specific lesson
    → URL: /student/video-class?id=class-1&courseId=course-fullstack-101
    → StudentVideoClassPage mounts
    → buildLessonIndex() creates flat lesson array from MOCK_COURSES_DATA
    → Finds lesson by id + courseId → sets currentIndex
    → CourseSyllabusSidebar shows: module list, completed lessons (from localStorage)
    → LessonContent renders lesson content blocks in order:
        - Text/notes
        - Video player (mp4 URL)
        - Images/diagrams
        - External links
        - Live class banner (if joinUrl available)
        - Code examples
        - Inline assignment/quiz blocks
    → ContentPreferencesSidebar: student can filter out content types
    → Student watches video → clicks "Mark as Complete"
    → setCompletedLessons updates localStorage
    → Progress % updates in syllabus sidebar
    → "Next" button navigates to next lesson in same course
```

**Lesson Progress Storage:**
- Key: `student-course-learning-progress-v1`
- Format: `{ "course-fullstack-101": ["les-1-1", "les-1-2", "class-1"] }`

**Content Preferences Storage:**
- Key: `student-course-learning-content-preferences-v1`
- Format: `{ "notes": true, "videos": true, "images": false, ... }`

---

## 14. Student: Assignment Submission Workflow

**Supported by:** `/student/assignments` → `SubmitAssignmentModal`

### Flow
```
Student opens /student/assignments
    → Sees task list: assignments + quizzes
    → Filtered by status: pending / submitted / graded
    → Clicks "Submit" on pending assignment
    → SubmitAssignmentModal opens
    → Student fills: GitHub repository URL, Notes/comments, Attachments (opt)
    → Submit → POST /student/assignments/:taskId/submit
    → Task status updates to "submitted"
    → Student can later view mentor feedback and grade
```

---

## 15. Student: Quiz Attempt Workflow

**Supported by:** `/student/assignments` → `QuizAttemptModal` (also accessible from VideoClassPage)

### Flow
```
Student clicks "Attempt Quiz" on a quiz task
    → QuizAttemptModal opens with time limit countdown (e.g., 15 minutes)
    → Questions displayed one by one or all at once
    → Student selects radio button answers
    → Submits → POST /student/assignments/:taskId/quiz-submit
    → Immediate score feedback:
        - Score: "48/50"
        - Per-question correct/incorrect + explanation
    → Task status updates to "graded"
    → Score displayed on assignment list
```

---

## 16. Student: Project Creation Workflow

**Supported by:** `/student/projects/new` → `CreateProjectPage`

### Flow
```
Student clicks "New Project" → navigate to /student/projects/new
    → Step 1: Basic details (Title, Category, Course, Description, Target Date)
    → Step 2: Project type selection: "Individual" or "Group"
    → Step 3 (if Individual): Mentor lookup by mentor ID
        → GET /mentor/lookup?mentorId=MENTOR-001
        → Mentor card displayed → student confirms
    → Step 3 (if Group): Team setup
        → Team Name, Description
        → GitHub-style student ID search (GET /student/lookup?studentId=BCA23001)
        → Add members → assign roles (team_lead / member)
        → Mentor selection
    → Optional: Repository URL, Live Demo URL, Tech Stack
    → Submit → POST /student/projects
    → Redirect to /student/projects/:projectId (project workspace)
```

---

## 17. Student: Project Task Management Workflow

**Supported by:** `/student/projects/:projectId`

### Flow
```
Student opens project workspace
    → Kanban board shows tasks in 4 columns:
        Pending → In Progress → Completed → Rework
    → Student/team lead clicks "Add Task"
    → Form: Title, Description, Assignee (team member), Due Date
    → POST /student/projects/:projectId/tasks
    → Drag task card across columns (via @dnd-kit)
    → PATCH status → /student/projects/:projectId/tasks/:taskId
    → Team members see updated board (requires real-time or polling)
```

---

## 18. Student: Milestone Submission Workflow

**Supported by:** `/student/projects/:projectId` → milestone modal

### Flow
```
Student views milestone list
    → Clicks "Submit" on an in-progress milestone
    → Form opens: Repository Link, Demo URL, Notes, Attachments
    → POST /student/projects/:projectId/milestones/:milestoneId/submit
    → Submission record created with status = "under_review"
    → Mentor reviews submission → updates status to "approved" or "action_required"
    → Mentor feedback/comments appear in ProjectComment thread
```

---

## 19. Student: Profile Update Workflow

**Supported by:** `/student/profile` → `StudentProfilePage`

### Flow
```
Student opens /student/profile
    → GET /student/profile (via StudentProfileApiClient)
    → Profile form populated: APAAR ID, GitHub, LinkedIn, Portfolio
    → Student edits fields → PATCH /student/profile
    → Success toast shown
    → Student can also manage external certificates:
        → Add: POST /student/profile/certificates
        → Update: PATCH /student/profile/certificates/:id
        → Delete: DELETE /student/profile/certificates/:id
```

---

## 20. Student: Job Application Workflow

**Supported by:** `/student/jobs` → `StudentJobsPage`

### Flow
```
Student opens /student/jobs
    → GET /student/jobs (StudentJobsApiClient.getOverview())
    → Jobs list displayed with filters:
        - Work Mode: remote / hybrid / onsite
        - Job Type: internship / full-time / part-time / contract
    → Student clicks "Apply" on a job
    → POST /student/jobs/:jobId/apply
    → Application confirmation → button changes to "Applied"
    → Applications list shows all applied jobs
```

---

## 21. Workspace Switching Workflow

**Supported by:** `WorkspaceSwitcher` component in `Topbar`

### Flow
```
User clicks workspace name in Topbar
    → WorkspaceSwitcher dropdown opens
    → Lists all tenants from useAuthStore().tenants
    → User clicks a different workspace
    → POST /auth/switch-tenant { tenantId: "..." }
    → New AuthSession returned → setSession()
    → TanStack Query cache is reset (useResetCacheOnSessionChange)
    → User is redirected to their role's default path in the new workspace
```

---

## 22. Mentor: Capstone Project Review Workflow

**Supported by:** `/mentor/capstone-projects`

### Flow
```
Mentor opens /mentor/capstone-projects
    → List of capstone projects from assigned students
    → Each project card shows: Title, Student, Status, Milestones completed/total
    → Mentor clicks a project → view details
    → Can update project status: proposal → in-progress → under-review → approved
    → Reviews milestone submissions and adds feedback comments
```

---

## 23. Mentor: Code Review Workflow

**Supported by:** `/mentor/student-submissions-code-reviews`

### Flow
```
Mentor opens /mentor/student-submissions-code-reviews
    → List of pending code submissions
    → Each submission: student name, assignment title, repo URL, submitted date
    → Mentor clicks "Review" → opens repository link in new tab
    → Updates submission status:
        → "pending" → "reviewed" or "needs-revision"
    → Student is notified of review outcome
```

---

## 24. Mentor Dashboard Workflow (Real-Time Calculation)

**Supported by:** `MentorDashboardPage` + hooks

### Flow
```
Mentor lands on /mentor/dashboard
    → useMentorClasses() loads class data
    → useSchedule() loads today's schedule
    → useSyllabusData() loads syllabus completion rates
    → useMemo() recalculates:
        - totalStudents = sum of studentsCount across classes
        - attendanceRate = average across classes
        - syllabusProgress = overall % from syllabusStats
    → Dashboard KPI cards render derived metrics
    → Schedule timeline shows today's classes
    → Quick Actions grid provides shortcuts to common operations
```

---

## Summary: Workflow Coverage Status

| Workflow | Frontend Status | Backend Required |
|---|---|---|
| User Registration + Workspace | ✅ Full UI + mock API | Auth + Tenant endpoints |
| User Login | ✅ Full UI + mock API | Auth endpoint |
| Password Reset | ✅ Request form only | Email service + reset endpoint |
| Accept Invitation | ✅ Full UI + mock API | Invitation system |
| Workspace Switching | ✅ UI implemented | Switch-tenant endpoint |
| Onboarding | ✅ Full UI + mock API | Onboarding endpoint |
| Mentor: Class Management | ✅ UI + local mock | Class CRUD endpoints |
| Mentor: Syllabus Tracking | ✅ UI + local mock | Syllabus APIs |
| Mentor: Attendance Marking | ✅ UI + local mock | Attendance APIs |
| Mentor: Assignment Creation | ✅ UI + local mock | Assignment APIs |
| Mentor: Exam Scheduling | ✅ UI + local mock | Exam APIs |
| Mentor: Grade Entry | ✅ UI + local mock | Grade APIs |
| Mentor: Result Publishing | ✅ UI + local mock | Results APIs |
| Mentor: Learning Materials | ✅ UI + local mock | File upload + material APIs |
| Mentor: Schedule/Calendar | ✅ UI + local mock | Schedule APIs |
| Mentor: Code Review | ✅ UI + local mock | Submission review API |
| Mentor: Capstone Review | ✅ UI + local mock | Capstone APIs |
| Student: Course Viewing | ✅ Full UI + mock data | Course enrollment APIs |
| Student: Video Class Player | ✅ Full UI + localStorage | Course/lesson APIs |
| Student: Assignment Submit | ✅ Full UI + mock data | Assignment submit API |
| Student: Quiz Attempt | ✅ Full UI + mock data | Quiz submit API |
| Student: Project Creation | ✅ Full UI + mock data | Project CRUD APIs |
| Student: Task Management | ✅ Kanban UI + mock | Task CRUD APIs |
| Student: Milestone Submit | ✅ Form UI + mock | Submission API |
| Student: Profile Update | ✅ API client interface exists | Profile PATCH endpoints |
| Student: External Certs | ✅ API client interface exists | Certificate CRUD |
| Student: Job Application | ✅ API client interface exists | Job + application endpoints |
| Student: Attendance View | ✅ UI + mock data | Attendance summary API |
| Student: Certificates View | ⚠️ Mock only | Certificate issuance system |
| Certificate Download | ❌ Not implemented | PDF generation + download |
| Real-time Chat (Mentor) | ⚠️ Static mock messages | WebSocket/messaging backend |
| Notification delivery | ⚠️ Static mock | Push notification system |
| Password Reset Confirmation | ❌ Not implemented | Reset token validation |

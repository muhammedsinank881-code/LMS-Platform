# LMS Modules and Features

---

## 1. Authentication Module

### Routes
| Route | Page | Form |
|---|---|---|
| `/login` | `LoginPage` | Email, password |
| `/register` | `RegisterPage` | Name, workspace name, email, password |
| `/forgot-password` | `ForgotPasswordPage` | Email |
| `/accept-invite` | `AcceptInvitePage` | Name, password, confirm password |

### Forms and Validation (Zod Schemas — `features/auth/schemas.ts`)

#### Login Form (`loginSchema`)
| Field | Type | Validation |
|---|---|---|
| `email` | email string | Valid email format |
| `password` | string | Min 1 character ("Enter your password") |

#### Register Form (`registerSchema`)
| Field | Type | Validation |
|---|---|---|
| `name` | string | Trimmed, min 2 chars ("Enter your full name") |
| `workspaceName` | string | Trimmed, min 2, max 60 chars |
| `email` | email string | Valid email format |
| `password` | string | Min 8 chars ("Use at least 8 characters") |

#### Forgot Password Form (`forgotPasswordSchema`)
| Field | Type | Validation |
|---|---|---|
| `email` | email string | Valid email format |

#### Accept Invite Form (`acceptInviteSchema`)
| Field | Type | Validation |
|---|---|---|
| `name` | string | Trimmed, min 2 chars |
| `password` | string | Min 8 chars |
| `confirmPassword` | string | Must match password (`.refine`) |

### Authentication Mechanism
- **Token-based**: JWT or opaque token stored in Zustand (`auth-store.ts`) → persisted to `localStorage` under key `leadflow-auth`
- **Session**: `AuthSession = { user: SessionUser, tenant: Tenant, tenants: Tenant[], token: string }`
- **Guard logic** (`ProtectedRoute.tsx`):
  1. If not authenticated → redirect to `/login?redirect=<returnTo>`
  2. If authenticated but workspace onboarding not completed → redirect to `/onboarding`
  3. If authenticated and on `/onboarding` but onboarding is complete → redirect to role's default path
  4. Otherwise → render `<Outlet />`

### Logout
- Calls `useAuthStore.signOut({ intentional: true })` which clears user, tenant, tenants, and token from Zustand (and thus localStorage)
- `intentionalSignOut: true` prevents "return here after login" redirect

### Role-Based Redirect (post-login)
```typescript
getDefaultPathForRole('mentor')   → '/mentor/dashboard'
getDefaultPathForRole('student')  → '/student/dashboard'
getDefaultPathForRole(other)      → '/dashboard'
```

---

## 2. Mentor Module

The Mentor module lives at `/mentor/*` and is served to users with `role === 'mentor'`.

### 2.1 Mentor Dashboard (`/mentor/dashboard`)
**Purpose:** Overview of mentor KPIs, today's schedule, announcements, and quick actions.

**Components Used:**
- `MentorWelcomeBanner` — Displays mentor name, title, active batch
- `DashboardSummaryCards` — 5 KPI cards: Total Students, All Classes, Active Classes, Attendance Rate, Syllabus Progress
- `NextClassCard` — Shows next/ongoing class from schedule
- `QuickActionsGrid` — 6 quick action buttons (Mark Attendance, Review Assignment, Upload Material, Schedule Class, etc.)
- `TodayScheduleTimeline` — Timeline of today's classes
- `AnnouncementsCard` — Pinned announcements with edit/delete
- `UpcomingDeadlinesCard` — Upcoming assignment and exam deadlines
- `RecentClassesGrid` — Grid of recent class cards
- `AddClassModal` — Form to add a new class

**Data Sources:**
- `useMentorClasses()` hook — provides mentorClasses array from local mock store
- `useSchedule()` hook — provides todaysClasses from schedule mock data
- `useSyllabusData()` hook — provides syllabus completion stats
- Announcements: local component state (INITIAL_ANNOUNCEMENTS hardcoded)

**Displayed KPIs:**
- `totalStudents`: Sum of `studentsCount` across all mentor classes (fallback: 128)
- `allClassesCount`: Total classes (fallback: 3)
- `activeClassesCount`: Classes where `status === 'active'` (fallback: 2)
- `attendanceRate`: Average attendance rate % (fallback: 92)
- `syllabusProgress`: % from shared syllabus store

**Actions Available:**
- View today's schedule
- Create new class (opens `AddClassModal`)
- Delete or edit announcements (local state only)
- Navigate to class pages via schedule cards

---

### 2.2 My Classes (`/mentor/classes`)
**Purpose:** List and manage all assigned classes/batches.

**Data Entity: `MentorClass`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Class unique ID |
| `title` | string | Class title (e.g., "Data Structures & Algorithms") |
| `courseCode` | string | e.g., "DSA-301" |
| `courseName` | string | Full course name |
| `program` | string | e.g., "BCA" |
| `year` | string | e.g., "3rd Year" |
| `semester` | string | e.g., "Semester 3" |
| `studentsCount` | number | Enrolled student count |
| `room` | string | Room/location |
| `status` | `'active' \| 'completed'` | Class status |
| `iconType` | enum | Visual icon selection |
| `mentorId` | string | Owning mentor's ID |
| `schedule` | string | Schedule description |
| `description` | string | Class description |
| `attendanceRate` | number | Average attendance % |
| `syllabusProgress` | number | Overall syllabus % |
| `enrolledStudents` | `StudentRosterItem[]` | Embedded student roster |

**Filters:** `'all' \| 'active' \| 'completed'`

**Actions:** View class detail, filter by status

**Class Detail Page (`/mentor/classes/:classId`):**
- View class info, enrolled students roster
- `StudentRosterItem` includes: `id, name, rollNumber, email, attendancePercentage, statusToday`

---

### 2.3 Syllabus Completion (`/mentor/syllabus-completion`)
**Purpose:** Track and update syllabus progress across modules and topics for each class.

**Data Entity: `ClassSyllabusRecord`**
| Field | Type | Description |
|---|---|---|
| `classId` | string | Reference to class |
| `className` | string | Class name |
| `courseCode` | string | e.g., "BCA-CS301" |
| `program, year, semester` | string | Program details |
| `totalTopics` | number | Total curriculum topics |
| `completedTopics` | number | Completed topic count |
| `completionPercentage` | number | 0–100% |
| `status` | `'Completed' \| 'On Track' \| 'In Progress' \| 'Behind'` | |
| `modules` | `SyllabusModule[]` | Nested module + topic tree |

**`SyllabusModule`:** `{ id, moduleNumber, title, description?, topics: SyllabusTopic[] }`

**`SyllabusTopic`:** `{ id, title, status: 'completed'|'in_progress'|'not_started', estimatedHours?, completedDate?, notes? }`

**Filters:** `'all' \| 'completed' \| 'in_progress' \| 'not_started'`

**Actions:** Update topic status, view per-class progress

**Note:** The `useSyllabusData()` hook feeds into the `MentorDashboard` for the summary card. Data is currently mock-based.

---

### 2.4 Students (`/mentor/students`)
**Purpose:** View assigned student roster with attendance and academic summary.

**Data Entity: `AssignedStudent`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Student ID |
| `mentorId` | string | Assigned mentor ID |
| `name` | string | Full name |
| `rollNumber` | string | e.g., "BCA23001" |
| `avatarInitials` | string | e.g., "AK" |
| `classBatch` | string | e.g., "BCA - 3rd Year" |
| `email, phone` | string | Contact |
| `attendancePercentage` | number | Attendance % |
| `statusToday` | `'present' \| 'late' \| 'absent'` | Today's status |
| `assignedMentorName` | string | Mentor name |
| `recentAttendance` | `RecentAttendanceRecord[]` | Last few days |
| `academicSummary` | `AcademicSummary` | GPA, assignments, capstone |

**`AcademicSummary`:** `{ gpa, assignmentsCompleted, totalAssignments, capstoneProject }`

**Actions:** View student detail, filter by class/batch, search by name

---

### 2.5 Attendance Tracking (`/mentor/attendance`)
**Purpose:** Mark and verify student attendance for a specific class session.

**Data Entities:**

**`StudentAttendanceRecord`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Record ID |
| `name` | string | Student name |
| `rollNumber` | string | Roll number |
| `avatarInitials` | string | Display initials |
| `status` | `AttendanceStatus` | `'present'\|'absent'\|'late'\|'partial'\|'pending'` |
| `hasLiveVideo` | boolean | Whether live video is active |
| `durationMinutes, totalMinutes` | number | Time tracked |
| `firstEntry, lastExit` | string | Timestamps |
| `verificationState` | `'Verified'\|'Pending'\|'Unverified'` | |
| `evidenceSource` | string | |
| `telemetryEvents` | `TelemetryEvent[]` | Join/leave/reconnect events |

**`SessionInfo`:** `{ id, subject, title, badgeText, lecture, timeRange, evidenceSource, verificationState }`

**`ClassCohortOption`:** `{ id, name, totalStudents, code? }` — for cohort selector

**Actions:** Select class/batch, mark attendance per student, verify attendance records, view telemetry timeline

---

### 2.6 Learning Materials (`/mentor/materials`)
**Purpose:** Upload and manage learning resources (PDFs and videos) for classes.

**Data Entity: `LearningMaterial`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Material ID |
| `title` | string | Material title |
| `description` | string (opt) | Description |
| `type` | `'pdf' \| 'video'` | Content type |
| `courseClass` | string | Associated class |
| `semester` | string | Semester |
| `module` | string | Module name |
| `topic` | string (opt) | Topic name |
| `status` | `'published' \| 'draft'` | Visibility |
| `uploadedDate` | string | ISO date |
| `uploadedBy` | string | Mentor ID/name |
| `fileName, fileSize, fileUrl` | string (opt) | PDF fields |
| `videoSource` | `'upload' \| 'url'` (opt) | Video source |
| `videoUrl` | string (opt) | Video URL |
| `duration` | string (opt) | e.g., "45m" |

**Filters:** `'all' \| 'pdf' \| 'video'`, course, module, status, sort (`'recent'\|'oldest'\|'az'`)

**Actions:** Upload PDF, add video (URL or upload), filter materials, publish/draft toggle

---

### 2.7 Assignments (`/mentor/assignments`)
**Purpose:** Create, manage, and review student assignments.

**Data Entity: `AssignmentItem`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Assignment ID |
| `title` | string | Title |
| `classBatch` | string | Target class/batch |
| `subject` | string (opt) | Subject name |
| `dueDate` | string | Due date string |
| `startDate` | string (opt) | Available from date |
| `submissionsCount` | number | Received submissions |
| `totalStudents` | number | Expected submissions |
| `totalMarks` | number (opt) | Maximum marks |
| `passingMarks` | number (opt) | Passing threshold |
| `status` | `'active' \| 'graded' \| 'draft'` | |
| `assignmentType` | string (opt) | e.g., "Lab Assignment" |
| `difficulty` | `'Easy'\|'Medium'\|'Hard'` (opt) | |
| `submissionType` | string (opt) | e.g., "GitHub repo" |
| `description` | string (opt) | Assignment description |

**Create Assignment Form (`CreateAssignmentPage`):**
Fields expected from UI (not fully documented in code but inferable):
- Title, class/batch, subject, due date, start date, total marks, passing marks, assignment type, difficulty, description, instructions

**Actions:** Create assignment, view submissions count, filter by status (active/graded/draft)

---

### 2.8 Quizzes (`/mentor/quizzes`)
**Purpose:** Create and manage timed multiple-choice quizzes for student evaluation.

**Data stored in `mockData.ts`** — 13KB+ of mock quiz data

**Actions:** View all quizzes, create quiz, view quiz detail (`/mentor/quizzes/:quizId`), filter by status

---

### 2.9 Exams (`/mentor/exams`)
**Purpose:** Schedule examinations, track status, and enter student grades.

**Data Entity: `MentorExam`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Exam ID |
| `title` | string | Exam title |
| `classBatch` | string | Class/batch |
| `courseName` | string | Course name |
| `subject` | string | Subject |
| `year` | string | Academic year |
| `date` | string | YYYY-MM-DD |
| `formattedDate` | string | Display date |
| `time` | string | e.g., "02:00 PM" |
| `duration` | string | e.g., "3 Hours" |
| `studentsCount` | number | Expected count |
| `room` | string | Exam room |
| `status` | `ExamStatus` | `'ongoing'\|'upcoming'\|'completed'\|'results_pending'` |
| `totalMarks, passingMarks` | number | Grading |
| `instructions` | string (opt) | Exam instructions |
| `mentorId` | string | Assigned mentor |
| `studentGrades` | `StudentGradeItem[]` | Per-student grades |

**`StudentGradeItem`:** `{ id, name, rollNumber, email, marksObtained, totalMarks, grade, status: 'graded'|'pending'|'absent' }`

**Filters:** `'all' \| 'upcoming' \| 'today' \| 'completed' \| 'results_pending'`

**Actions:** Schedule exam, view exam detail, enter/edit grades, filter by status

---

### 2.10 Results (`/mentor/results`)
**Purpose:** View and publish student exam results.

**Data Entity: `StudentResult`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Result ID |
| `studentId` | string | e.g., "BCA23001" |
| `studentName, studentEmail` | string | Identity |
| `examId, examName` | string | Exam reference |
| `subject, classBatch, courseName` | string | Context |
| `marksObtained, totalMarks` | number | Scores |
| `percentage` | number | Calculated % |
| `grade` | string | e.g., "A+", "B" |
| `status` | `'published'\|'pending'\|'draft'\|'failed'` | |
| `publishedDate` | string (opt) | When published |
| `remarks` | string (opt) | Mentor remarks |
| `mentorId` | string | Mentor reference |

**Filters:** `'all' \| 'published' \| 'pending' \| 'failed'`

**Actions:** View results list, view result detail, publish results, filter

---

### 2.11 Timetable (`/mentor/timetable`)
**Purpose:** View weekly teaching timetable.

**Data Source:** Mock data (`mockData.ts`)

**Actions:** View weekly grid of scheduled classes

---

### 2.12 Schedule & Classes (`/mentor/schedule`)
**Purpose:** Full calendar for scheduling, managing, and tracking classes.

**Data Entity: `ScheduledClass`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Schedule entry ID |
| `title` | string | Class/lecture title |
| `courseClass` | string | Class name |
| `semester, module` | string | Academic context |
| `date` | string | YYYY-MM-DD |
| `startTime, endTime` | string | e.g., "09:00 AM" |
| `duration` | string | e.g., "1 hour" |
| `type` | `'in-person' \| 'online'` | |
| `room` | string (opt) | Physical room |
| `meetingPlatform` | `'Google Meet'\|'Zoom'\|'Teams'\|'Other'` (opt) | |
| `meetingLink` | string (opt) | Online class URL |
| `description` | string (opt) | |
| `attachedMaterialTitles` | string[] (opt) | Linked materials |
| `capacity` | number | Max students |
| `attendanceRequired` | boolean | |
| `allowRecording` | boolean | |
| `notifyStudents` | boolean | |
| `status` | `'scheduled'\|'ongoing'\|'completed'\|'cancelled'` | |

**Calendar Views:** `'month' \| 'week' \| 'day'`

**Filters:** search, course, semester, module, type, status, date

**Actions:** Create class schedule entry, view calendar, filter sessions

---

### 2.13 Notifications (`/mentor/notifications`)
**Purpose:** System announcements and alerts.

**Actions:** View notifications list, mark as read

---

### 2.14 Messages (`/mentor/messages`)
**Purpose:** Messaging interface for mentor-student communication.

**Actions:** View conversations, send messages

---

### 2.15 Student Submissions & Code Reviews (`/mentor/student-submissions-code-reviews`)
**Purpose:** Review student code submissions and provide feedback.

**Data Entity: `Submission`**
| Field | Type |
|---|---|
| `id` | string |
| `studentId` | string |
| `assignmentTitle` | string |
| `submittedAt` | string |
| `status` | `'pending'\|'reviewed'\|'needs-revision'` |
| `repoUrl` | string (opt) |

**Actions:** View submissions, change review status, view repository link

---

### 2.16 Capstone Projects (`/mentor/capstone-projects`)
**Purpose:** Overview of student capstone projects.

**Data Entity: `CapstoneProject`**
| Field | Type |
|---|---|
| `id` | string |
| `title` | string |
| `studentId` | string |
| `mentorId` | string |
| `status` | `'proposal'\|'in-progress'\|'under-review'\|'approved'` |
| `milestonesCompleted` | number |
| `totalMilestones` | number |

**Actions:** View project list, update status

---

### 2.17 Helpdesk & Resource Hub (`/mentor/helpdesk-resource-hub`)
**Purpose:** Handle student support tickets and maintain teaching resources.

**Data Entities:**

**`SupportTicket`:** `{ id, studentId, subject, category, status: 'open'|'in-progress'|'resolved', createdAt }`

**`ResourceItem`:** `{ id, title, type: 'document'|'video'|'link'|'code', url }`

**Actions:** View/respond to tickets, manage resources

---

### 2.18 Profile (`/mentor/profile`)
**Purpose:** Mentor profile view/edit.

**Actions:** View profile, edit profile

---

### 2.19 Settings (`/mentor/settings`)
**Purpose:** Mentor personal settings and preferences.

---

## 3. Student Module

The Student module lives at `/student/*` and is served to users with `role === 'student'`.

### 3.1 Student Dashboard (`/student/dashboard`)
**Purpose:** Student home page with course progress, attendance, assignments, certificates, mentor chat, and announcements.

**Components Used:**
- `StudentStatsCards` — 5 stat cards: Attendance %, Total Classes, Streak Days, Progress %, Pending Tasks
- `AttendanceAnalyticsCard` — Weekly hours bar chart (Recharts), check-in/out times
- `ActiveCourseCard` — Active course card with progress bar, mentor info, live class status
- `AssignmentsDeadlinesCard` — Due today and upcoming assignments
- `PendingClassesSidebar` — Queue of pending video lessons
- `StudentCertificatesWidget` — Earned certificates grid
- `MentorChatWidget` — Chat history with mentor (WhatsApp style)
- `StudentAnnouncementsWidget` — Announcements and notices

**Data Source:** `MOCK_STUDENT_DATA` (all hardcoded in `student-data.ts`)

**No API integration** — fully mock-based.

---

### 3.2 My Courses (`/student/courses`)
**Purpose:** Grid of enrolled courses with progress, filtering, and bookmarks.

**Data Entity: `StudentCourse`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Course ID |
| `title` | string | Course title |
| `code` | string | e.g., "FS-2026" |
| `category` | `CourseCategory` | Full-Stack, Frontend, etc. |
| `status` | `'in_progress'\|'completed'\|'not_started'` | |
| `progress` | number | 0–100% |
| `completedModules, totalModules` | number | Module counts |
| `completedLessons, totalLessons` | number | Lesson counts |
| `totalDuration` | string | e.g., "48h 30m" |
| `rating` | number | 1–5 |
| `nextLessonId, nextLessonTitle` | string | Navigation |
| `instructor` | `{ name, role, avatar }` | Instructor info |
| `thumbnail` | string (URL) | Course image |
| `isBookmarked` | boolean | User bookmark |
| `isLiveClassActive` | boolean (opt) | Live session active |
| `liveClassTime` | string (opt) | e.g., "Today at 05:00 PM" |
| `certificateId, certificateUrl` | string (opt) | Post-completion |
| `lastAccessed` | string (opt) | Relative time |
| `description` | string | Course summary |
| `modules` | `CourseModule[]` | Nested modules |

**`CourseModule`:** `{ id, title, duration, completedLessonsCount, totalLessonsCount, lessons: CourseLesson[] }`

**`CourseLesson`:** `{ id, title, duration, isCompleted, isCurrent?, videoUrl?, content?: LessonContentBlock[] }`

**Filters:** Category (`All, Full-Stack, Frontend, Backend, UI/UX, Mobile, DevOps`), Status (`all, in_progress, completed, bookmarked`)

**Data Source:** `MOCK_COURSES_DATA` (hardcoded, 5 courses)

**Actions:** View course, bookmark/unbookmark, navigate to video class, view certificate

---

### 3.3 Video Class Player (`/student/video-class?id=<lessonId>&courseId=<courseId>`)
**Purpose:** Lesson viewer with video player, syllabus sidebar, lesson content blocks, and content preference controls.

**Features:**
- Three-panel layout: `CourseSyllabusSidebar` | `LessonContent` | `ContentPreferencesSidebar`
- Mobile responsive with Drawer panels
- Content types supported: `text/notes, video, image, diagram, external-link, live-class, code, download, assignment, quiz`
- Progress tracking via `localStorage` (`student-course-learning-progress-v1`)
- Content preferences via `localStorage` (`student-course-learning-content-preferences-v1`)
- Live class join button (when `joinUrl` available)
- "Mark Complete" button per lesson
- Navigation between previous/next lessons
- Assignment submission modal (`SubmitAssignmentModal`)
- Quiz attempt modal (`QuizAttemptModal`)

**`LessonContentBlock` Union Type:**
```typescript
| { type: 'text' | 'notes'; title, body }
| { type: 'video'; title, url, caption? }
| { type: 'image' | 'diagram'; title, url, alt, caption? }
| { type: 'external-link'; title, url, description? }
| { type: 'live-class'; title, scheduledAt?, joinUrl? }
| { type: 'code'; title, code, language?, caption? }
| { type: 'download'; title, url, description? }
| { type: 'assignment' | 'quiz'; taskId }
```

---

### 3.4 Assignments & Quizzes (`/student/assignments`)
**Purpose:** Student portal to view, submit assignments and attempt quizzes.

**Data Entity: `StudentTask`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Task ID |
| `title` | string | Task title |
| `type` | `'assignment' \| 'quiz'` | |
| `course, courseCode` | string | Course reference |
| `dueDate` | string | Due date text |
| `isDueToday` | boolean | Due today flag |
| `isOverdue` | boolean (opt) | Overdue flag |
| `status` | `'pending'\|'submitted'\|'graded'` | |
| `points` | number | Max points |
| `score` | string (opt) | e.g., "98/100" |
| `scorePercentage` | number (opt) | % score |
| `mentorName, mentorAvatar` | string | Assigned mentor |
| `description` | string | Task description |
| `instructions` | string[] (opt) | Step-by-step guide |
| `submittedAt, submittedRepoUrl, submittedNotes` | string (opt) | Submission data |
| `feedbackNotes` | string (opt) | Mentor feedback |
| `timeLimitMinutes` | number (opt) | Quiz time limit |
| `questions` | `QuizQuestion[]` (opt) | Quiz questions |

**`QuizQuestion`:** `{ id, question, options: string[], correctOptionIndex, explanation? }`

**Stats Entity: `AssignmentStats`:** `{ totalTasks, pendingCount, dueTodayCount, submittedCount, gradedCount, averageScore }`

**Assignment Submission Form (`SubmitAssignmentModal`):**
- Repository URL (GitHub link)
- Notes/comments
- File attachments (if supported)

**Quiz Attempt Modal (`QuizAttemptModal`):**
- Timed multiple-choice question sequence
- Immediate score feedback
- Options displayed as radio buttons

**Data Source:** `MOCK_TASKS_DATA` (hardcoded, 5 tasks)

---

### 3.5 Attendance (`/student/attendance`)
**Purpose:** Student's personal attendance history and analytics.

**Data Source:** `MOCK_STUDENT_DATA.attendance` and `weeklyData`

**Displayed Data:**
- Total classes, attended, absents, percentage
- Today's check-in/check-out/hours
- Weekly attendance bar chart

---

### 3.6 Projects (`/student/projects`)
**Purpose:** Student project workspace for managing capstone/course projects with task boards and mentor feedback.

**Data Entity: `Project`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Project ID |
| `title` | string | Project title |
| `subtitle` | string (opt) | Short subtitle |
| `courseName` | string | Associated course |
| `category` | string | Project category |
| `description` | string | Overview |
| `projectType` | `'individual' \| 'group'` | |
| `status` | `'in_progress'\|'under_review'\|'completed'\|'needs_revision'` | |
| `progressPercentage` | number | 0–100% |
| `repositoryUrl` | string | GitHub link |
| `liveDemoUrl` | string | Live demo URL |
| `mentor` | `ProjectMentor` | Assigned mentor |
| `team` | `ProjectTeam` (opt) | Group project team |
| `startDate, targetDate` | string | Timeline |
| `daysRemaining` | number | Countdown |
| `techStack` | string[] | Technologies used |
| `tasks` | `ProjectTask[]` | Kanban tasks |
| `comments` | `ProjectComment[]` | Discussion thread |
| `milestones` | `ProjectMilestone[]` | Milestone list |
| `submissions` | `Submission[]` | Submission history |
| `mentorComments` | `MentorComment[]` | Mentor reviews |

**`ProjectTask`:** `{ id, title, description, status: 'pending'|'in_progress'|'completed'|'rework', createdAt, createdBy, assignee?, dueDate?, completedAt? }`

**`ProjectTeam`:** `{ id, name, description?, members: ProjectTeamMember[], mentor? }`

**`ProjectTeamMember`:** `{ id, name, avatar?, role: 'team_lead'|'member', email?, progress, completedMilestones, status, lastActivity?, isCurrentUser?, studentId? }`

**`ProjectMilestone`:** `{ id, milestoneNumber, title, description, dueDate, status, deliverableFormat, instructions, rubricCriteria, totalPoints, earnedPoints? }`

**Create Project Form (`CreateProjectPage`):**
| Field | Type | Required |
|---|---|---|
| `title` | string | Yes |
| `category` | string | Yes |
| `courseName` | string | Yes |
| `description` | string | Yes |
| `projectType` | `'individual' \| 'group'` | Yes |
| `targetDate` | date | Yes |
| `repositoryUrl` | URL (opt) | No |
| `liveDemoUrl` | URL (opt) | No |
| `techStackText` | string (opt) | No |
| `mentor` | Mentor lookup (opt) | No |
| `teamName` | string (opt if group) | Group only |
| `teamDescription` | string (opt) | Group only |
| `groupMembers` | `SelectedGroupMember[]` | Group only |

**Student Lookup:** `{ studentId, name, email, avatar, course, batch, defaultRole? }` — for group member search by student ID

**Actions:** View project list, create project, view project detail, manage tasks (kanban), submit milestone, view mentor feedback, add comments

---

### 3.7 Certificates (`/student/certificates`)
**Purpose:** View earned course completion certificates and external certifications.

**Data Sources:**
- Internal certificates: from `MOCK_STUDENT_DATA.certificates` (mock)
- External certificates: via `StudentProfileApiClient.addExternalCertificate()` (API-connected)

**`StudentCertificate` (mock):** `{ id, title, issuer, issueDate, credentialId, badgeColor }`

**`ExternalStudentCertificate` (API type):** `{ id, title, issuer, issueDate: string|null, credentialUrl: string|null }`

**Actions:** View certificates, add external certificate, delete external certificate

---

### 3.8 Student Profile (`/student/profile`)
**Purpose:** Student-maintained profile page with career links and external certificates.

**Data Entity: `StudentProfileView`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Profile ID |
| `userId` | string | Linked user account |
| `apaarId` | string (nullable) | India APAAR ID |
| `careerLinks` | object | `{ github, linkedIn, portfolio }` |
| `externalCertificates` | `ExternalStudentCertificate[]` | |
| `account` | object | `{ name, email, phone, avatarUrl }` (read-only) |
| `updatedAt` | string | Last update |

**API Integration:** `studentProfile.get()`, `studentProfile.update()`, `studentProfile.addExternalCertificate()`, `studentProfile.updateExternalCertificate()`, `studentProfile.deleteExternalCertificate()`

**Note:** This is one of the only student features with real API client interfaces (not just mock data).

**Patch Input:** `{ apaarId?, careerLinks?: { github?, linkedIn?, portfolio? } }`

---

### 3.9 Job Search (`/student/jobs`)
**Purpose:** Browse and apply for job/internship listings from the LMS job portal.

**Data Entity: `StudentJob`**
| Field | Type | Description |
|---|---|---|
| `id` | string | Job ID |
| `title` | string | Job title |
| `company` | string | Company name |
| `description` | string | Job description |
| `location` | string | City/location |
| `workMode` | `'remote'\|'hybrid'\|'onsite'` | |
| `jobType` | `'internship'\|'full-time'\|'part-time'\|'contract'` | |
| `salaryMinLpa, salaryMaxLpa` | number (nullable) | Salary range in LPA |
| `experience` | string | e.g., "0-1 years" |
| `skills` | string[] | Required skills |
| `source` | `'LMS job portal (demo)'` | Always this value (demo only) |

**`StudentJobApplication`:** `{ id, studentId, jobId, appliedAt, status: 'applied' }`

**API Integration:** `studentJobs.getOverview()`, `studentJobs.apply(jobId)`

**Actions:** Browse jobs, filter by work mode/job type/skills, apply to job

---

## 4. CRM Module (Sales Roles)

The CRM module is separate from the LMS and serves roles: `super_admin`, `admin`, `manager`, `team_leader`, `salesperson`.

### 4.1 Features (High-level)
| Feature | Path | Purpose |
|---|---|---|
| Dashboard | `/dashboard` | KPI overview |
| Follow-ups | `/follow-ups` | Due/overdue/upcoming activities |
| Leads | `/leads`, `/leads/:id` | Lead management |
| Pipeline | `/pipeline` | Kanban pipeline stages |
| Deals | `/deals`, `/deals/:id` | Deal tracking |
| Customers | `/customers`, `/customers/:id` | Won lead history |
| Inbox | `/inbox`, `/inbox/:conversationId` | WhatsApp/email conversations |
| Tasks | `/tasks` | CRM tasks |
| Campaigns | `/campaigns`, `/campaigns/:id` | Marketing campaigns |
| Automations | `/automations` | Workflow automation |
| Reports | `/reports`, `/reports/performance` | Analytics |
| Team | `/team` | Member management |
| Audit Logs | `/audit-logs` | Change history |
| Settings | `/settings/*` | 16 configuration sub-pages |

All CRM features have full API client interfaces defined in `services/api/` and are backed by mock implementations in `services/mock/`.

---

## 5. Onboarding Module (`/onboarding`)
**Purpose:** First-time workspace setup wizard for new admin users.

**Form Fields (`CompleteOnboardingInput`):**
| Field | Type | Description |
|---|---|---|
| `workspaceName` | string | Workspace name |
| `currency` | string | ISO 4217 code (e.g., "INR") |
| `timezone` | string | IANA timezone (e.g., "Asia/Kolkata") |
| `inviteEmails` | string[] | Emails to invite as salespeople |

**Behavior:** After successful completion, `tenant.onboardingCompleted` is set to `true`, redirecting the user to their role's default path.

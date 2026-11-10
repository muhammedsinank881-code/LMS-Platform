# LMS API Requirements

This document lists every backend operation required by the LeadFlow LMS frontend. It is organized by module and includes HTTP method, endpoint, request/response shapes, and authentication requirements.

**Legend:**
- ✅ **API Client Interface Exists** — `services/api/` has a TypeScript interface; mock implementation exists
- ⚠️ **Mock Only** — No API interface defined; data is hardcoded in component/mock files
- 🔒 **Auth Required** — All protected endpoints require `Authorization: Bearer <token>` header

---

## API Base URL Convention

All endpoints assume a base URL like:
```
https://api.leadflow.app/v1
```

---

## SECTION 1: Authentication APIs

✅ **API Client:** `services/api/auth.ts` → `AuthApiClient`

---

### 1.1 Login
```
POST /auth/login
```
**Request Body:**
```json
{ "email": "user@example.com", "password": "mypassword" }
```
**Response:**
```json
{
  "user": { "id": "...", "tenantId": "...", "name": "...", "email": "...", "role": "mentor", "teamId": null, "avatarUrl": null },
  "tenant": { "id": "...", "name": "...", "slug": "...", "currency": "INR", "timezone": "Asia/Kolkata", "onboardingCompleted": true, "createdAt": "..." },
  "tenants": [...],
  "token": "eyJhbGc..."
}
```
**Auth:** None (public)

---

### 1.2 Register (Create Workspace)
```
POST /auth/register
```
**Request Body:**
```json
{ "name": "Hasna PK", "email": "hasna@example.com", "password": "mypassword123", "workspaceName": "LeadFlow Academy" }
```
**Response:** Same as login (full `AuthSession`)
**Auth:** None (public)

---

### 1.3 Request Password Reset
```
POST /auth/forgot-password
```
**Request Body:**
```json
{ "email": "hasna@example.com" }
```
**Response:** `204 No Content` (always resolves, even if email doesn't exist — prevents account enumeration)
**Auth:** None (public)

---

### 1.4 Get Invitation Details
```
GET /auth/invitations/:token
```
**Response:**
```json
{
  "token": "invite-token-123",
  "email": "newuser@example.com",
  "tenantName": "LeadFlow Academy",
  "role": "salesperson",
  "invitedByName": "Admin User"
}
```
**Auth:** None (public, invitation token is the credential)

---

### 1.5 Accept Invitation
```
POST /auth/invitations/:token/accept
```
**Request Body:**
```json
{ "token": "invite-token-123", "name": "New User", "password": "mypassword123" }
```
**Response:** Full `AuthSession`
**Auth:** None (public)

---

### 1.6 Switch Tenant (Workspace Switcher)
```
POST /auth/switch-tenant
```
**Request Body:**
```json
{ "tenantId": "ten-002" }
```
**Response:** Full `AuthSession` for the new tenant
**Auth:** 🔒 Bearer token

---

### 1.7 Complete Onboarding
```
POST /auth/onboarding/complete
```
**Request Body:**
```json
{
  "workspaceName": "LeadFlow Academy",
  "currency": "INR",
  "timezone": "Asia/Kolkata",
  "inviteEmails": ["sales1@example.com", "sales2@example.com"]
}
```
**Response:** Updated `Tenant` object
**Auth:** 🔒 Bearer token, role: `admin`

---

### 1.8 Logout
```
POST /auth/logout
```
**Request Body:** None
**Response:** `204 No Content`
**Auth:** 🔒 Bearer token

---

## SECTION 2: Student Profile APIs

✅ **API Client:** `services/api/student-profile.ts` → `StudentProfileApiClient`

---

### 2.1 Get Student Profile
```
GET /student/profile
```
**Response:**
```json
{
  "id": "profile-001",
  "userId": "usr-001",
  "tenantId": "ten-001",
  "apaarId": "APAAR-12345678",
  "careerLinks": { "github": "...", "linkedIn": "...", "portfolio": "..." },
  "externalCertificates": [...],
  "updatedAt": "2026-11-01T10:00:00Z",
  "account": { "name": "Ahmed Khan", "email": "ahmed@student.test", "phone": "...", "avatarUrl": "..." }
}
```
**Auth:** 🔒 Bearer token, role: `student`
**Scope:** Returns only the authenticated student's profile

---

### 2.2 Update Student Profile
```
PATCH /student/profile
```
**Request Body:**
```json
{
  "apaarId": "APAAR-87654321",
  "careerLinks": { "github": "https://github.com/updated", "linkedIn": null }
}
```
**Response:** Updated `StudentProfileView`
**Auth:** 🔒 Bearer token, role: `student`

---

### 2.3 Add External Certificate
```
POST /student/profile/certificates
```
**Request Body:**
```json
{ "title": "AWS Cloud Practitioner", "issuer": "Amazon Web Services", "issueDate": "2026-08-15", "credentialUrl": "https://aws.amazon.com/verify/..." }
```
**Response:** Updated `StudentProfileView`
**Auth:** 🔒 Bearer token, role: `student`

---

### 2.4 Update External Certificate
```
PATCH /student/profile/certificates/:id
```
**Request Body:** Partial certificate fields
**Response:** Updated `StudentProfileView`
**Auth:** 🔒 Bearer token, role: `student`

---

### 2.5 Delete External Certificate
```
DELETE /student/profile/certificates/:id
```
**Response:** Updated `StudentProfileView`
**Auth:** 🔒 Bearer token, role: `student`

---

## SECTION 3: Student Jobs APIs

✅ **API Client:** `services/api/student-jobs.ts` → `StudentJobsApiClient`

---

### 3.1 Get Jobs Overview
```
GET /student/jobs
```
**Response:**
```json
{
  "jobs": [
    {
      "id": "job-001",
      "title": "React Developer Intern",
      "company": "TechCorp",
      "description": "...",
      "location": "Bangalore",
      "workMode": "hybrid",
      "jobType": "internship",
      "salaryMinLpa": 3,
      "salaryMaxLpa": 6,
      "experience": "0–1 years",
      "skills": ["React", "TypeScript"]
    }
  ],
  "applications": [
    {
      "id": "app-001",
      "studentId": "usr-001",
      "jobId": "job-001",
      "appliedAt": "2026-11-01T09:00:00Z",
      "status": "applied"
    }
  ]
}
```
**Auth:** 🔒 Bearer token, role: `student`
**Query Params:** `?workMode=hybrid&jobType=internship&skills=React,TypeScript`

---

### 3.2 Apply to Job
```
POST /student/jobs/:jobId/apply
```
**Request Body:** None (student identity from token)
**Response:**
```json
{
  "id": "app-002",
  "studentId": "usr-001",
  "jobId": "job-001",
  "appliedAt": "2026-11-06T10:00:00Z",
  "status": "applied"
}
```
**Auth:** 🔒 Bearer token, role: `student`

---

## SECTION 4: Mentor — Classes APIs

⚠️ **Mock Only** — No API interface file. Data served from `my-classes/mockData.ts`

---

### 4.1 Get All Classes for Mentor
```
GET /mentor/classes
```
**Query Params:** `?status=active|completed|all`
**Response:**
```json
{
  "classes": [
    {
      "id": "cls-101",
      "title": "Data Structures & Algorithms",
      "courseCode": "DSA-301",
      "courseName": "CS Core",
      "program": "BCA",
      "year": "3rd Year",
      "semester": "Semester 3",
      "studentsCount": 42,
      "room": "Room 302",
      "status": "active",
      "mentorId": "usr-mentor-01",
      "schedule": "Mon, Wed, Fri — 09:00 AM",
      "description": "...",
      "attendanceRate": 92,
      "syllabusProgress": 65
    }
  ],
  "stats": {
    "totalCount": 5,
    "activeCount": 3,
    "completedCount": 2
  }
}
```
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 4.2 Create Class
```
POST /mentor/classes
```
**Request Body:**
```json
{
  "title": "New Lab Session",
  "courseCode": "WEB-101",
  "courseName": "Full Stack Web",
  "program": "BCA",
  "year": "3rd Year",
  "semester": "Semester 5",
  "room": "Lab 2",
  "schedule": "Tue, Thu — 11:00 AM"
}
```
**Response:** Created `MentorClass` object
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 4.3 Get Class Details
```
GET /mentor/classes/:classId
```
**Response:** Full `MentorClass` with `enrolledStudents[]`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 4.4 Get Students for Class
```
GET /mentor/classes/:classId/students
```
**Response:**
```json
{
  "students": [
    { "id": "std-001", "name": "Ahmed Khan", "rollNumber": "BCA23001", "email": "...", "attendancePercentage": 88, "statusToday": "present" }
  ]
}
```
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 5: Mentor — Attendance APIs

⚠️ **Mock Only**

---

### 5.1 Get Attendance Session
```
GET /mentor/attendance/sessions/:sessionId
```
**Response:**
```json
{
  "session": {
    "id": "sess-001",
    "subject": "DSA",
    "title": "Arrays & Trees",
    "badgeText": "Lab Session",
    "lecture": "Lecture 12",
    "timeRange": "09:00 AM – 10:00 AM",
    "evidenceSource": "LMS Check-in",
    "verificationState": "Pending"
  },
  "students": [
    {
      "id": "std-001",
      "name": "Ahmed Khan",
      "rollNumber": "BCA23001",
      "avatarInitials": "AK",
      "status": "present",
      "durationMinutes": 58,
      "totalMinutes": 60,
      "firstEntry": "09:02 AM",
      "lastExit": "10:00 AM",
      "verificationState": "Verified"
    }
  ]
}
```
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 5.2 Mark Attendance
```
PATCH /mentor/attendance/sessions/:sessionId/students/:studentId
```
**Request Body:**
```json
{ "status": "present" }
```
**Response:** Updated `StudentAttendanceRecord`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 5.3 Bulk Submit Attendance
```
POST /mentor/attendance/sessions/:sessionId/submit
```
**Request Body:** 
```json
{ "records": [ { "studentId": "std-001", "status": "present" } ] }
```
**Response:** `{ "saved": 42, "sessionId": "sess-001" }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 6: Mentor — Materials APIs

⚠️ **Mock Only**

---

### 6.1 Get All Materials
```
GET /mentor/materials
```
**Query Params:** `?type=pdf|video&status=published|draft&course=<id>&module=<name>&sort=recent|oldest|az&search=<term>`
**Response:**
```json
{
  "materials": [...]
}
```
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 6.2 Upload PDF Material
```
POST /mentor/materials/pdf
Content-Type: multipart/form-data
```
**Form Fields:**
- `title` (string)
- `description` (string, optional)
- `courseClass` (string)
- `semester` (string)
- `module` (string)
- `topic` (string, optional)
- `status` (`'published' | 'draft'`)
- `file` (PDF file, binary)

**Response:** Created `LearningMaterial`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 6.3 Add Video Material (URL)
```
POST /mentor/materials/video
```
**Request Body:**
```json
{
  "title": "React Hooks Lecture",
  "courseClass": "BCA 3rd Year",
  "semester": "Semester 5",
  "module": "Module 1",
  "status": "published",
  "videoSource": "url",
  "videoUrl": "https://youtube.com/embed/abc123",
  "duration": "45m"
}
```
**Response:** Created `LearningMaterial`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 6.4 Delete Material
```
DELETE /mentor/materials/:id
```
**Response:** `204 No Content`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 6.5 Publish/Unpublish Material
```
PATCH /mentor/materials/:id/status
```
**Request Body:** `{ "status": "published" | "draft" }`
**Response:** Updated `LearningMaterial`
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 7: Mentor — Assignments APIs

⚠️ **Mock Only**

---

### 7.1 Get All Assignments
```
GET /mentor/assignments
```
**Query Params:** `?status=active|graded|draft`
**Response:** `{ "assignments": [...], "stats": { ... } }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 7.2 Create Assignment
```
POST /mentor/assignments
```
**Request Body:**
```json
{
  "title": "React Custom Hooks Lab",
  "classBatch": "BCA - 3rd Year",
  "subject": "Web Development",
  "dueDate": "2026-10-20",
  "startDate": "2026-10-10",
  "totalStudents": 24,
  "totalMarks": 100,
  "passingMarks": 40,
  "assignmentType": "Lab Assignment",
  "difficulty": "Medium",
  "submissionType": "GitHub",
  "description": "Implement custom attendance hook..."
}
```
**Response:** Created `AssignmentItem`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 7.3 Get Assignment Submissions
```
GET /mentor/assignments/:id/submissions
```
**Response:** List of student submission objects
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 8: Mentor — Quizzes APIs

⚠️ **Mock Only**

---

### 8.1 Get All Quizzes
```
GET /mentor/quizzes
```
**Response:** `{ "quizzes": [...] }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 8.2 Create Quiz
```
POST /mentor/quizzes
```
**Request Body:** Quiz details + questions array
**Response:** Created quiz object
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 8.3 Get Quiz Details
```
GET /mentor/quizzes/:quizId
```
**Response:** Full quiz with questions
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 9: Mentor — Exams APIs

⚠️ **Mock Only**

---

### 9.1 Get All Exams
```
GET /mentor/exams
```
**Query Params:** `?status=upcoming|today|completed|results_pending`
**Response:** `{ "exams": [...], "stats": { "total": 10, "upcoming": 3, "today": 1, "completed": 6 } }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 9.2 Schedule Exam
```
POST /mentor/exams
```
**Request Body:**
```json
{
  "title": "Mid-Term Theory Exam",
  "classBatch": "BCA - 3rd Year",
  "courseName": "CS Core",
  "subject": "Data Structures",
  "date": "2026-10-18",
  "time": "02:00 PM",
  "duration": "3 Hours",
  "room": "Hall A",
  "totalMarks": 100,
  "passingMarks": 40,
  "instructions": "No electronic devices allowed."
}
```
**Response:** Created `MentorExam`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 9.3 Get Exam Details + Grades
```
GET /mentor/exams/:examId
```
**Response:** Full `MentorExam` with `studentGrades[]`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 9.4 Enter/Update Grades
```
PATCH /mentor/exams/:examId/grades
```
**Request Body:**
```json
{
  "grades": [
    { "studentId": "std-001", "marksObtained": 87, "status": "graded" },
    { "studentId": "std-002", "marksObtained": null, "status": "absent" }
  ]
}
```
**Response:** Updated `MentorExam`
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 10: Mentor — Results APIs

⚠️ **Mock Only**

---

### 10.1 Get All Results
```
GET /mentor/results
```
**Query Params:** `?status=published|pending|failed`
**Response:** `{ "results": [...], "stats": { "total": 50, "published": 40, "pending": 8, "averageScore": 76 } }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 10.2 Publish Result
```
POST /mentor/results/:resultId/publish
```
**Response:** Updated `StudentResult` with `status: "published"`, `publishedDate`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 10.3 Bulk Publish Results
```
POST /mentor/results/bulk-publish
```
**Request Body:** `{ "resultIds": ["res-001", "res-002"] }`
**Response:** `{ "published": 20, "failed": 0 }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 11: Mentor — Syllabus Completion APIs

⚠️ **Mock Only**

---

### 11.1 Get Syllabus Records
```
GET /mentor/syllabus
```
**Response:** `{ "records": [...ClassSyllabusRecord[]], "overallStats": { ... } }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 11.2 Update Topic Status
```
PATCH /mentor/syllabus/:classId/topics/:topicId
```
**Request Body:** `{ "status": "completed" | "in_progress" | "not_started", "completedDate"?: "2026-10-15", "notes"?: "..." }`
**Response:** Updated `SyllabusTopic`
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 12: Mentor — Schedule APIs

⚠️ **Mock Only**

---

### 12.1 Get Scheduled Classes
```
GET /mentor/schedule
```
**Query Params:** `?date=2026-11-08&type=in-person|online&status=scheduled|ongoing&course=<id>`
**Response:** `{ "classes": [...ScheduledClass[]] }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 12.2 Create Scheduled Class
```
POST /mentor/schedule
```
**Request Body:** Full `ScheduledClass` (minus id)
**Response:** Created `ScheduledClass`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 12.3 Update Scheduled Class
```
PATCH /mentor/schedule/:id
```
**Request Body:** Partial `ScheduledClass`
**Response:** Updated `ScheduledClass`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 12.4 Cancel Class
```
DELETE /mentor/schedule/:id
```
**Response:** `204 No Content`
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 13: Student — Courses & Lessons APIs

⚠️ **Mock Only**

---

### 13.1 Get Enrolled Courses
```
GET /student/courses
```
**Query Params:** `?status=in_progress|completed|not_started&category=Full-Stack|Frontend|...&bookmarked=true`
**Response:**
```json
{
  "courses": [...StudentCourse[]],
  "stats": { "totalEnrolled": 5, "inProgressCount": 2, "completedCount": 2, "totalHoursLearned": 123 }
}
```
**Auth:** 🔒 Bearer token, role: `student`

---

### 13.2 Get Course Details + Modules + Lessons
```
GET /student/courses/:courseId
```
**Response:** Full `StudentCourse` with nested modules and lessons
**Auth:** 🔒 Bearer token, role: `student`

---

### 13.3 Mark Lesson Complete
```
POST /student/courses/:courseId/lessons/:lessonId/complete
```
**Response:** `{ "lessonId": "...", "completed": true, "courseProgress": 80 }`
**Auth:** 🔒 Bearer token, role: `student`

---

### 13.4 Toggle Course Bookmark
```
POST /student/courses/:courseId/bookmark
```
**Request Body:** `{ "bookmarked": true }`
**Response:** `{ "courseId": "...", "bookmarked": true }`
**Auth:** 🔒 Bearer token, role: `student`

---

## SECTION 14: Student — Assignments & Quizzes APIs

⚠️ **Mock Only**

---

### 14.1 Get Student Tasks (Assignments + Quizzes)
```
GET /student/assignments
```
**Query Params:** `?status=pending|submitted|graded&type=assignment|quiz&courseCode=FS-2026`
**Response:**
```json
{
  "tasks": [...StudentTask[]],
  "stats": { "totalTasks": 5, "pendingCount": 2, "dueTodayCount": 1, "submittedCount": 1, "gradedCount": 2, "averageScore": 97 }
}
```
**Auth:** 🔒 Bearer token, role: `student`

---

### 14.2 Submit Assignment
```
POST /student/assignments/:taskId/submit
```
**Request Body:**
```json
{
  "repositoryUrl": "https://github.com/student/repo",
  "notes": "Implemented with full TypeScript types.",
  "attachments": ["https://storage/file.zip"]
}
```
**Response:** Updated `StudentTask` with `status: "submitted"`
**Auth:** 🔒 Bearer token, role: `student`

---

### 14.3 Submit Quiz Answers
```
POST /student/assignments/:taskId/quiz-submit
```
**Request Body:**
```json
{ "answers": [{ "questionId": "q1", "selectedOptionIndex": 1 }] }
```
**Response:**
```json
{
  "score": "48/50",
  "scorePercentage": 96,
  "correct": 4,
  "total": 5,
  "results": [{ "questionId": "q1", "isCorrect": true, "explanation": "..." }]
}
```
**Auth:** 🔒 Bearer token, role: `student`

---

## SECTION 15: Student — Projects APIs

⚠️ **Mock Only**

---

### 15.1 Get Student Projects
```
GET /student/projects
```
**Response:** `{ "projects": [...Project[]] }`
**Auth:** 🔒 Bearer token, role: `student`

---

### 15.2 Create Project
```
POST /student/projects
```
**Request Body:**
```json
{
  "title": "E-Commerce Platform",
  "category": "Web Application",
  "courseName": "Full-Stack Web Development",
  "description": "...",
  "projectType": "group",
  "targetDate": "2026-12-31",
  "repositoryUrl": "https://github.com/...",
  "liveDemoUrl": "https://demo.vercel.app",
  "techStackText": "React, TypeScript, Node.js",
  "mentor": { "mentorId": "usr-001", "name": "Hasna PK", "role": "Mentor", "avatar": "..." },
  "teamName": "Team Alpha",
  "teamDescription": "Full-stack team",
  "groupMembers": [
    { "studentId": "BCA23002", "name": "Sara", "email": "sara@...", "avatar": "...", "role": "member", "specificRole": "Frontend Dev" }
  ]
}
```
**Response:** Created `Project`
**Auth:** 🔒 Bearer token, role: `student`

---

### 15.3 Get Project Details
```
GET /student/projects/:projectId
```
**Response:** Full `Project` with tasks, milestones, submissions, comments
**Auth:** 🔒 Bearer token, role: `student`

---

### 15.4 Add Project Task
```
POST /student/projects/:projectId/tasks
```
**Request Body:** `{ "title", "description", "assigneeId"?, "dueDate"? }`
**Response:** Created `ProjectTask`
**Auth:** 🔒 Bearer token, role: `student`

---

### 15.5 Update Task Status
```
PATCH /student/projects/:projectId/tasks/:taskId
```
**Request Body:** `{ "status": "in_progress" | "completed" | "rework" }`
**Response:** Updated `ProjectTask`
**Auth:** 🔒 Bearer token, role: `student`

---

### 15.6 Submit Milestone
```
POST /student/projects/:projectId/milestones/:milestoneId/submit
```
**Request Body:**
```json
{
  "repositoryLink": "https://github.com/...",
  "demoLink": "https://...",
  "notes": "All rubric items implemented.",
  "attachments": ["https://storage/screenshot.png"]
}
```
**Response:** Created `Submission`
**Auth:** 🔒 Bearer token, role: `student`

---

### 15.7 Student Lookup (for group members)
```
GET /student/lookup?studentId=BCA23001
```
**Response:**
```json
{
  "studentId": "BCA23001",
  "name": "Ahmed Khan",
  "email": "ahmed@student.test",
  "avatar": "...",
  "course": "BCA",
  "batch": "2023-26"
}
```
**Auth:** 🔒 Bearer token, role: `student`

---

### 15.8 Mentor Lookup (for project mentor)
```
GET /mentor/lookup?mentorId=MENTOR-001
```
**Response:**
```json
{
  "mentorId": "MENTOR-001",
  "name": "Hasna PK",
  "role": "Senior Full-Stack Mentor",
  "email": "hasna@...",
  "avatar": "..."
}
```
**Auth:** 🔒 Bearer token, role: `student`

---

## SECTION 16: Student — Attendance APIs

⚠️ **Mock Only**

---

### 16.1 Get Student Attendance Summary
```
GET /student/attendance
```
**Query Params:** `?startDate=2026-10-01&endDate=2026-10-31`
**Response:**
```json
{
  "summary": {
    "totalClasses": 50,
    "attended": 46,
    "absents": 4,
    "percentage": 92
  },
  "today": {
    "checkIn": "09:15 AM",
    "checkOut": "05:30 PM",
    "hours": 7.5
  },
  "weeklyData": [
    { "day": "Mon", "hours": 6.5, "checkIn": "09:30 AM", "checkOut": "04:00 PM", "status": "present" }
  ]
}
```
**Auth:** 🔒 Bearer token, role: `student`

---

## SECTION 17: Student — Certificates APIs

⚠️ **Mock Only** (internal certificates, not external)

---

### 17.1 Get Student Certificates
```
GET /student/certificates
```
**Response:**
```json
{
  "certificates": [
    { "id": "cert-1", "title": "Full-Stack React & TS Certification", "issuer": "LeadFlow Tech Academy", "issueDate": "Sep 2026", "credentialId": "LF-8849201", "courseId": "course-fullstack-101" }
  ]
}
```
**Auth:** 🔒 Bearer token, role: `student`

---

### 17.2 Download Certificate
```
GET /student/certificates/:certId/download
```
**Response:** PDF file stream
**Auth:** 🔒 Bearer token, role: `student`

---

## SECTION 18: Mentor — Students APIs

⚠️ **Mock Only**

---

### 18.1 Get Assigned Students
```
GET /mentor/students
```
**Query Params:** `?classBatch=<batch>&search=<name>&status=present|absent|late`
**Response:** `{ "students": [...AssignedStudent[]] }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 19: Mentor — Notifications APIs

⚠️ **Mock Only**

---

### 19.1 Get Notifications/Announcements
```
GET /mentor/notifications
```
**Response:** `{ "notifications": [...] }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 19.2 Create Announcement
```
POST /mentor/announcements
```
**Request Body:**
```json
{
  "title": "Internal Exam Schedule",
  "content": "...",
  "category": "Academic Notice",
  "targetAudience": "BCA Department",
  "isPinned": true,
  "attachments": [{ "name": "file.pdf", "url": "...", "size": "1.4 MB", "type": "pdf" }]
}
```
**Response:** Created `AnnouncementItem`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 19.3 Update Announcement
```
PATCH /mentor/announcements/:id
```
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 19.4 Delete Announcement
```
DELETE /mentor/announcements/:id
```
**Auth:** 🔒 Bearer token, role: `mentor`

---

## SECTION 20: Helpdesk & Resource Hub APIs

⚠️ **Mock Only**

---

### 20.1 Get Support Tickets
```
GET /mentor/helpdesk/tickets
```
**Response:** `{ "tickets": [...SupportTicket[]] }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 20.2 Update Ticket Status
```
PATCH /mentor/helpdesk/tickets/:id
```
**Request Body:** `{ "status": "in-progress" | "resolved" }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

### 20.3 Get Resource Hub Items
```
GET /mentor/helpdesk/resources
```
**Response:** `{ "resources": [...ResourceItem[]] }`
**Auth:** 🔒 Bearer token, role: `mentor`

---

## API Endpoint Inventory Table

| # | Method | Endpoint | Auth Role | API Interface? |
|---|---|---|---|---|
| 1 | POST | `/auth/login` | Public | ✅ |
| 2 | POST | `/auth/register` | Public | ✅ |
| 3 | POST | `/auth/forgot-password` | Public | ✅ |
| 4 | GET | `/auth/invitations/:token` | Public | ✅ |
| 5 | POST | `/auth/invitations/:token/accept` | Public | ✅ |
| 6 | POST | `/auth/switch-tenant` | student/mentor/admin | ✅ |
| 7 | POST | `/auth/onboarding/complete` | admin | ✅ |
| 8 | POST | `/auth/logout` | Any | ✅ |
| 9 | GET | `/student/profile` | student | ✅ |
| 10 | PATCH | `/student/profile` | student | ✅ |
| 11 | POST | `/student/profile/certificates` | student | ✅ |
| 12 | PATCH | `/student/profile/certificates/:id` | student | ✅ |
| 13 | DELETE | `/student/profile/certificates/:id` | student | ✅ |
| 14 | GET | `/student/jobs` | student | ✅ |
| 15 | POST | `/student/jobs/:jobId/apply` | student | ✅ |
| 16 | GET | `/mentor/classes` | mentor | ⚠️ |
| 17 | POST | `/mentor/classes` | mentor | ⚠️ |
| 18 | GET | `/mentor/classes/:classId` | mentor | ⚠️ |
| 19 | GET | `/mentor/classes/:classId/students` | mentor | ⚠️ |
| 20 | GET | `/mentor/attendance/sessions/:sessionId` | mentor | ⚠️ |
| 21 | PATCH | `/mentor/attendance/sessions/:sessionId/students/:studentId` | mentor | ⚠️ |
| 22 | POST | `/mentor/attendance/sessions/:sessionId/submit` | mentor | ⚠️ |
| 23 | GET | `/mentor/materials` | mentor | ⚠️ |
| 24 | POST | `/mentor/materials/pdf` | mentor | ⚠️ |
| 25 | POST | `/mentor/materials/video` | mentor | ⚠️ |
| 26 | DELETE | `/mentor/materials/:id` | mentor | ⚠️ |
| 27 | PATCH | `/mentor/materials/:id/status` | mentor | ⚠️ |
| 28 | GET | `/mentor/assignments` | mentor | ⚠️ |
| 29 | POST | `/mentor/assignments` | mentor | ⚠️ |
| 30 | GET | `/mentor/assignments/:id/submissions` | mentor | ⚠️ |
| 31 | GET | `/mentor/quizzes` | mentor | ⚠️ |
| 32 | POST | `/mentor/quizzes` | mentor | ⚠️ |
| 33 | GET | `/mentor/quizzes/:quizId` | mentor | ⚠️ |
| 34 | GET | `/mentor/exams` | mentor | ⚠️ |
| 35 | POST | `/mentor/exams` | mentor | ⚠️ |
| 36 | GET | `/mentor/exams/:examId` | mentor | ⚠️ |
| 37 | PATCH | `/mentor/exams/:examId/grades` | mentor | ⚠️ |
| 38 | GET | `/mentor/results` | mentor | ⚠️ |
| 39 | POST | `/mentor/results/:resultId/publish` | mentor | ⚠️ |
| 40 | POST | `/mentor/results/bulk-publish` | mentor | ⚠️ |
| 41 | GET | `/mentor/syllabus` | mentor | ⚠️ |
| 42 | PATCH | `/mentor/syllabus/:classId/topics/:topicId` | mentor | ⚠️ |
| 43 | GET | `/mentor/schedule` | mentor | ⚠️ |
| 44 | POST | `/mentor/schedule` | mentor | ⚠️ |
| 45 | PATCH | `/mentor/schedule/:id` | mentor | ⚠️ |
| 46 | DELETE | `/mentor/schedule/:id` | mentor | ⚠️ |
| 47 | GET | `/mentor/students` | mentor | ⚠️ |
| 48 | GET | `/mentor/notifications` | mentor | ⚠️ |
| 49 | POST | `/mentor/announcements` | mentor | ⚠️ |
| 50 | PATCH | `/mentor/announcements/:id` | mentor | ⚠️ |
| 51 | DELETE | `/mentor/announcements/:id` | mentor | ⚠️ |
| 52 | GET | `/mentor/helpdesk/tickets` | mentor | ⚠️ |
| 53 | PATCH | `/mentor/helpdesk/tickets/:id` | mentor | ⚠️ |
| 54 | GET | `/mentor/helpdesk/resources` | mentor | ⚠️ |
| 55 | GET | `/student/courses` | student | ⚠️ |
| 56 | GET | `/student/courses/:courseId` | student | ⚠️ |
| 57 | POST | `/student/courses/:courseId/lessons/:lessonId/complete` | student | ⚠️ |
| 58 | POST | `/student/courses/:courseId/bookmark` | student | ⚠️ |
| 59 | GET | `/student/assignments` | student | ⚠️ |
| 60 | POST | `/student/assignments/:taskId/submit` | student | ⚠️ |
| 61 | POST | `/student/assignments/:taskId/quiz-submit` | student | ⚠️ |
| 62 | GET | `/student/attendance` | student | ⚠️ |
| 63 | GET | `/student/certificates` | student | ⚠️ |
| 64 | GET | `/student/certificates/:certId/download` | student | ⚠️ |
| 65 | GET | `/student/projects` | student | ⚠️ |
| 66 | POST | `/student/projects` | student | ⚠️ |
| 67 | GET | `/student/projects/:projectId` | student | ⚠️ |
| 68 | POST | `/student/projects/:projectId/tasks` | student | ⚠️ |
| 69 | PATCH | `/student/projects/:projectId/tasks/:taskId` | student | ⚠️ |
| 70 | POST | `/student/projects/:projectId/milestones/:milestoneId/submit` | student | ⚠️ |
| 71 | GET | `/student/lookup` | student | ⚠️ |
| 72 | GET | `/mentor/lookup` | student/mentor | ⚠️ |

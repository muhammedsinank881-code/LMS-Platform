import { useState } from 'react'
import {
  ArrowLeft,
  Award,
  Calendar,
  Clock,
  Edit3,
  FileCheck,
  MapPin,
  Search,
  Users,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { ExamStatusBadge } from './components/ExamStatusBadge'
import { MOCK_MENTOR_EXAMS } from './mockData'
import type { StudentGradeItem } from './types'

export function ExamDetails() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()

  const [studentSearch, setStudentSearch] = useState('')
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null)
  const [inputMarks, setInputMarks] = useState<number | ''>('')

  // Find exam or fallback
  const exam = MOCK_MENTOR_EXAMS.find((e) => e.id === examId) || MOCK_MENTOR_EXAMS[0]

  const [grades, setGrades] = useState<StudentGradeItem[]>(exam.studentGrades)

  const filteredGrades = grades.filter((st) => {
    const q = studentSearch.toLowerCase().trim()
    if (!q) return true
    return (
      st.name.toLowerCase().includes(q) ||
      st.rollNumber.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q)
    )
  })

  const handleSaveGrade = (studentId: string) => {
    if (inputMarks === '') return
    const marks = Number(inputMarks)
    let calculatedGrade = 'C'
    const pct = (marks / exam.totalMarks) * 100
    if (pct >= 90) calculatedGrade = 'A+'
    else if (pct >= 80) calculatedGrade = 'A'
    else if (pct >= 70) calculatedGrade = 'B'
    else if (pct >= 60) calculatedGrade = 'C'
    else calculatedGrade = 'F'

    setGrades((prev) =>
      prev.map((g) =>
        g.id === studentId
          ? {
              ...g,
              marksObtained: marks,
              grade: calculatedGrade,
              status: 'graded',
            }
          : g,
      ),
    )

    setEditingGradeId(null)
    setInputMarks('')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2 px-2 sm:px-4 pb-16 text-[#17324D] dark:text-foreground">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/mentor/exams')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#17324D] dark:hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Exams</span>
        </button>

        <ExamStatusBadge status={exam.status} />
      </div>

      {/* Main Exam Header Banner */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#E8F7F3] text-[#0F9F83] shrink-0">
              <Award className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] dark:text-foreground">
                {exam.title}
              </h1>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1 font-medium">
                {exam.classBatch} · {exam.subject} ({exam.courseName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-[#E2E8F0] text-[#64748B] hover:text-[#17324D]"
            >
              <Edit3 className="size-4 mr-1.5" />
              <span>Edit Exam</span>
            </Button>
            <Button
              type="button"
              className="bg-[#0F9F83] hover:bg-[#0C826B] text-white font-semibold rounded-xl"
            >
              <FileCheck className="size-4 mr-1.5" />
              <span>Enter Marks / Results</span>
            </Button>
          </div>
        </div>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E2E8F0] dark:border-border">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400 font-medium">
              <Calendar className="size-3.5 text-[#0F9F83]" />
              <span>Date & Time</span>
            </div>
            <p className="text-sm font-bold text-[#17324D] dark:text-foreground mt-1">
              {exam.formattedDate} · {exam.time}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400 font-medium">
              <Clock className="size-3.5 text-[#0F9F83]" />
              <span>Duration</span>
            </div>
            <p className="text-sm font-bold text-[#17324D] dark:text-foreground mt-1">
              {exam.duration}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400 font-medium">
              <MapPin className="size-3.5 text-[#0F9F83]" />
              <span>Room / Venue</span>
            </div>
            <p className="text-sm font-bold text-[#17324D] dark:text-foreground mt-1">
              {exam.room}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400 font-medium">
              <Users className="size-3.5 text-[#0F9F83]" />
              <span>Students Registered</span>
            </div>
            <p className="text-sm font-bold text-[#17324D] dark:text-foreground mt-1">
              {exam.studentsCount} Students
            </p>
          </div>
        </div>

        {/* Instructions */}
        {exam.instructions ? (
          <div className="p-4 rounded-xl bg-[#E8F7F3]/60 dark:bg-[#0F9F83]/10 border border-[#0F9F83]/20 space-y-1">
            <h4 className="text-xs font-bold text-[#0F9F83] uppercase tracking-wider">
              Exam Instructions & Guidelines
            </h4>
            <p className="text-xs sm:text-sm text-[#17324D] dark:text-slate-200">
              {exam.instructions}
            </p>
          </div>
        ) : null}
      </div>

      {/* Student Results / Grade Entry Table Section */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#17324D] dark:text-foreground">
              Student Marks & Grades
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Total Marks: {exam.totalMarks} · Passing Marks: {exam.passingMarks}
            </p>
          </div>

          {/* Roster Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-[#64748B]" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search student or roll no..."
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-[#E2E8F0] dark:border-border rounded-xl text-xs text-[#17324D] dark:text-foreground placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0F9F83]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-bold text-[#64748B] dark:text-slate-300 border-b border-[#E2E8F0] dark:border-border">
              <tr>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Marks Obtained</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-border font-medium">
              {filteredGrades.length > 0 ? (
                filteredGrades.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-mono text-xs text-[#17324D] dark:text-slate-200 font-bold">
                      {st.rollNumber}
                    </td>
                    <td className="p-3.5 text-[#17324D] dark:text-foreground font-semibold">
                      {st.name}
                    </td>
                    <td className="p-3.5 text-[#64748B] dark:text-slate-400 text-xs">
                      {st.email}
                    </td>
                    <td className="p-3.5">
                      {editingGradeId === st.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            max={exam.totalMarks}
                            min={0}
                            value={inputMarks}
                            onChange={(e) => setInputMarks(e.target.value ? Number(e.target.value) : '')}
                            className="h-8 w-20 text-xs rounded-lg"
                            placeholder="Marks"
                          />
                          <span className="text-xs text-[#64748B]">/ {exam.totalMarks}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-sm">
                          {st.marksObtained !== null ? `${st.marksObtained} / ${exam.totalMarks}` : '—'}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {st.grade ? (
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#E8F7F3] text-[#0F9F83]">
                          {st.grade}
                        </span>
                      ) : (
                        <span className="text-xs text-[#64748B]">Pending</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {editingGradeId === st.id ? (
                        <Button
                          type="button"
                          onClick={() => handleSaveGrade(st.id)}
                          className="h-8 px-3 text-xs bg-[#0F9F83] hover:bg-[#0C826B] text-white rounded-lg"
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingGradeId(st.id)
                            setInputMarks(st.marksObtained ?? '')
                          }}
                          className="h-8 px-3 text-xs border-[#E2E8F0] text-[#17324D] rounded-lg"
                        >
                          Grade
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-[#64748B]">
                    No student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ExamDetails

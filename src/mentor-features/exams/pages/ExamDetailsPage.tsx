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
import { Button, Card, Input } from '@/components/ui'
import { ExamStatusBadge } from '../components/ExamStatusBadge'
import { MOCK_MENTOR_EXAMS } from '../mockData'
import type { StudentGradeItem } from '../types'

export function ExamDetailsPage() {
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
    <div className="space-y-6 text-foreground">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/mentor/exams')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Exams</span>
        </button>

        <ExamStatusBadge status={exam.status} />
      </div>

      {/* Main Exam Header Banner */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-lg bg-primary-subtle text-primary shrink-0">
              <Award className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {exam.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {exam.classBatch} · {exam.subject} ({exam.courseName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
            >
              <Edit3 className="size-4 mr-1.5" />
              <span>Edit Exam</span>
            </Button>
            <Button
              type="button"
              variant="primary"
            >
              <FileCheck className="size-4 mr-1.5" />
              <span>Enter Marks / Results</span>
            </Button>
          </div>
        </div>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Calendar className="size-3.5 text-primary" />
              <span>Date & Time</span>
            </div>
            <p className="text-sm font-bold text-foreground mt-1">
              {exam.formattedDate} · {exam.time}
            </p>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="size-3.5 text-primary" />
              <span>Duration</span>
            </div>
            <p className="text-sm font-bold text-foreground mt-1">
              {exam.duration}
            </p>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MapPin className="size-3.5 text-primary" />
              <span>Room / Venue</span>
            </div>
            <p className="text-sm font-bold text-foreground mt-1">
              {exam.room}
            </p>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Users className="size-3.5 text-primary" />
              <span>Students Registered</span>
            </div>
            <p className="text-sm font-bold text-foreground mt-1">
              {exam.studentsCount} Students
            </p>
          </div>
        </div>

        {/* Instructions */}
        {exam.instructions ? (
          <div className="p-4 rounded-md bg-primary-subtle border border-primary/20 space-y-1">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">
              Exam Instructions & Guidelines
            </h4>
            <p className="text-xs sm:text-sm text-foreground">
              {exam.instructions}
            </p>
          </div>
        ) : null}
      </Card>

      {/* Student Results / Grade Entry Table Section */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Student Marks & Grades
            </h3>
            <p className="text-xs text-muted-foreground">
              Total Marks: {exam.totalMarks} · Passing Marks: {exam.passingMarks}
            </p>
          </div>

          {/* Roster Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search student or roll no..."
              className="w-full h-9 pl-9 pr-3 bg-surface border border-input rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase font-medium text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Roll Number</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Marks Obtained</th>
                <th className="p-3">Grade</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredGrades.length > 0 ? (
                filteredGrades.map((st) => (
                  <tr key={st.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-mono text-xs text-foreground font-semibold">
                      {st.rollNumber}
                    </td>
                    <td className="p-3 text-foreground font-semibold">
                      {st.name}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {st.email}
                    </td>
                    <td className="p-3">
                      {editingGradeId === st.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            max={exam.totalMarks}
                            min={0}
                            value={inputMarks}
                            onChange={(e) => setInputMarks(e.target.value ? Number(e.target.value) : '')}
                            className="h-8 w-20 text-xs"
                            placeholder="Marks"
                          />
                          <span className="text-xs text-muted-foreground">/ {exam.totalMarks}</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-sm">
                          {st.marksObtained !== null ? `${st.marksObtained} / ${exam.totalMarks}` : '—'}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {st.grade ? (
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-primary-subtle text-primary">
                          {st.grade}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editingGradeId === st.id ? (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveGrade(st.id)}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingGradeId(st.id)
                            setInputMarks(st.marksObtained ?? '')
                          }}
                        >
                          Grade
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export const ExamDetails = ExamDetailsPage
export default ExamDetailsPage

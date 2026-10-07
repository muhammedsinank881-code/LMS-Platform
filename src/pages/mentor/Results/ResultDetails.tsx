import { useState } from 'react'
import {
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Edit3,
  FileCheck,
  GraduationCap,
  User,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { ResultStatusBadge } from './components/ResultStatusBadge'
import { MOCK_STUDENT_RESULTS } from './mockData'

export function ResultDetails() {
  const { resultId } = useParams<{ resultId: string }>()
  const navigate = useNavigate()

  const initialResult = MOCK_STUDENT_RESULTS.find((r) => r.id === resultId) || MOCK_STUDENT_RESULTS[0]
  const [result, setResult] = useState(initialResult)

  const handlePublish = () => {
    setResult((prev) => ({
      ...prev,
      status: 'published',
      publishedDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
    }))
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/mentor/results')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Results</span>
        </button>

        <ResultStatusBadge status={result.status} />
      </div>

      {/* Main Banner */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-lg bg-primary-subtle text-primary shrink-0">
              <BarChart3 className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {result.studentName}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-mono font-medium">
                {result.studentId} · {result.classBatch}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {result.status !== 'published' ? (
              <Button
                type="button"
                variant="primary"
                onClick={handlePublish}
              >
                <CheckCircle2 className="size-4 mr-1.5" />
                <span>Publish Result</span>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
            >
              <Edit3 className="size-4 mr-1.5" />
              <span>Edit Result</span>
            </Button>
          </div>
        </div>

        {/* Quick Result Score Highlight */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
          <div className="p-3 rounded-md bg-primary-subtle border border-primary/20">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Award className="size-3.5 text-primary" />
              <span>Marks Obtained</span>
            </div>
            <p className="text-xl font-extrabold text-primary mt-1">
              {result.marksObtained} / {result.totalMarks}
            </p>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <GraduationCap className="size-3.5 text-primary" />
              <span>Percentage</span>
            </div>
            <p className="text-xl font-extrabold text-foreground mt-1">
              {result.percentage}%
            </p>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <FileCheck className="size-3.5 text-primary" />
              <span>Official Grade</span>
            </div>
            <p className="text-xl font-extrabold text-foreground mt-1">
              {result.grade}
            </p>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Calendar className="size-3.5 text-primary" />
              <span>Published Date</span>
            </div>
            <p className="text-sm font-bold text-foreground mt-1.5">
              {result.publishedDate || 'Pending Publish'}
            </p>
          </div>
        </div>
      </Card>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Student Information Card */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground text-base border-b border-border pb-2.5">
            <User className="size-4 text-primary" />
            <span>Student Information</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Full Name:</span>
              <span className="font-semibold text-foreground">{result.studentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Student ID / Roll:</span>
              <span className="font-mono font-semibold text-foreground">{result.studentId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Class Batch:</span>
              <span className="font-semibold text-foreground">{result.classBatch}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Email Address:</span>
              <span className="font-medium text-foreground">{result.studentEmail}</span>
            </div>
          </div>
        </Card>

        {/* Exam Information Card */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground text-base border-b border-border pb-2.5">
            <Award className="size-4 text-primary" />
            <span>Exam & Subject Information</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Exam Name:</span>
              <span className="font-semibold text-foreground">{result.examName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-semibold text-foreground">{result.subject}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Course Program:</span>
              <span className="font-semibold text-foreground">{result.courseName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Maximum Marks:</span>
              <span className="font-bold text-foreground">{result.totalMarks} Marks</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Remarks Section */}
      {result.remarks ? (
        <Card className="p-5 space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Mentor Remarks & Feedback
          </h3>
          <p className="text-sm text-foreground bg-muted p-4 rounded-md border border-border">
            {result.remarks}
          </p>
        </Card>
      ) : null}
    </div>
  )
}

export default ResultDetails

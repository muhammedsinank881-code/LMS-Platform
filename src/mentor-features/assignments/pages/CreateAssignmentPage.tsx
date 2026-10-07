import { useState } from 'react'
import { ArrowLeft, Check, AlertCircle, Calendar, FileText, Award, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Select } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { addAssignment } from '../mockData'

const CLASS_OPTIONS = [
  { value: 'BCA - 3rd Year', label: 'BCA - 3rd Year (24 Students)' },
  { value: 'BCA - 4th Semester', label: 'BCA - 4th Semester (14 Students)' },
  { value: 'BCA - 2nd Year', label: 'BCA - 2nd Year (12 Students)' },
]

const TYPE_OPTIONS = [
  { value: 'Lab Assignment', label: 'Lab Assignment' },
  { value: 'Theory Homework', label: 'Theory Homework' },
  { value: 'Project Milestone', label: 'Project Milestone' },
  { value: 'Quiz', label: 'Quiz' },
]

const SUBMISSION_TYPE_OPTIONS = [
  { value: 'File Upload', label: 'File Upload' },
  { value: 'Text Submission', label: 'Text Submission' },
  { value: 'Link / URL', label: 'Link / URL' },
]

const MAX_FILE_SIZE_OPTIONS = [
  { value: '5 MB', label: '5 MB' },
  { value: '10 MB', label: '10 MB' },
  { value: '25 MB', label: '25 MB' },
  { value: '50 MB', label: '50 MB' },
]

export function CreateAssignmentPage() {
  const navigate = useNavigate()

  // Form State
  const [title, setTitle] = useState('')
  const [classBatch, setClassBatch] = useState('BCA - 3rd Year')
  const [subject, setSubject] = useState('Web Development & React')
  const [assignmentType, setAssignmentType] = useState('Lab Assignment')
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium')
  const [description, setDescription] = useState('')

  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [dueDate, setDueDate] = useState(() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return nextWeek.toISOString().split('T')[0]
  })
  const [dueTime, setDueTime] = useState('23:59')
  const [allowLateSubmission, setAllowLateSubmission] = useState(true)

  const [submissionType, setSubmissionType] = useState('File Upload')
  const [maxFileSize, setMaxFileSize] = useState('10 MB')
  const [allowedFileTypes, setAllowedFileTypes] = useState('.pdf, .zip, .js, .docx')

  const [totalMarks, setTotalMarks] = useState<number | ''>(50)
  const [passingMarks, setPassingMarks] = useState<number | ''>(20)
  const [gradingInstructions, setGradingInstructions] = useState('')

  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Validation Logic
  const errors: Record<string, string> = {}

  if (!title.trim()) {
    errors.title = 'Assignment title is required.'
  }
  if (!classBatch) {
    errors.classBatch = 'Class / Batch selection is required.'
  }
  if (!subject.trim()) {
    errors.subject = 'Subject name is required.'
  }
  if (!description.trim()) {
    errors.description = 'Assignment instructions & description are required.'
  }
  if (!startDate) {
    errors.startDate = 'Start date is required.'
  }
  if (!dueDate) {
    errors.dueDate = 'Due date is required.'
  } else if (startDate && new Date(dueDate) < new Date(startDate)) {
    errors.dueDate = 'Due date cannot be before start date.'
  }

  if (totalMarks === '' || Number(totalMarks) <= 0) {
    errors.totalMarks = 'Total marks must be greater than 0.'
  }

  if (
    passingMarks !== '' &&
    totalMarks !== '' &&
    Number(passingMarks) > Number(totalMarks)
  ) {
    errors.passingMarks = 'Passing marks cannot exceed total marks.'
  }

  const isValid = Object.keys(errors).length === 0

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  };

  const handleSave = (status: 'active' | 'draft') => {
    setTouched({
      title: true,
      classBatch: true,
      subject: true,
      description: true,
      startDate: true,
      dueDate: true,
      totalMarks: true,
      passingMarks: true,
    })

    if (!isValid && status === 'active') return

    // Format due date string
    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    addAssignment({
      title: title.trim() || 'Untitled Assignment Draft',
      classBatch,
      subject: subject.trim(),
      dueDate: formattedDueDate,
      startDate,
      status,
      totalMarks: Number(totalMarks) || 50,
      passingMarks: Number(passingMarks) || 20,
      difficulty,
      assignmentType,
      submissionType,
      description,
    })

    navigate('/mentor/assignments')
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* Page Header */}
      <PageHeader
        title="Create Assignment"
        description="Create and publish an assignment for your students."
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Assignments', to: '/mentor/assignments' },
          { label: 'Create Assignment' },
        ]}
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/mentor/assignments')}
          >
            <ArrowLeft className="size-4 mr-1.5" />
            <span>Back to Assignments</span>
          </Button>
        }
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Information & Instructions (2 Columns Wide on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <FileText className="size-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Basic Information</h2>
            </div>

            <div className="space-y-4">
              {/* Assignment Title */}
              <div className="space-y-1.5">
                <label htmlFor="asg-title" className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Assignment Title <span className="text-destructive">*</span></span>
                </label>
                <Input
                  id="asg-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur('title')}
                  placeholder="e.g., React Custom Hooks & State Management Lab"
                  className={touched.title && errors.title ? 'border-destructive focus:ring-destructive' : ''}
                />
                {touched.title && errors.title ? (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3" /> {errors.title}
                  </p>
                ) : null}
              </div>

              {/* Class/Batch & Subject Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="asg-class-batch" className="text-xs font-semibold text-foreground">
                    Class / Batch <span className="text-destructive">*</span>
                  </label>
                  <Select
                    id="asg-class-batch"
                    value={classBatch}
                    onValueChange={setClassBatch}
                    options={CLASS_OPTIONS}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="asg-subject" className="text-xs font-semibold text-foreground">
                    Subject / Module <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="asg-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onBlur={() => handleBlur('subject')}
                    placeholder="e.g., Web Development & React"
                    className={touched.subject && errors.subject ? 'border-destructive' : ''}
                  />
                  {touched.subject && errors.subject ? (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="size-3" /> {errors.subject}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Assignment Type & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label htmlFor="asg-type" className="text-xs font-semibold text-foreground">
                    Assignment Type
                  </label>
                  <Select
                    id="asg-type"
                    value={assignmentType}
                    onValueChange={setAssignmentType}
                    options={TYPE_OPTIONS}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-foreground">
                    Difficulty Level
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                          difficulty === lvl
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-surface border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions / Description */}
              <div className="space-y-1.5 pt-2">
                <label htmlFor="asg-description" className="text-xs font-semibold text-foreground">
                  Instructions & Problem Statement <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="asg-description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleBlur('description')}
                  placeholder="Provide clear problem details, deliverables, guidelines, and evaluation rubrics for your students..."
                  className={`w-full p-3 bg-surface border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    touched.description && errors.description
                      ? 'border-destructive focus:ring-destructive'
                      : 'border-input'
                  }`}
                />
                {touched.description && errors.description ? (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3" /> {errors.description}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          {/* Submission Settings Card */}
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <HelpCircle className="size-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Submission Settings</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="asg-submission-type" className="text-xs font-semibold text-foreground">
                  Submission Mode
                </label>
                <Select
                  id="asg-submission-type"
                  value={submissionType}
                  onValueChange={setSubmissionType}
                  options={SUBMISSION_TYPE_OPTIONS}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="asg-max-file-size" className="text-xs font-semibold text-foreground">
                  Maximum File Size
                </label>
                <Select
                  id="asg-max-file-size"
                  value={maxFileSize}
                  onValueChange={setMaxFileSize}
                  options={MAX_FILE_SIZE_OPTIONS}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label htmlFor="asg-allowed-file-types" className="text-xs font-semibold text-foreground">
                Allowed Extensions / Formats
              </label>
              <Input
                id="asg-allowed-file-types"
                type="text"
                value={allowedFileTypes}
                onChange={(e) => setAllowedFileTypes(e.target.value)}
                placeholder="e.g., .pdf, .zip, .js, .docx"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Schedule, Evaluation & Actions (1 Column Wide on Desktop) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Schedule & Due Dates Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Calendar className="size-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Schedule & Dates</h2>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label htmlFor="asg-start-date" className="text-xs font-semibold text-foreground">
                  Start Date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="asg-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onBlur={() => handleBlur('startDate')}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="asg-due-date" className="text-xs font-semibold text-foreground">
                  Due Date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="asg-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={() => handleBlur('dueDate')}
                  className={touched.dueDate && errors.dueDate ? 'border-destructive' : ''}
                />
                {touched.dueDate && errors.dueDate ? (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3" /> {errors.dueDate}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="asg-due-time" className="text-xs font-semibold text-foreground">
                  Due Time
                </label>
                <Input
                  id="asg-due-time"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>

              <label htmlFor="asg-allow-late" className="pt-2 border-t border-border flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-foreground">Allow Late Submissions</div>
                  <div className="text-[11px] text-muted-foreground">Accept submissions after due date</div>
                </div>
                <input
                  id="asg-allow-late"
                  type="checkbox"
                  checked={allowLateSubmission}
                  onChange={(e) => setAllowLateSubmission(e.target.checked)}
                  className="size-4 accent-primary cursor-pointer"
                />
              </label>
            </div>
          </Card>

          {/* Evaluation & Grading Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Award className="size-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Evaluation & Marks</h2>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="asg-total-marks" className="text-xs font-semibold text-foreground">
                    Total Marks <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="asg-total-marks"
                    type="number"
                    min={1}
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value ? Number(e.target.value) : '')}
                    onBlur={() => handleBlur('totalMarks')}
                    className={touched.totalMarks && errors.totalMarks ? 'border-destructive' : ''}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="asg-passing-marks" className="text-xs font-semibold text-foreground">
                    Passing Marks
                  </label>
                  <Input
                    id="asg-passing-marks"
                    type="number"
                    min={0}
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value ? Number(e.target.value) : '')}
                    onBlur={() => handleBlur('passingMarks')}
                    className={touched.passingMarks && errors.passingMarks ? 'border-destructive' : ''}
                  />
                </div>
              </div>

              {touched.totalMarks && errors.totalMarks ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.totalMarks}
                </p>
              ) : null}

              {touched.passingMarks && errors.passingMarks ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.passingMarks}
                </p>
              ) : null}

              <div className="space-y-1.5 pt-1">
                <label htmlFor="asg-grading-instructions" className="text-xs font-semibold text-foreground">
                  Evaluation Notes (Optional)
                </label>
                <textarea
                  id="asg-grading-instructions"
                  rows={3}
                  value={gradingInstructions}
                  onChange={(e) => setGradingInstructions(e.target.value)}
                  placeholder="Notes for co-evaluators or grading rubrics..."
                  className="w-full p-2.5 bg-surface border border-input rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </Card>

          {/* Form Actions Card */}
          <Card className="p-5 space-y-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => handleSave('active')}
              disabled={!isValid && Object.keys(touched).length > 0}
              className="w-full h-10 font-bold"
            >
              <Check className="size-4 mr-1.5" />
              <span>Publish Assignment</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave('draft')}
              className="w-full h-10 font-semibold"
            >
              <span>Save as Draft</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/mentor/assignments')}
              className="w-full h-10 text-muted-foreground hover:text-foreground"
            >
              <span>Cancel</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const CreateAssignment = CreateAssignmentPage
export default CreateAssignmentPage

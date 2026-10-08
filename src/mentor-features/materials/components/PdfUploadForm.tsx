import { useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { Button, Input, Label, Textarea } from '@/components/ui'
import type { LearningMaterial, MaterialStatus } from '../types'

interface PdfUploadFormProps {
  onCancel: () => void
  onSubmit: (data: Omit<LearningMaterial, 'id' | 'uploadedDate' | 'uploadedBy'>) => void
  availableCourses: string[]
  availableModules: string[]
}

export function PdfUploadForm({
  onCancel,
  onSubmit,
  availableCourses,
  availableModules,
}: PdfUploadFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [courseClass, setCourseClass] = useState(availableCourses[0] || 'BCA - 5th Semester')
  const [semester, setSemester] = useState('5th Semester')
  const [moduleVal, setModuleVal] = useState(availableModules[0] || 'Module 4')
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState<MaterialStatus>('published')

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFileSelect = (file: File) => {
    setErrorMsg('')
    // Validate file format
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file.')
      return
    }
    // Validate file size (10 MB = 10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be less than 10 MB.')
      return
    }

    setSelectedFile(file)
    setUploadProgress(0)

    // Simulate progress animation
    let current = 0
    const interval = setInterval(() => {
      current += 25
      if (current >= 100) {
        setUploadProgress(100)
        clearInterval(interval)
      } else {
        setUploadProgress(current)
      }
    }, 80)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMsg('Please enter a material title.')
      return
    }
    if (!selectedFile) {
      setErrorMsg('Please upload a PDF document.')
      return
    }

    const fileSizeFormatted =
      selectedFile.size >= 1024 * 1024
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(selectedFile.size / 1024)} KB`

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      type: 'pdf',
      courseClass,
      semester,
      module: moduleVal,
      topic: topic.trim() || undefined,
      status,
      fileName: selectedFile.name,
      fileSize: fileSizeFormatted,
      fileUrl: '#',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title & Topic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pdf-title" className="text-xs font-semibold text-foreground">
            Material Title *
          </Label>
          <Input
            id="pdf-title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setErrorMsg('')
            }}
            placeholder="e.g. React Hooks Notes"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pdf-topic" className="text-xs font-semibold text-foreground">
            Topic
          </Label>
          <Input
            id="pdf-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. useState & useEffect"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="pdf-desc" className="text-xs font-semibold text-foreground">
          Description
        </Label>
        <Textarea
          id="pdf-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Complete notes covering useState, useEffect and custom hooks."
        />
      </div>

      {/* Course, Semester, Module */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pdf-course" className="text-xs font-semibold text-foreground">
            Course / Class *
          </Label>
          <select
            id="pdf-course"
            value={courseClass}
            onChange={(e) => setCourseClass(e.target.value)}
            className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          >
            {availableCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="BCA - 3rd Semester">BCA - 3rd Semester</option>
            <option value="BCA - 4th Semester">BCA - 4th Semester</option>
            <option value="BCA - 5th Semester">BCA - 5th Semester</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pdf-sem" className="text-xs font-semibold text-foreground">
            Semester
          </Label>
          <select
            id="pdf-sem"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          >
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="3rd Semester">3rd Semester</option>
            <option value="4th Semester">4th Semester</option>
            <option value="5th Semester">5th Semester</option>
            <option value="6th Semester">6th Semester</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pdf-module" className="text-xs font-semibold text-foreground">
            Module *
          </Label>
          <select
            id="pdf-module"
            value={moduleVal}
            onChange={(e) => setModuleVal(e.target.value)}
            className="w-full h-10 px-3 bg-surface border border-input rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          >
            {availableModules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value="Module 1">Module 1</option>
            <option value="Module 2">Module 2</option>
            <option value="Module 3">Module 3</option>
            <option value="Module 4">Module 4</option>
          </select>
        </div>
      </div>

      {/* Visibility Status */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground">Student Visibility</Label>
        <div className="flex items-center gap-4 pt-1">
          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
            <input
              type="radio"
              name="pdf-status"
              value="published"
              checked={status === 'published'}
              onChange={() => setStatus('published')}
              className="accent-primary"
            />
            <span>Published (Students can access)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
            <input
              type="radio"
              name="pdf-status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => setStatus('draft')}
              className="accent-primary"
            />
            <span>Draft (Only mentors can see)</span>
          </label>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground">Upload PDF *</Label>

        {!selectedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isDragOver
                ? 'border-primary bg-primary-subtle/40'
                : 'border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/40'
            }`}
          >
            <div className="p-3 rounded-full bg-primary-subtle text-primary">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Drag & drop your PDF here
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">or</p>
            </div>
            <label className="cursor-pointer">
              <span className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-block">
                Browse files
              </span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
            <div className="text-[11px] text-muted-foreground space-y-0.5 pt-2">
              <p>Supported format: PDF</p>
              <p>Maximum file size: 10 MB</p>
            </div>
          </div>
        ) : (
          /* Selected PDF File Card */
          <div className="p-3.5 rounded-lg border border-border bg-surface space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-md bg-primary-subtle text-primary shrink-0">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-foreground truncate">
                    {selectedFile.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Remove file"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Upload Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span>{uploadProgress < 100 ? 'Uploading file...' : 'Upload complete'}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Error Banner */}
      {errorMsg ? (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          {errorMsg}
        </div>
      ) : null}

      {/* Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!selectedFile || uploadProgress < 100}
        >
          <Upload className="size-4 mr-1.5" />
          <span>Upload Material</span>
        </Button>
      </div>
    </form>
  )
}

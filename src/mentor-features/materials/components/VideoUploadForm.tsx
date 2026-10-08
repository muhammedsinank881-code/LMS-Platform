import { useState } from 'react'
import { CheckCircle2, PlayCircle, Upload, Video, X } from 'lucide-react'
import { Button, Input, Label, Textarea } from '@/components/ui'
import type { LearningMaterial, MaterialStatus, VideoSource } from '../types'

interface VideoUploadFormProps {
  onCancel: () => void
  onSubmit: (data: Omit<LearningMaterial, 'id' | 'uploadedDate' | 'uploadedBy'>) => void
  availableCourses: string[]
  availableModules: string[]
}

export function VideoUploadForm({
  onCancel,
  onSubmit,
  availableCourses,
  availableModules,
}: VideoUploadFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [courseClass, setCourseClass] = useState(availableCourses[0] || 'BCA - 5th Semester')
  const [semester, setSemester] = useState('5th Semester')
  const [moduleVal, setModuleVal] = useState(availableModules[0] || 'Module 4')
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState<MaterialStatus>('published')
  const [duration, setDuration] = useState('45 min')

  // Source selection
  const [videoSource, setVideoSource] = useState<VideoSource>('upload')
  const [videoUrl, setVideoUrl] = useState('')

  // Video File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFileSelect = (file: File) => {
    setErrorMsg('')
    const validFormats = ['video/mp4', 'video/webm', 'video/quicktime']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validFormats.includes(file.type) && !['.mp4', '.webm', '.mov'].includes(ext)) {
      setErrorMsg('Supported formats: MP4, WebM, MOV')
      return
    }

    // Validate size: 500 MB max (500 * 1024 * 1024)
    if (file.size > 500 * 1024 * 1024) {
      setErrorMsg('File size must be less than 500 MB.')
      return
    }

    setSelectedFile(file)
    setUploadProgress(0)

    let current = 0
    const interval = setInterval(() => {
      current += 20
      if (current >= 100) {
        setUploadProgress(100)
        clearInterval(interval)
      } else {
        setUploadProgress(current)
      }
    }, 100)
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
      setErrorMsg('Please enter a video title.')
      return
    }

    if (videoSource === 'upload') {
      if (!selectedFile) {
        setErrorMsg('Please select a video file to upload.')
        return
      }

      const fileSizeFormatted =
        selectedFile.size >= 1024 * 1024
          ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(selectedFile.size / 1024)} KB`

      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        type: 'video',
        courseClass,
        semester,
        module: moduleVal,
        topic: topic.trim() || undefined,
        status,
        videoSource: 'upload',
        fileName: selectedFile.name,
        fileSize: fileSizeFormatted,
        duration: duration.trim() || '30 min',
      })
    } else {
      if (!videoUrl.trim()) {
        setErrorMsg('Please enter a valid video URL.')
        return
      }

      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        type: 'video',
        courseClass,
        semester,
        module: moduleVal,
        topic: topic.trim() || undefined,
        status,
        videoSource: 'url',
        videoUrl: videoUrl.trim(),
        duration: duration.trim() || '30 min',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title & Topic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="video-title" className="text-xs font-semibold text-foreground">
            Video Title *
          </Label>
          <Input
            id="video-title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setErrorMsg('')
            }}
            placeholder="e.g. Introduction to React Hooks"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="video-topic" className="text-xs font-semibold text-foreground">
            Topic
          </Label>
          <Input
            id="video-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Component State Basics"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="video-desc" className="text-xs font-semibold text-foreground">
          Description
        </Label>
        <Textarea
          id="video-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Video overview and topics covered..."
        />
      </div>

      {/* Course, Semester, Module, Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="video-course" className="text-xs font-semibold text-foreground">
            Course / Class *
          </Label>
          <select
            id="video-course"
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

        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="video-sem" className="text-xs font-semibold text-foreground">
            Semester
          </Label>
          <select
            id="video-sem"
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

        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="video-module" className="text-xs font-semibold text-foreground">
            Module *
          </Label>
          <select
            id="video-module"
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

        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="video-duration" className="text-xs font-semibold text-foreground">
            Duration
          </Label>
          <Input
            id="video-duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 45 min"
          />
        </div>
      </div>

      {/* Video Source Radio Buttons */}
      <div className="space-y-2 pt-1 border-t border-border">
        <Label className="text-xs font-semibold text-foreground">Video Source *</Label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
            <input
              type="radio"
              name="video-source"
              checked={videoSource === 'upload'}
              onChange={() => {
                setVideoSource('upload')
                setErrorMsg('')
              }}
              className="accent-primary"
            />
            <span>Upload Video</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
            <input
              type="radio"
              name="video-source"
              checked={videoSource === 'url'}
              onChange={() => {
                setVideoSource('url')
                setErrorMsg('')
              }}
              className="accent-primary"
            />
            <span>Video URL</span>
          </label>
        </div>
      </div>

      {/* Source Area: Upload File vs Video URL */}
      {videoSource === 'upload' ? (
        <div className="space-y-1.5">
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
                <Video className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Drag & drop your video here
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">or Browse video</p>
              </div>
              <label className="cursor-pointer">
                <span className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-block">
                  Browse video
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
              <div className="text-[11px] text-muted-foreground space-y-0.5 pt-2">
                <p>Supported formats: MP4, WebM, MOV</p>
                <p>Maximum size: 500 MB</p>
              </div>
            </div>
          ) : (
            /* Selected Video Card */
            <div className="p-3.5 rounded-lg border border-border bg-surface space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-md bg-primary-subtle text-primary shrink-0">
                    <Video className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-foreground truncate">
                      {selectedFile.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · {duration}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Remove video"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Upload Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                  <span>{uploadProgress < 100 ? 'Uploading video...' : 'Upload complete'}</span>
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
      ) : (
        /* Video URL Input & Preview */
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="video-url" className="text-xs font-semibold text-foreground">
              Video URL *
            </Label>
            <Input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value)
                setErrorMsg('')
              }}
              placeholder="e.g. https://youtube.com/watch?v=dpw9EHDh2bM"
            />
          </div>

          {/* Small Preview Card */}
          {videoUrl.trim() ? (
            <div className="p-3 rounded-lg border border-border bg-muted/40 flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-primary/10 text-primary shrink-0">
                <PlayCircle className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {title || 'Video Link Preview'}
                </p>
                <p className="text-[11px] text-primary truncate font-mono mt-0.5">
                  {videoUrl}
                </p>
              </div>
              <CheckCircle2 className="size-4 text-success shrink-0" />
            </div>
          ) : null}
        </div>
      )}

      {/* Visibility Status */}
      <div className="space-y-1.5 pt-1">
        <Label className="text-xs font-semibold text-foreground">Student Visibility</Label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
            <input
              type="radio"
              name="video-status"
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
              name="video-status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => setStatus('draft')}
              className="accent-primary"
            />
            <span>Draft (Only mentors can see)</span>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg ? (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          {errorMsg}
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={videoSource === 'upload' && (!selectedFile || uploadProgress < 100)}
        >
          <Upload className="size-4 mr-1.5" />
          <span>Upload Material</span>
        </Button>
      </div>
    </form>
  )
}

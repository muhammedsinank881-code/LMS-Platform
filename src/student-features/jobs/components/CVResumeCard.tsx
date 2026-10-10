import { useRef, useState } from 'react'
import { FileText, Upload, Eye, RefreshCw, X, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CVResumeCardProps {
  cvUrl?: string | null
  cvName?: string | null
  onUpload?: (file: File) => Promise<void>
}

export default function CVResumeCard({ cvUrl, cvName, onUpload }: CVResumeCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasCV = Boolean(cvUrl && cvName)

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFileChange = (file?: File) => {
    setError('')
    setSuccess(false)

    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    const extensionAllowed = /\.(pdf|doc|docx)$/i.test(file.name)

    if (!allowedTypes.includes(file.type) || !extensionAllowed) {
      setError('Please select a PDF, DOC, or DOCX file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be 5 MB or less.')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return

    setUploading(true)
    setError('')
    setSuccess(false)

    try {
      await onUpload(selectedFile)
      setSelectedFile(null)
      setSuccess(true)

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        {/* Left: CV information */}
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-sm font-semibold text-foreground">CV / Resume</h2>

          <p className="max-w-sm text-sm text-muted-foreground">
            Keep your resume ready to use when applying for jobs.
          </p>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                hasCV ? 'bg-green-500' : 'bg-muted-foreground/50'
              }`}
            />
            <span className="text-muted-foreground">
              {hasCV ? 'Resume available' : 'No resume uploaded'}
            </span>
          </div>
        </div>

        {/* Right: CV preview or upload */}
        <div className="w-full sm:w-[290px] sm:shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(event) => handleFileChange(event.target.files?.[0])}
          />

          {selectedFile ? (
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-background p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove selected file"
                  onClick={() => {
                    setSelectedFile(null)
                    setError('')
                    if (inputRef.current) inputRef.current.value = ''
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  size="sm"
                  disabled={uploading || !onUpload}
                  onClick={handleUpload}
                >
                  {uploading ? 'Uploading...' : 'Upload CV'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  Change
                </Button>
              </div>

              {!onUpload && (
                <p className="text-xs text-muted-foreground">
                  File storage integration is required to finish uploading.
                </p>
              )}
            </div>
          ) : hasCV ? (
            <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
              <div className="rounded-lg border bg-background p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{cvName}</p>
                <p className="text-xs text-muted-foreground">Saved resume</p>
              </div>

              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="View CV"
                  onClick={() => window.open(cvUrl!, '_blank', 'noopener,noreferrer')}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Replace CV"
                  onClick={() => inputRef.current?.click()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="rounded-lg bg-primary/10 p-3">
                <Upload className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Upload your CV</p>
                <p className="text-xs text-muted-foreground">PDF, DOC or DOCX · Max 5 MB</p>
              </div>

              <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )}

          {error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              CV uploaded successfully.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

import { useRef, useState } from 'react'
import { CheckCircle2, Eye, FileText, RefreshCw, Trash2, Upload, X } from 'lucide-react'
import { Button, Card } from '@/components/ui'

interface CVResumeCardProps {
  cvUrl?: string | null
  cvName?: string | null
  cvSize?: number | null
  onUpload?: (file: File) => Promise<void> | void
  onRemove?: () => Promise<void> | void
}

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function formatSize(size: number | null): string {
  if (!size) return 'File size unavailable'
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function CVResumeCard({
  cvUrl,
  cvName,
  cvSize,
  onUpload,
  onRemove,
}: CVResumeCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasCV = Boolean(cvUrl && cvName)

  const handleFileChange = (file?: File) => {
    setError('')
    setSuccess(false)

    if (!file) return

    const isAllowedType = allowedMimeTypes.includes(file.type) || /\.(pdf|doc|docx)$/i.test(file.name)
    if (!isAllowedType) {
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
      if (inputRef.current) inputRef.current.value = ''
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!hasCV || !onRemove) return

    const confirmed = window.confirm('Remove the uploaded CV?')
    if (!confirmed) return

    setError('')
    setSuccess(false)

    try {
      await onRemove()
    } catch {
      setError('Could not remove the CV. Please try again.')
    }
  }

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">CV / Resume</h2>
          <p className="text-xs text-muted-foreground">
            {hasCV ? 'Resume available' : 'No resume uploaded'}
          </p>
        </div>

        {hasCV ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Saved
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />

        {selectedFile ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-background p-2">
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-[11px] text-muted-foreground">{formatSize(selectedFile.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove selected file"
                onClick={() => {
                  setSelectedFile(null)
                  setError('')
                  if (inputRef.current) inputRef.current.value = ''
                }}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>

            <div className="mt-2 flex gap-2">
              <Button type="button" size="sm" className="flex-1" onClick={handleUpload} disabled={uploading || !onUpload}>
                {uploading ? 'Uploading...' : 'Upload CV'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
                Change
              </Button>
            </div>
          </div>
        ) : hasCV ? (
          <div className="rounded-lg border border-border bg-muted/20 p-2.5">
            <div className="flex items-center gap-2">
              <div className="rounded-md border bg-background p-2">
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{cvName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {cvSize ? `${formatSize(cvSize)} · PDF` : 'Saved resume'}
                </p>
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              {cvUrl ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => window.open(cvUrl, '_blank', 'noopener,noreferrer')}>
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View
                </Button>
              ) : null}
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Change
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-2.5 text-left transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div className="rounded-md bg-primary/10 p-2">
              <Upload className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground">Upload your CV</p>
              <p className="text-[11px] text-muted-foreground">PDF, DOC, DOCX · Max 5 MB</p>
            </div>
          </button>
        )}

        <p className="text-[11px] text-muted-foreground">Supported file types: PDF, DOC, DOCX</p>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Uploaded successfully
        </p>
      ) : null}
    </Card>
  )
}

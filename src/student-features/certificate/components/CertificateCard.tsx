import { Award, Lock, Download, Share2, Calendar, Hash } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { CertificateData } from '../data/certificateData'

interface CertificateCardProps {
  cert: CertificateData
  isEarned: boolean
}

export function CertificateCard({ cert, isEarned }: CertificateCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-5 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Certificate Preview</h3>
        {isEarned ? (
          <Badge tone="success" dot size="sm" className="font-semibold text-xs">
            Earned
          </Badge>
        ) : (
          <Badge tone="neutral" size="sm" className="font-medium text-xs">
            Pending
          </Badge>
        )}
      </div>

      {/* Certificate visual */}
      <div className="p-5">
        <div
          className={cn(
            'relative rounded-xl border-2 p-6 text-center transition-all overflow-hidden',
            isEarned
              ? 'border-amber-400/60 bg-gradient-to-br from-amber-500/8 via-amber-400/4 to-transparent'
              : 'border-dashed border-border bg-muted/20',
          )}
        >
          {/* Background decoration */}
          {isEarned && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 right-3 opacity-10">
                <Award className="h-16 w-16 text-amber-500" />
              </div>
            </>
          )}

          {/* Lock overlay — shown when not earned */}
          {!isEarned && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-muted p-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Complete all requirements to unlock
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                  {cert.overallProgress}% overall completed
                </p>
              </div>
            </div>
          )}

          {/* Certificate content — always rendered, blurred when locked */}
          <div className={cn('relative z-0 space-y-4', !isEarned && 'blur-[3px] select-none pointer-events-none')}>
            {/* Academy logo area */}
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 ring-2 ring-amber-400/30">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
            </div>

            {/* Issuer */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {cert.issuer}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                This is to certify that
              </p>
            </div>

            {/* Student name */}
            <div>
              <p className="text-xl font-bold text-foreground tracking-tight">
                {cert.studentName}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                has successfully completed
              </p>
            </div>

            {/* Certificate title */}
            <div className="rounded-lg bg-amber-500/8 border border-amber-400/20 px-4 py-2.5">
              <p className="text-sm font-bold text-foreground leading-snug">{cert.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{cert.courseCode}</p>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {cert.issuedDate ?? 'Pending'}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {cert.certificateNumber ?? 'TBD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border px-5 py-4 flex flex-wrap gap-2">
        <Button
          id="cert-download-btn"
          variant="primary"
          size="sm"
          disabled={!isEarned}
          className="flex-1 text-xs"
        >
          <Download className="h-4 w-4" />
          Download Certificate
        </Button>
        <Button
          id="cert-share-btn"
          variant="outline"
          size="sm"
          disabled={!isEarned}
          className="flex-1 text-xs"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      {!isEarned && (
        <p className="px-5 pb-4 text-[11px] text-center text-muted-foreground">
          Download & sharing are available once the certificate is earned.
        </p>
      )}
    </div>
  )
}

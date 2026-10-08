import { Link } from 'react-router-dom'
import {
  BookOpen,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  ExternalLink,
} from 'lucide-react'
import { ProgressBar } from '@/components/ui'
import { RequirementRow } from './RequirementRow'
import type {
  CertificateData,
} from '../data/certificateData'

interface RequirementsChecklistProps {
  cert: CertificateData
  isFinalAssessmentUnlocked: boolean
}

function SectionHeader({
  icon: Icon,
  title,
  done,
  total,
}: {
  icon: React.ElementType
  title: string
  done: number
  total: number
}) {
  const allDone = done === total
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs font-bold text-foreground">{title}</span>
      </div>
      <span
        className={`text-xs font-bold tabular-nums ${allDone ? 'text-success' : 'text-muted-foreground'}`}
      >
        {done}/{total}
      </span>
    </div>
  )
}

export function RequirementsChecklist({
  cert,
  isFinalAssessmentUnlocked,
}: RequirementsChecklistProps) {
  return (
    <div className="space-y-4">
      {/* ── Courses ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <SectionHeader
          icon={BookOpen}
          title="Course Completion"
          done={cert.courseRequirements.filter((r) => r.status === 'completed').length}
          total={cert.courseRequirements.length}
        />
        <div className="divide-y divide-border">
          {cert.courseRequirements.map((req) => (
            <div key={req.id}>
              <RequirementRow
                label={req.title}
                sublabel={`${req.code} · ${req.completedModules}/${req.totalModules} modules · ${req.completedLessons}/${req.totalLessons} lessons`}
                status={req.status}
                trailing={req.progressPercent < 100 ? `${req.progressPercent}%` : undefined}
              />
              {req.status !== 'completed' && (
                <div className="px-4 pb-3 space-y-1.5">
                  <ProgressBar
                    value={req.progressPercent}
                    tone={req.progressPercent === 100 ? 'success' : 'primary'}
                    size="sm"
                    aria-label={`${req.title} progress`}
                  />
                  <div className="flex justify-end">
                    <Link
                      to={req.link}
                      className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      Continue Course <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Assignments & Quizzes ────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <SectionHeader
          icon={ClipboardList}
          title="Assignments & Quizzes"
          done={cert.assignmentRequirements.filter((r) => r.status === 'completed').length}
          total={cert.assignmentRequirements.length}
        />
        <div className="divide-y divide-border">
          {cert.assignmentRequirements.map((req) => (
            <RequirementRow
              key={req.id}
              label={req.title}
              sublabel={
                req.dueDate
                  ? `${req.type === 'quiz' ? 'Quiz' : 'Assignment'} · ${req.courseCode} · Due: ${req.dueDate}`
                  : `${req.type === 'quiz' ? 'Quiz' : 'Assignment'} · ${req.courseCode}`
              }
              status={req.status}
              trailing={req.score ?? undefined}
            />
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex justify-end">
          <Link
            to="/student/assignments"
            className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 hover:underline"
          >
            View All Assignments <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ── Projects ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <SectionHeader
          icon={FolderKanban}
          title="Capstone Projects"
          done={cert.projectRequirements.filter((r) => r.status === 'completed').length}
          total={cert.projectRequirements.length}
        />
        <div className="divide-y divide-border">
          {cert.projectRequirements.map((req) => (
            <div key={req.id}>
              <RequirementRow
                label={req.title}
                sublabel={`${req.type === 'group' ? 'Group Project' : 'Individual Project'} · ${req.milestonesSummary}`}
                status={req.status}
                trailing={`${req.progressPercent}%`}
              />
              {req.status !== 'completed' && (
                <div className="px-4 pb-3 space-y-1.5">
                  <ProgressBar
                    value={req.progressPercent}
                    tone="primary"
                    size="sm"
                    aria-label={`${req.title} progress`}
                  />
                  <div className="flex justify-end">
                    <Link
                      to={req.link}
                      className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      View Project <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Final Assessment ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <SectionHeader
          icon={GraduationCap}
          title="Final Assessment"
          done={cert.finalAssessment.status === 'completed' ? 1 : 0}
          total={1}
        />
        <RequirementRow
          label={cert.finalAssessment.title}
          sublabel={
            isFinalAssessmentUnlocked
              ? `Passing score: ${cert.finalAssessment.passingScore}% · ${cert.finalAssessment.maxAttempts - cert.finalAssessment.attemptsMade} attempt(s) remaining`
              : cert.finalAssessment.scheduledDate ?? 'Complete all requirements to unlock'
          }
          status={isFinalAssessmentUnlocked ? cert.finalAssessment.status === 'locked' ? 'pending' : cert.finalAssessment.status : 'locked'}
          className={isFinalAssessmentUnlocked ? undefined : 'bg-muted/10'}
        />
        {isFinalAssessmentUnlocked && cert.finalAssessment.status !== 'completed' && (
          <div className="px-4 py-3 border-t border-border bg-primary/5 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              🎉 All requirements met! You are ready to take the final assessment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

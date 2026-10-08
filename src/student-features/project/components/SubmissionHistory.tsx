import {
  FileText,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Award,
} from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import type { Submission } from '../types/project.types'

interface SubmissionHistoryProps {
  submissions: Submission[]
  onOpenDetail: (submission: Submission) => void
}

export function SubmissionHistory({ submissions, onOpenDetail }: SubmissionHistoryProps) {
  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge tone="success" className="font-semibold">
            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500" /> Approved
          </Badge>
        )
      case 'under_review':
        return (
          <Badge tone="info" className="font-semibold">
            <Clock className="mr-1 h-3 w-3 text-blue-500" /> Under Review
          </Badge>
        )
      case 'action_required':
        return (
          <Badge tone="warning" className="font-semibold">
            <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" /> Action Required
          </Badge>
        )
      default:
        return <Badge tone="neutral">Submitted</Badge>
    }
  }

  return (
    <div className="rounded-md border border-border bg-surface p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Submission History ({submissions.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            View history of uploaded code repositories, live demos, grades, and mentor audit notes.
          </p>
        </div>
      </div>

      {submissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold bg-muted/30">
                <th className="p-3 rounded-l-lg">Milestone</th>
                <th className="p-3">Submitted At</th>
                <th className="p-3">Submitted By</th>
                <th className="p-3">Status</th>
                <th className="p-3">Score / Grade</th>
                <th className="p-3">Links</th>
                <th className="p-3 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-bold text-foreground max-w-[200px] truncate">
                    {sub.milestoneTitle}
                  </td>
                  <td className="p-3 text-muted-foreground">{sub.submittedAt}</td>
                  <td className="p-3 font-medium text-foreground">{sub.submittedBy}</td>
                  <td className="p-3">{getStatusBadge(sub.status)}</td>
                  <td className="p-3 font-semibold text-foreground">
                    {sub.grade ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        {sub.grade}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Pending Grade</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {sub.repositoryLink && (
                        <a
                          href={sub.repositoryLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <GitBranch className="h-3 w-3" /> Code
                        </a>
                      )}
                      {sub.demoLink && (
                        <a
                          href={sub.demoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> Demo
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2.5"
                      onClick={() => onOpenDetail(sub)}
                    >
                      <Eye className="mr-1 h-3 w-3" /> Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-muted-foreground">
          No submission history yet. Submit your first milestone above.
        </div>
      )}
    </div>
  )
}

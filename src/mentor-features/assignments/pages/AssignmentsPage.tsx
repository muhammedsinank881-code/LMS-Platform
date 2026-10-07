import { useState } from 'react'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Plus,
  Search,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { getAssignments } from '../mockData'

export function AssignmentsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'graded' | 'draft'>('all')

  const assignmentsList = getAssignments()

  const filteredAssignments = assignmentsList.filter((asg) => {
    const matchesSearch =
      asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.classBatch.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || asg.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <PageHeader
        title="Assignments"
        description="Create, manage and grade student assignments across your classes"
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Assignments' },
        ]}
      
      />

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0">
            <Clock className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">2 Active</div>
            <div className="text-xs text-muted-foreground">Pending submissions</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0">
            <FileCheck className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">30 Submissions</div>
            <div className="text-xs text-muted-foreground">Ready for review</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">1 Graded</div>
            <div className="text-xs text-muted-foreground">Feedback released</div>
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assignments or classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-surface border border-input rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring h-10"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'active', 'graded', 'draft'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer shrink-0 ${
                selectedStatus === st
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-surface border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List Cards */}
      <div className="space-y-3">
        {filteredAssignments.map((asg) => (
          <Card
            key={asg.id}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-bold text-foreground truncate leading-tight">
                  {asg.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <BookOpen className="size-3.5 text-primary" />
                    {asg.classBatch}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    Due: {asg.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
              <div className="text-right sm:text-center">
                <div className="text-xs text-muted-foreground font-medium">Submissions</div>
                <div className="text-sm font-bold text-foreground">
                  {asg.submissionsCount} / {asg.totalStudents}
                </div>
              </div>

              <Badge
                tone={
                  asg.status === 'active'
                    ? 'success'
                    : asg.status === 'graded'
                    ? 'primary'
                    : 'neutral'
                }
              >
                {asg.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Assignments = AssignmentsPage
export default AssignmentsPage

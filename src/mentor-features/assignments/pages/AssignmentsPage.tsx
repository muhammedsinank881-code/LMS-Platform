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
import { Badge, Button, Card, Input } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    <div className="space-y-4 sm:space-y-6 text-foreground">
      {/* Header */}
      <PageHeader
        title="Assignments"
        description="Create, manage and grade student assignments across your classes"
        breadcrumbs={[
          { label: 'Dashboard', to: '/mentor/dashboard' },
          { label: 'Assignments' },
        ]}
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/mentor/assignments/create')}
            className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3.5"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
            <span>Create Assignment</span>
          </Button>
        }
      />

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-semibold text-foreground">2 Active</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground">Pending submissions</div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center shrink-0">
            <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-semibold text-foreground">30 Submissions</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground">Ready for review</div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-semibold text-foreground">1 Graded</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground">Feedback released</div>
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-between items-stretch sm:items-center">
        <div className="w-full sm:w-80">
          <Input
            type="search"
            size="sm"
            leftAdornment={<Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            placeholder="Search assignments or classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as 'all' | 'active' | 'graded' | 'draft')} variant="pill">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Assignments List Cards */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredAssignments.map((asg) => (
          <Card
            key={asg.id}
            className="p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
          >
            <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 space-y-0.5 sm:space-y-1">
                <h3 className="text-sm sm:text-base font-semibold text-foreground truncate leading-tight">
                  {asg.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                    {asg.classBatch}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Due: {asg.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
              <div className="text-left sm:text-center">
                <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">Submissions</div>
                <div className="text-xs sm:text-sm font-semibold text-foreground">
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
                size="sm"
                className="text-[10px] sm:text-xs"
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


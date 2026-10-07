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

interface AssignmentItem {
  id: string
  title: string
  classBatch: string
  dueDate: string
  submissionsCount: number
  totalStudents: number
  status: 'active' | 'graded' | 'draft'
}

const MOCK_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-1',
    title: 'React Custom Hooks & State Management Lab',
    classBatch: 'BCA - 3rd Year',
    dueDate: '10 Oct 2026',
    submissionsCount: 18,
    totalStudents: 24,
    status: 'active',
  },
  {
    id: 'asg-2',
    title: 'Python Data Structures & Algorithms Problem Set',
    classBatch: 'BCA - 4th Semester',
    dueDate: '12 Oct 2026',
    submissionsCount: 12,
    totalStudents: 14,
    status: 'active',
  },
  {
    id: 'asg-3',
    title: 'Relational Database Schema & SQL Querying Assignment',
    classBatch: 'BCA - 2nd Year',
    dueDate: '02 Oct 2026',
    submissionsCount: 12,
    totalStudents: 12,
    status: 'graded',
  },
  {
    id: 'asg-4',
    title: 'Capstone Project Milestone 2 Proposal Draft',
    classBatch: 'BCA - 3rd Year',
    dueDate: '18 Oct 2026',
    submissionsCount: 0,
    totalStudents: 24,
    status: 'draft',
  },
]

export function Assignments() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'graded' | 'draft'>('all')

  const filteredAssignments = MOCK_ASSIGNMENTS.filter((asg) => {
    const matchesSearch =
      asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.classBatch.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || asg.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-[#17324D] dark:text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            Create, manage and grade student assignments across your classes
          </p>
        </div>

        <button
          type="button"
          className="bg-[#0F9F83] hover:bg-[#0b7e67] text-white font-semibold h-10 px-4 text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
            <Clock className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#17324D] dark:text-foreground">2 Active</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Pending submissions</div>
          </div>
        </div>

        <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
            <FileCheck className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#17324D] dark:text-foreground">30 Submissions</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Ready for review</div>
          </div>
        </div>

        <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#17324D] dark:text-foreground">1 Graded</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400">Feedback released</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search assignments or classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl text-xs sm:text-sm text-[#17324D] dark:text-foreground placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F9F83]/20 focus:border-[#0F9F83] h-10"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'active', 'graded', 'draft'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer shrink-0 ${
                selectedStatus === st
                  ? 'bg-[#0F9F83] text-white shadow-2xs'
                  : 'bg-white dark:bg-card border border-[#E2E8F0] dark:border-border text-[#64748B]'
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
          <div
            key={asg.id}
            className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-[#0F9F83]/40 transition-colors"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#E8F7F3] text-[#0F9F83] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-bold text-[#17324D] dark:text-foreground truncate leading-tight">
                  {asg.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-slate-400">
                  <span className="font-semibold text-[#17324D] dark:text-foreground flex items-center gap-1">
                    <BookOpen className="size-3.5 text-[#0F9F83]" />
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

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0] dark:border-border">
              <div className="text-right sm:text-center">
                <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Submissions</div>
                <div className="text-sm font-bold text-[#17324D] dark:text-foreground">
                  {asg.submissionsCount} / {asg.totalStudents}
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize ${
                  asg.status === 'active'
                    ? 'bg-emerald-50 text-[#059669] border border-emerald-200/60'
                    : asg.status === 'graded'
                    ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200/60'
                    : 'bg-slate-100 text-[#64748B] border border-slate-200'
                }`}
              >
                {asg.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Assignments

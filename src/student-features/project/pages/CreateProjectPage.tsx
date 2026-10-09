import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Users,
  Search,
  UserPlus,
  X,
  PlusCircle,
  GitBranch,
  ExternalLink,
  Layers,
  Sparkles,
  Crown,
  UserCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Input, Textarea, Label, Badge, Avatar } from '@/components/ui'
import { MOCK_STUDENT_DIRECTORY, MOCK_MENTOR_DIRECTORY } from '../data/mockProjectData'
import type {
  ProjectType,
  SelectedGroupMember,
  StudentLookup,
  ProjectMentor,
  MentorLookup,
} from '../types/project.types'
import { useProjectWorkspace } from '../hooks/useProjectWorkspace'

export function CreateProjectPage() {
  const navigate = useNavigate()
  const { createNewProject } = useProjectWorkspace()

  // Form State
  const [projectType, setProjectType] = useState<ProjectType>('group')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Full-Stack Web App')
  const [courseName, setCourseName] = useState('Full-Stack Web & AI Application Development')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('2026-11-30')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [liveDemoUrl, setLiveDemoUrl] = useState('')
  const [techStackText, setTechStackText] = useState('React 19, TypeScript, Node.js, Tailwind CSS')

  // Selected Mentor State
  const [selectedMentor, setSelectedMentor] = useState<ProjectMentor | null>(null)
  const [mentorSearchQuery, setMentorSearchQuery] = useState('')
  const [isSearchingMentor, setIsSearchingMentor] = useState(false)

  // Group Project State
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Default initial team member is current student
  const [groupMembers, setGroupMembers] = useState<SelectedGroupMember[]>([
    {
      studentId: 'STD-1001',
      name: 'Mohammed Sinan',
      email: 'sinan@student.leadflow.io',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'team_lead',
      specificRole: 'Team Lead & Full-Stack Architect',
    },
  ])

  // Instant Mentor Lookup Search (by Mentor Name or Mentor ID)
  const filteredMentors = useMemo(() => {
    if (!mentorSearchQuery.trim()) return []
    const q = mentorSearchQuery.toLowerCase().trim()
    return MOCK_MENTOR_DIRECTORY.filter((mentor) => {
      return (
        mentor.mentorId.toLowerCase().includes(q) ||
        mentor.name.toLowerCase().includes(q) ||
        mentor.role.toLowerCase().includes(q) ||
        mentor.email.toLowerCase().includes(q)
      )
    })
  }, [mentorSearchQuery])

  const handleSelectMentor = (mentor: MentorLookup) => {
    setSelectedMentor({
      mentorId: mentor.mentorId,
      name: mentor.name,
      role: mentor.role,
      avatar: mentor.avatar,
      email: mentor.email,
    })
    setMentorSearchQuery('')
    setIsSearchingMentor(false)
  }

  // Instant GitHub-style Student ID autocomplete search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    return MOCK_STUDENT_DIRECTORY.filter((student) => {
      const alreadyAdded = groupMembers.some((m) => m.studentId === student.studentId)
      if (alreadyAdded) return false

      return (
        student.studentId.toLowerCase().includes(q) ||
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q)
      )
    })
  }, [searchQuery, groupMembers])

  const handleAddMember = (student: StudentLookup) => {
    setGroupMembers((prev) => [
      ...prev,
      {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        role: 'member',
        specificRole: student.defaultRole || 'Developer',
      },
    ])
    setSearchQuery('')
    setIsSearching(false)
  }

  const handleRemoveMember = (studentId: string) => {
    setGroupMembers((prev) => prev.filter((m) => m.studentId !== studentId))
  }

  const handleToggleMemberRole = (studentId: string, role: 'team_lead' | 'member') => {
    setGroupMembers((prev) => prev.map((m) => (m.studentId === studentId ? { ...m, role } : m)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createNewProject({
      title,
      category,
      courseName,
      description,
      projectType,
      targetDate,
      repositoryUrl,
      liveDemoUrl,
      techStackText,
      mentor: selectedMentor ?? undefined,
      teamName: projectType === 'group' ? teamName || `${title} Team` : undefined,
      teamDescription: projectType === 'group' ? teamDescription : undefined,
      groupMembers: projectType === 'group' ? groupMembers : undefined,
    })

    navigate('/student/projects')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-16">
      {/* Top Header & Back Navigation */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate('/student/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Project Workspace
        </button>

        <PageHeader
          title="Create New Project"
          description="Configure your capstone project details, choose project mode, assign mentor, and add team members."
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Project Type Selection (Single vs Group) */}
        <div className="space-y-4 rounded-md border border-border bg-surface p-6 shadow-sm">
          <div>
            <Label className="mb-1 block text-base font-bold text-foreground">
              Select Project Type *
            </Label>
            <p className="text-xs text-muted-foreground">
              Choose whether this is an individual single-student capstone or a collaborative group
              project.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Single / Individual Card */}
            <button
              type="button"
              onClick={() => setProjectType('individual')}
              className={`flex flex-col justify-between space-y-3 rounded-xl border p-5 text-left transition-all ${
                projectType === 'individual'
                  ? 'border-emerald-500/50 bg-emerald-500/5 ring-2 ring-emerald-500/30'
                  : 'border-border bg-muted/20 hover:border-border/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <User className="h-5 w-5" />
                </div>
                {projectType === 'individual' && (
                  <Badge tone="success" className="text-xs font-semibold">
                    Selected
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground">Single / Individual Project</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Personal capstone managed entirely by you with direct 1-on-1 mentor guidance.
                </p>
              </div>
            </button>

            {/* Group Project Card */}
            <button
              type="button"
              onClick={() => setProjectType('group')}
              className={`flex flex-col justify-between space-y-3 rounded-xl border p-5 text-left transition-all ${
                projectType === 'group'
                  ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/30'
                  : 'border-border bg-muted/20 hover:border-border/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                {projectType === 'group' && (
                  <Badge tone="primary" className="text-xs font-semibold">
                    Selected
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground">Group / Team Project</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Collaborative multi-student team workspace with shared milestones & member
                  progress tracking.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: General Project Information */}
        <div className="space-y-5 rounded-md border border-border bg-surface p-6 shadow-sm">
          <div className="border-b border-border pb-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Layers className="h-4 w-4 text-primary" /> General Project Information
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide project details, course domain, objectives, and initial repository links.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title" className="text-xs font-bold">
                Project Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g. AI-Powered Smart CRM & Analytics Suite"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-bold">
                Category / Domain *
              </Label>
              <Input
                id="category"
                placeholder="e.g. Full-Stack Web App, AI Model, Mobile App"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Target Completion Date */}
            <div className="space-y-1.5">
              <Label htmlFor="targetDate" className="text-xs font-bold">
                Target Completion Date *
              </Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Course Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="courseName" className="text-xs font-bold">
                Associated Course *
              </Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Project Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description" className="text-xs font-bold">
                Detailed Project Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your capstone objectives, key technical deliverables, target users, and architectural scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="resize-none text-xs"
              />
            </div>

            {/* Tech Stack */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="techStack" className="text-xs font-bold">
                Tech Stack (Comma Separated)
              </Label>
              <Input
                id="techStack"
                placeholder="e.g. React 19, TypeScript, Tailwind CSS, Node.js, PostgreSQL"
                value={techStackText}
                onChange={(e) => setTechStackText(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* GitHub Repo Link */}
            <div className="space-y-1.5">
              <Label
                htmlFor="repositoryUrl"
                className="flex items-center gap-1.5 text-xs font-bold"
              >
                <GitBranch className="h-3.5 w-3.5 text-primary" /> Repository Link (Optional)
              </Label>
              <Input
                id="repositoryUrl"
                placeholder="https://github.com/org/my-capstone-repo"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Live Demo URL */}
            <div className="space-y-1.5">
              <Label htmlFor="liveDemoUrl" className="flex items-center gap-1.5 text-xs font-bold">
                <ExternalLink className="h-3.5 w-3.5 text-primary" /> Live Staging Demo URL
                (Optional)
              </Label>
              <Input
                id="liveDemoUrl"
                placeholder="https://my-capstone.leadflow.app"
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Mentor Selection / Search */}
        <div className="space-y-4 rounded-md border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <UserCheck className="h-4 w-4 text-primary" /> Select Senior Mentor
              </h3>
              <p className="text-xs text-muted-foreground">
                Search and assign a senior lead mentor by <strong>Mentor Name</strong> or{' '}
                <strong>Mentor ID</strong> (e.g. <code>MTR-1002</code>).
              </p>
            </div>
            {selectedMentor && (
              <Badge tone="success" className="text-xs font-bold">
                Mentor Selected
              </Badge>
            )}
          </div>

          {/* Currently Selected Mentor */}
          {selectedMentor && (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5">
              <div className="flex items-center gap-3">
                <Avatar name={selectedMentor.name} src={selectedMentor.avatar} size="md" />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{selectedMentor.name}</span>

                    {selectedMentor.mentorId && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                        {selectedMentor.mentorId}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">{selectedMentor.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMentor(null)
                  setMentorSearchQuery('')
                  setIsSearchingMentor(false)
                }}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Remove Member"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Search Mentor Input */}
          <div className="relative space-y-2">
            <Label className="flex items-center justify-between text-xs font-bold">
              <span>Search Mentor by Name or Mentor ID</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Try: <code className="rounded bg-muted px-1 text-primary">MTR-1001</code>,{' '}
                <code className="rounded bg-muted px-1 text-primary">MTR-1002</code>, or name
              </span>
            </Label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search mentor name or Mentor ID..."
                value={mentorSearchQuery}
                onChange={(e) => {
                  setMentorSearchQuery(e.target.value)
                  setIsSearchingMentor(true)
                }}
                onFocus={() => setIsSearchingMentor(true)}
                className="pl-9 text-xs"
              />
              {mentorSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setMentorSearchQuery('')
                    setIsSearchingMentor(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Mentor Search Dropdown */}
            {isSearchingMentor && filteredMentors.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-xl">
                <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Matching Mentors ({filteredMentors.length}):
                </span>
                <div className="mt-1 space-y-1">
                  {filteredMentors.map((mentor) => (
                    <button
                      key={mentor.mentorId}
                      type="button"
                      onClick={() => handleSelectMentor(mentor)}
                      className="flex w-full items-center justify-between rounded-lg p-2.5 text-left transition-colors hover:bg-primary/10"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={mentor.name} src={mentor.avatar} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{mentor.name}</span>
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                              {mentor.mentorId}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {mentor.role} • {mentor.department}
                          </p>
                        </div>
                      </div>

                      <Button type="button" size="sm" className="h-7 text-xs font-bold">
                        <UserPlus className="mr-1 h-3 w-3" /> Add Mentor
                      </Button>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Group Project Members Section (Rendered ONLY if Group Project) */}
        {projectType === 'group' && (
          <div className="space-y-6 rounded-md border border-border bg-surface p-6 shadow-sm ring-1 ring-primary/10">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Users className="h-4 w-4 text-primary" /> Group Team & Member Management
                </h3>
                <p className="text-xs text-muted-foreground">
                  Search students by <strong>Student ID</strong> (e.g. <code>STD-1002</code>) to add
                  team members like GitHub.
                </p>
              </div>
              <Badge tone="primary" className="text-xs font-bold">
                {groupMembers.length} Members Added
              </Badge>
            </div>

            {/* Team Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="teamName" className="text-xs font-bold">
                  Team / Group Name *
                </Label>
                <Input
                  id="teamName"
                  placeholder="e.g. Alpha Developers, Nexus Squad"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required={projectType === 'group'}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="teamDescription" className="text-xs font-bold">
                  Team Motto / Description
                </Label>
                <Input
                  id="teamDescription"
                  placeholder="e.g. Cross-functional team building React & Node microservices."
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* GitHub-style Student ID Search Bar */}
            <div className="relative space-y-2">
              <Label className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5 text-primary" /> Search & Add Team Members by
                  Student ID
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Try typing: <code className="rounded bg-muted px-1 text-primary">STD-1002</code>,{' '}
                  <code className="rounded bg-muted px-1 text-primary">STD-1003</code>, or name
                </span>
              </Label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Type student ID (STD-xxxx) or student name to add..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setIsSearching(true)
                  }}
                  onFocus={() => setIsSearching(true)}
                  className="pl-9 text-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setIsSearching(false)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              {isSearching && filteredStudents.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-xl">
                  <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Found {filteredStudents.length} Matching Students:
                  </span>
                  <div className="mt-1 space-y-1">
                    {filteredStudents.map((student) => (
                      <button
                        key={student.studentId}
                        type="button"
                        onClick={() => handleAddMember(student)}
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-primary/10"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={student.name} src={student.avatar} size="sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {student.name}
                              </span>
                              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                                {student.studentId}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {student.email} • {student.batch}
                            </p>
                          </div>
                        </div>

                        <Button type="button" size="sm" className="h-7 text-xs font-bold">
                          <PlusCircle className="mr-1 h-3 w-3" /> Add Member
                        </Button>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isSearching && searchQuery && filteredStudents.length === 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-surface p-4 text-center text-xs text-muted-foreground shadow-lg">
                  No matching active students found for &quot;{searchQuery}&quot;. Try searching
                  with <strong>STD-1002</strong>, <strong>STD-1003</strong>, or{' '}
                  <strong>STD-1004</strong>.
                </div>
              )}
            </div>

            {/* List of Added Team Members */}
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-bold text-foreground">
                Current Team Members ({groupMembers.length}):
              </span>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {groupMembers.map((member) => (
                  <div
                    key={member.studentId}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={member.name} src={member.avatar} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-bold text-foreground">
                            {member.name}
                          </span>
                          <span className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {member.studentId}
                          </span>
                        </div>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {member.specificRole || 'Team Member'}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleMemberRole(
                            member.studentId,
                            member.role === 'team_lead' ? 'member' : 'team_lead',
                          )
                        }
                        className={`rounded-md px-2 py-1 text-[11px] font-bold transition-all ${
                          member.role === 'team_lead'
                            ? 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {member.role === 'team_lead' ? (
                          <span className="flex items-center gap-1">
                            <Crown className="h-3 w-3" /> Lead
                          </span>
                        ) : (
                          'Member'
                        )}
                      </button>

                      {groupMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.studentId)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Remove Member"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/student/projects')}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button type="submit" className="px-6 text-xs font-bold">
            <Sparkles className="mr-1.5 h-4 w-4" /> Create & Launch Project Workspace
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateProjectPage

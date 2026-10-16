export type TopicStatus = 'completed' | 'in_progress' | 'not_started'

export interface SyllabusTopic {
  id: string
  title: string
  status: TopicStatus
  estimatedHours?: number
  completedDate?: string
  notes?: string
}

export interface SyllabusModule {
  id: string
  moduleNumber: number
  title: string
  description?: string
  topics: SyllabusTopic[]
}

export interface ClassSyllabusRecord {
  classId: string
  className: string
  courseCode: string
  program: string
  year: string
  semester: string
  totalTopics: number
  completedTopics: number
  inProgressTopics: number
  notStartedTopics: number
  totalModules: number
  completedModules: number
  inProgressModules: number
  notStartedModules: number
  completionPercentage: number
  status: 'Completed' | 'On Track' | 'In Progress' | 'Behind'
  phaseText: string
  modules: SyllabusModule[]
}

export type SyllabusFilterTab = 'all' | 'completed' | 'in_progress' | 'not_started'

export interface SyllabusSummaryStats {
  totalModules: number
  completedModules: number
  inProgressModules: number
  notStartedModules: number
  totalTopics: number
  completedTopics: number
  inProgressTopics: number
  notStartedTopics: number
  overallPercentage: number
  statusText: 'Completed' | 'On Track' | 'In Progress' | 'Behind'
  statusTone: 'success' | 'primary' | 'warning' | 'neutral'
  phaseText: string
}

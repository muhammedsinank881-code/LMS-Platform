import { useState, useMemo } from 'react'
import { BookOpen, Layers } from 'lucide-react'
import {
  SyllabusHeader,
  ClassBatchSelector,
  OverallCompletionCard,
  SyllabusStats,
  SyllabusFilters,
  ModuleAccordionItem,
  UpdateProgressModal,
} from '../components'
import { useSyllabusData } from '../hooks/useSyllabusData'
import type { SyllabusFilterTab, TopicStatus } from '../types'

export function SyllabusCompletionPage() {
  const {
    mentorClasses,
    selectedClassId,
    setSelectedClassId,
    currentMentorClass,
    classSyllabusRecord,
    updateTopicStatus,
    batchUpdateModuleTopics,
  } = useSyllabusData()

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<SyllabusFilterTab>('all')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalInitialModuleId, setModalInitialModuleId] = useState<string | undefined>()

  const handleOpenUpdateModal = (moduleId?: string) => {
    setModalInitialModuleId(moduleId)
    setModalOpen(true)
  }

  // Filter modules and topics based on search and tab filter
  const filteredModules = useMemo(() => {
    if (!classSyllabusRecord) return []

    const q = searchQuery.toLowerCase().trim()

    return classSyllabusRecord.modules
      .map((mod) => {
        // Filter topics by status and search query
        const matchingTopics = mod.topics.filter((topic) => {
          // Status filter
          if (activeFilter !== 'all' && topic.status !== activeFilter) {
            return false
          }
          // Search query filter
          if (q) {
            const matchesTopic = topic.title.toLowerCase().includes(q)
            const matchesModule = mod.title.toLowerCase().includes(q)
            if (!matchesTopic && !matchesModule) {
              return false
            }
          }
          return true
        })

        return {
          ...mod,
          topics: matchingTopics,
        }
      })
      .filter((mod) => {
        // If filter or query is active, only show modules that have matching topics
        if (activeFilter !== 'all' || q) {
          return mod.topics.length > 0
        }
        return true
      })
  }, [classSyllabusRecord, searchQuery, activeFilter])

  // Counts for filters
  const filterCounts = useMemo(() => {
    if (!classSyllabusRecord) {
      return { all: 0, completed: 0, in_progress: 0, not_started: 0 }
    }
    return {
      all: classSyllabusRecord.totalTopics,
      completed: classSyllabusRecord.completedTopics,
      in_progress: classSyllabusRecord.inProgressTopics,
      not_started: classSyllabusRecord.notStartedTopics,
    }
  }, [classSyllabusRecord])

  const handleTopicStatusChange = (
    moduleId: string,
    topicId: string,
    nextStatus: TopicStatus,
  ) => {
    if (!classSyllabusRecord) return
    updateTopicStatus(classSyllabusRecord.classId, moduleId, topicId, nextStatus)
  }

  const handleSaveModal = (
    moduleId: string,
    updates: { topicId: string; status: TopicStatus }[],
  ) => {
    if (!classSyllabusRecord) return
    batchUpdateModuleTopics(classSyllabusRecord.classId, moduleId, updates)
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-foreground pb-8 max-w-7xl mx-auto">
      {/* 1. Header with Breadcrumb and + Update Progress Button */}
      <SyllabusHeader onOpenUpdateModal={() => handleOpenUpdateModal()} />

      {/* 2. Class / Batch Selector */}
      <ClassBatchSelector
        selectedClassId={selectedClassId}
        onClassChange={setSelectedClassId}
        classes={mentorClasses}
      />

      {/* 3. Overall Completion Prominent Card */}
      <OverallCompletionCard record={classSyllabusRecord} />

      {/* 4. Syllabus Progress Overview (4 Cards: Total Modules, Completed, In Progress, Not Started) */}
      <SyllabusStats record={classSyllabusRecord} />

      {/* 5. Search & Filters Bar */}
      <div className="pt-2">
        <SyllabusFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
      </div>

      {/* 6. Structured Module / Chapter List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Curriculum Modules & Chapters
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredModules.length} {filteredModules.length === 1 ? 'module' : 'modules'} displayed
          </span>
        </div>

        {filteredModules.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border border-border rounded-2xl text-muted-foreground space-y-2">
            <Layers className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm font-semibold">No modules match your current filter</p>
            <p className="text-xs">Try clearing your search query or selecting &quot;All Topics&quot;.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredModules.map((mod, index) => (
              <ModuleAccordionItem
                key={mod.id}
                module={mod}
                initiallyOpen={index === 0 || activeFilter !== 'all' || Boolean(searchQuery)}
                onStatusChange={(topicId, nextStatus) =>
                  handleTopicStatusChange(mod.id, topicId, nextStatus)
                }
                onOpenUpdateModal={handleOpenUpdateModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* 7. Update Progress Modal */}
      {classSyllabusRecord ? (
        <UpdateProgressModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          modules={classSyllabusRecord.modules}
          initialModuleId={modalInitialModuleId}
          className={`${currentMentorClass?.program} - ${currentMentorClass?.year} (${currentMentorClass?.title})`}
          onSave={handleSaveModal}
        />
      ) : null}
    </div>
  )
}

export default SyllabusCompletionPage

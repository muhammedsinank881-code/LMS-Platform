import { useState, useMemo, useCallback, useEffect } from 'react'
import { useMentorClasses } from '@/mentor-features/my-classes/hooks/useMentorClasses'
import {
  CLASS_SYLLABUS_MODULES_MAP,
  calculateClassSyllabusRecord,
} from '../mockData'
import type {
  ClassSyllabusRecord,
  SyllabusModule,
  SyllabusSummaryStats,
  TopicStatus,
} from '../types'

// Module-level cache so syllabus modifications persist in memory during the session
const sharedSyllabusModulesMap: Record<string, SyllabusModule[]> = {
  ...CLASS_SYLLABUS_MODULES_MAP,
}
const listeners = new Set<() => void>()

export function getOverallSyllabusStats(classesList = Object.keys(sharedSyllabusModulesMap)): SyllabusSummaryStats {
  let totalTopics = 0
  let completedTopics = 0
  let inProgressTopics = 0
  let notStartedTopics = 0

  let totalModules = 0
  let completedModules = 0
  let inProgressModules = 0
  let notStartedModules = 0

  classesList.forEach((classId) => {
    const modules = sharedSyllabusModulesMap[classId]
    if (modules) {
      totalModules += modules.length
      modules.forEach((mod) => {
        const modTotal = mod.topics.length
        const modCompleted = mod.topics.filter((t) => t.status === 'completed').length
        const modInProgress = mod.topics.filter((t) => t.status === 'in_progress').length
        const modNotStarted = mod.topics.filter((t) => t.status === 'not_started').length

        totalTopics += modTotal
        completedTopics += modCompleted
        inProgressTopics += modInProgress
        notStartedTopics += modNotStarted

        if (modCompleted === modTotal && modTotal > 0) {
          completedModules += 1
        } else if (modCompleted > 0 || modInProgress > 0) {
          inProgressModules += 1
        } else {
          notStartedModules += 1
        }
      })
    }
  })

  const overallPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  let statusText: 'Completed' | 'On Track' | 'In Progress' | 'Behind'
  let statusTone: 'success' | 'primary' | 'warning' | 'neutral'
  let phaseText: string

  if (overallPercentage === 100) {
    statusText = 'Completed'
    statusTone = 'success'
    phaseText = 'All Modules Completed'
  } else if (overallPercentage >= 90) {
    statusText = 'On Track'
    statusTone = 'success'
    phaseText = 'Final Review & Wrap-up'
  } else if (overallPercentage >= 75) {
    statusText = 'On Track'
    statusTone = 'success'
    phaseText = 'Advanced Modules Phase'
  } else if (overallPercentage >= 50) {
    statusText = 'In Progress'
    statusTone = 'primary'
    phaseText = 'Mid-Term Evaluation Phase'
  } else if (overallPercentage > 0) {
    statusText = 'Behind'
    statusTone = 'warning'
    phaseText = 'Foundation Modules Phase'
  } else {
    statusText = 'Behind'
    statusTone = 'warning'
    phaseText = 'Curriculum Not Started'
  }

  return {
    totalModules,
    completedModules,
    inProgressModules,
    notStartedModules,
    totalTopics,
    completedTopics,
    inProgressTopics,
    notStartedTopics,
    overallPercentage,
    statusText,
    statusTone,
    phaseText,
  }
}

export function useSyllabusData(initialClassId?: string) {
  const { classes: mentorClasses, loading: classesLoading } = useMentorClasses()
  const [, setRevision] = useState(0)

  useEffect(() => {
    const notify = () => setRevision((r) => r + 1)
    listeners.add(notify)
    return () => {
      listeners.delete(notify)
    }
  }, [])

  // Default to first mentor class ID (e.g. cls-102 or cls-101)
  const defaultClassId = useMemo(() => {
    if (initialClassId && mentorClasses.some((c) => c.id === initialClassId)) {
      return initialClassId
    }
    // Prefer active class like cls-102 if available
    const activeClass = mentorClasses.find((c) => c.status === 'active')
    return activeClass?.id || mentorClasses[0]?.id || 'cls-102'
  }, [initialClassId, mentorClasses])

  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || defaultClassId,
  )
  const [prevInitialClassId, setPrevInitialClassId] = useState(initialClassId)

  if (initialClassId !== prevInitialClassId) {
    setPrevInitialClassId(initialClassId)
    if (initialClassId) {
      setSelectedClassId(initialClassId)
    } else if (defaultClassId && !selectedClassId) {
      setSelectedClassId(defaultClassId)
    }
  } else if (defaultClassId && !selectedClassId) {
    setSelectedClassId(defaultClassId)
  }

  // Selected class record
  const currentMentorClass = useMemo(() => {
    return mentorClasses.find((c) => c.id === selectedClassId) || mentorClasses[0]
  }, [mentorClasses, selectedClassId])

  // Current class syllabus data
  const classSyllabusRecord: ClassSyllabusRecord | null = useMemo(() => {
    if (!currentMentorClass) return null

    const modules =
      sharedSyllabusModulesMap[currentMentorClass.id] ||
      sharedSyllabusModulesMap['cls-102'] ||
      []

    return calculateClassSyllabusRecord(
      currentMentorClass.id,
      currentMentorClass.title,
      currentMentorClass.courseCode,
      currentMentorClass.program,
      currentMentorClass.year,
      currentMentorClass.semester,
      modules,
    )
  }, [currentMentorClass])

  // Overall syllabus stats across all mentor classes
  const overallStats = useMemo(() => {
    const classIds = mentorClasses.map((c) => c.id)
    return getOverallSyllabusStats(classIds.length > 0 ? classIds : undefined)
  }, [mentorClasses])

  // Update topic status
  const updateTopicStatus = useCallback(
    (classId: string, moduleId: string, topicId: string, newStatus: TopicStatus) => {
      const modules = sharedSyllabusModulesMap[classId]
      if (!modules) return

      const updatedModules = modules.map((mod) => {
        if (mod.id !== moduleId) return mod
        return {
          ...mod,
          topics: mod.topics.map((top) => {
            if (top.id !== topicId) return top
            return {
              ...top,
              status: newStatus,
              completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
            }
          }),
        }
      })

      sharedSyllabusModulesMap[classId] = updatedModules
      listeners.forEach((fn) => fn())
    },
    [],
  )

  // Batch update multiple topics in a module
  const batchUpdateModuleTopics = useCallback(
    (classId: string, moduleId: string, topicUpdates: { topicId: string; status: TopicStatus }[]) => {
      const modules = sharedSyllabusModulesMap[classId]
      if (!modules) return

      const updateMap = new Map(topicUpdates.map((u) => [u.topicId, u.status]))

      const updatedModules = modules.map((mod) => {
        if (mod.id !== moduleId) return mod
        return {
          ...mod,
          topics: mod.topics.map((top) => {
            const nextStatus = updateMap.get(top.id)
            if (!nextStatus) return top
            return {
              ...top,
              status: nextStatus,
              completedDate: nextStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
            }
          }),
        }
      })

      sharedSyllabusModulesMap[classId] = updatedModules
      listeners.forEach((fn) => fn())
    },
    [],
  )

  return {
    mentorClasses,
    selectedClassId,
    setSelectedClassId,
    currentMentorClass,
    classSyllabusRecord,
    overallStats,
    loading: classesLoading,
    updateTopicStatus,
    batchUpdateModuleTopics,
  }
}

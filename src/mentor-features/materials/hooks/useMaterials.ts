import { useMemo, useState } from 'react'
import type {
  LearningMaterial,
  MaterialFiltersState,
  MaterialStatus,
} from '../types'
import { MOCK_LEARNING_MATERIALS } from '../mockData'

export function useMaterials() {
  const [materials, setMaterials] = useState<LearningMaterial[]>(MOCK_LEARNING_MATERIALS)
  const [filters, setFilters] = useState<MaterialFiltersState>({
    search: '',
    type: 'all',
    course: 'all',
    module: 'all',
    status: 'all',
    sort: 'recent',
  })

  // Modal / Drawer states
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null)
  const [deletingMaterial, setDeletingMaterial] = useState<LearningMaterial | null>(null)

  // Filtered and sorted materials list
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((item) => {
        // Search filter
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase().trim()
          const matchTitle = item.title.toLowerCase().includes(q)
          const matchDesc = item.description?.toLowerCase().includes(q) || false
          const matchTopic = item.topic?.toLowerCase().includes(q) || false
          const matchCourse = item.courseClass.toLowerCase().includes(q)
          const matchModule = item.module.toLowerCase().includes(q)
          if (!matchTitle && !matchDesc && !matchTopic && !matchCourse && !matchModule) {
            return false
          }
        }

        // Type filter
        if (filters.type !== 'all' && item.type !== filters.type) {
          return false
        }

        // Course filter
        if (filters.course !== 'all' && item.courseClass !== filters.course) {
          return false
        }

        // Module filter
        if (filters.module !== 'all' && item.module !== filters.module) {
          return false
        }

        // Status filter
        if (filters.status !== 'all' && item.status !== filters.status) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        if (filters.sort === 'az') {
          return a.title.localeCompare(b.title)
        }
        if (filters.sort === 'oldest') {
          return new Date(a.uploadedDate).getTime() - new Date(b.uploadedDate).getTime()
        }
        // Default: 'recent'
        return new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime()
      })
  }, [materials, filters])

  // Extract unique course and module options for dropdown filters
  const availableCourses = useMemo(() => {
    const set = new Set<string>()
    materials.forEach((m) => set.add(m.courseClass))
    return Array.from(set)
  }, [materials])

  const availableModules = useMemo(() => {
    const set = new Set<string>()
    materials.forEach((m) => set.add(m.module))
    return Array.from(set).sort()
  }, [materials])

  // Actions
  const handleAddMaterial = (newMat: Omit<LearningMaterial, 'id' | 'uploadedDate' | 'uploadedBy'>) => {
    const createdItem: LearningMaterial = {
      ...newMat,
      id: `mat-${Date.now()}`,
      uploadedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      uploadedBy: 'Prof. Alex Morgan',
    }
    setMaterials((prev) => [createdItem, ...prev])
    setIsUploadOpen(false)
  }

  const handleUpdateMaterial = (updatedMat: LearningMaterial) => {
    setMaterials((prev) => prev.map((item) => (item.id === updatedMat.id ? updatedMat : item)))
    if (selectedMaterial?.id === updatedMat.id) {
      setSelectedMaterial(updatedMat)
    }
    setEditingMaterial(null)
  }

  const handleToggleStatus = (id: string) => {
    setMaterials((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus: MaterialStatus = item.status === 'published' ? 'draft' : 'published'
          const updated = { ...item, status: nextStatus }
          if (selectedMaterial?.id === id) {
            setSelectedMaterial(updated)
          }
          return updated
        }
        return item
      }),
    )
  }

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((item) => item.id !== id))
    if (selectedMaterial?.id === id) {
      setSelectedMaterial(null)
    }
    setDeletingMaterial(null)
  }

  return {
    materials: filteredMaterials,
    allMaterialsCount: materials.length,
    filters,
    setFilters,
    availableCourses,
    availableModules,
    // Modals
    isUploadOpen,
    setIsUploadOpen,
    selectedMaterial,
    setSelectedMaterial,
    editingMaterial,
    setEditingMaterial,
    deletingMaterial,
    setDeletingMaterial,
    // Handlers
    handleAddMaterial,
    handleUpdateMaterial,
    handleToggleStatus,
    handleDeleteMaterial,
  }
}

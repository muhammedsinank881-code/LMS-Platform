export type MaterialType = 'pdf' | 'video'

export type VideoSource = 'upload' | 'url'

export type MaterialStatus = 'published' | 'draft'

export interface LearningMaterial {
  id: string
  title: string
  description?: string
  type: MaterialType
  courseClass: string
  semester: string
  module: string
  topic?: string
  status: MaterialStatus
  uploadedDate: string
  uploadedBy: string
  // PDF specific
  fileName?: string
  fileSize?: string
  fileUrl?: string
  // Video specific
  videoSource?: VideoSource
  videoUrl?: string
  duration?: string
}

export type MaterialFilterTab = 'all' | 'pdf' | 'video'

export type MaterialSortOption = 'recent' | 'oldest' | 'az'

export interface MaterialFiltersState {
  search: string
  type: MaterialFilterTab
  course: string
  module: string
  status: 'all' | MaterialStatus
  sort: MaterialSortOption
}

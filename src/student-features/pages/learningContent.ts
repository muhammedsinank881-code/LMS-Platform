import type { LessonContentBlock } from '../courses/data/coursesData'

export type ContentPreference =
  | 'notes'
  | 'videos'
  | 'images'
  | 'diagrams'
  | 'externalLinks'
  | 'liveClasses'
  | 'codeExamples'
  | 'assignments'
  | 'quizzes'

export type ContentPreferences = Partial<Record<ContentPreference, boolean>>

function getPreferenceForBlock(block: LessonContentBlock): ContentPreference | null {
  switch (block.type) {
    case 'notes':
      return 'notes'
    case 'video':
      return 'videos'
    case 'image':
      return 'images'
    case 'diagram':
      return 'diagrams'
    case 'external-link':
      return 'externalLinks'
    case 'live-class':
      return 'liveClasses'
    case 'code':
      return 'codeExamples'
    case 'assignment':
      return 'assignments'
    case 'quiz':
      return 'quizzes'
    default:
      return null
  }
}

export function filterVisibleLessonBlocks(
  blocks: LessonContentBlock[],
  preferences: ContentPreferences,
) {
  return blocks.filter((block) => {
    const preference = getPreferenceForBlock(block)
    return preference === null || preferences[preference] === true
  })
}

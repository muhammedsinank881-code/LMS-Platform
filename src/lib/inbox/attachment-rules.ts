import type { MessageAttachment } from '@/types'

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])
const DOCUMENT_EXT = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'])
const AUDIO_EXT = new Set(['mp3', 'ogg', 'm4a', 'aac', 'wav'])

const LIMITS: Record<MessageAttachment['kind'], number> = {
  image: 5 * 1024,
  document: 16 * 1024,
  audio: 16 * 1024,
}

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

export function kindFromName(name: string): MessageAttachment['kind'] | null {
  const ext = extensionOf(name)
  if (IMAGE_EXT.has(ext)) return 'image'
  if (DOCUMENT_EXT.has(ext)) return 'document'
  if (AUDIO_EXT.has(ext)) return 'audio'
  return null
}

export function validateAttachment(file: { name: string; sizeKb: number }): string | null {
  const kind = kindFromName(file.name)
  if (!kind) return 'That file type is not allowed.'
  if (file.sizeKb <= 0) return 'The file is empty.'
  if (file.sizeKb > LIMITS[kind]) {
    const mb = Math.round(LIMITS[kind] / 1024)
    return `${kind} files must be ${mb} MB or smaller.`
  }
  return null
}

export function toMockAttachment(file: { name: string; sizeKb: number }): MessageAttachment {
  const kind = kindFromName(file.name)
  if (!kind) throw new Error('Unsupported attachment')
  return {
    name: file.name,
    kind,
    sizeKb: file.sizeKb,
    url: `mock://${kind}/${encodeURIComponent(file.name)}`,
  }
}

export function formatFileSize(sizeKb: number): string {
  return sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`
}

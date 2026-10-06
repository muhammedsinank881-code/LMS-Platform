export const WHATSAPP_WINDOW_MS = 24 * 60 * 60 * 1000
export const WHATSAPP_CLOSING_SOON_MS = 60 * 60 * 1000

export type WhatsAppWindowState = 'open' | 'closing_soon' | 'expired'

export interface WhatsAppWindow {
  state: WhatsAppWindowState
  remainingMs: number
  expiresAt: string | null
  canFreeText: boolean
  label: string
}

function formatDuration(ms: number): string {
  const abs = Math.abs(ms)
  const hours = Math.floor(abs / 3_600_000)
  const minutes = Math.floor((abs % 3_600_000) / 60_000)
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return 'less than a minute'
}

export function getWhatsAppWindow(
  expiresAt: string | null | undefined,
  now: Date = new Date(),
): WhatsAppWindow {
  if (!expiresAt) {
    return {
      state: 'expired',
      remainingMs: 0,
      expiresAt: null,
      canFreeText: false,
      label: 'Window expired',
    }
  }
  const remainingMs = Date.parse(expiresAt) - now.getTime()
  if (remainingMs <= 0) {
    return {
      state: 'expired',
      remainingMs,
      expiresAt,
      canFreeText: false,
      label: `Expired ${formatDuration(remainingMs)} ago`,
    }
  }
  const state: WhatsAppWindowState =
    remainingMs <= WHATSAPP_CLOSING_SOON_MS ? 'closing_soon' : 'open'
  return {
    state,
    remainingMs,
    expiresAt,
    canFreeText: true,
    label: state === 'closing_soon' ? `Closes in ${formatDuration(remainingMs)}` : `Open · ${formatDuration(remainingMs)} left`,
  }
}

export function windowExpiresAtFrom(inboundAt: string): string {
  return new Date(Date.parse(inboundAt) + WHATSAPP_WINDOW_MS).toISOString()
}

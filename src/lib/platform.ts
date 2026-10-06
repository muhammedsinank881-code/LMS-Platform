/** Label for the primary modifier key, used in shortcut hints. */
export function getModifierKeyLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl'
  return /mac|iphone|ipad/i.test(navigator.userAgent) ? '⌘' : 'Ctrl'
}

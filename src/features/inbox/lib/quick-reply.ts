export function applyQuickReplyShortcut(
  body: string,
  replies: Array<{ shortcut: string; body: string }>,
): string {
  const match = /(?:^|\s)(\/[a-z0-9_-]+)$/.exec(body)
  if (!match) return body
  const found = replies.find((item) => item.shortcut === match[1])
  if (!found) return body
  return `${body.slice(0, body.length - match[1].length)}${found.body}`
}

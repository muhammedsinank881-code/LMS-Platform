import type { ValidationIssue } from '@/lib/automation'

/** Messages grouped by path, errors first, for the cards that show them inline. */
export function issuesByPath(issues: readonly ValidationIssue[]): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  const ordered = [...issues].sort((a, b) => Number(b.severity === 'error') - Number(a.severity === 'error'))
  for (const issue of ordered) (out[issue.path] ??= []).push(issue.message)
  return out
}

/** First message per path, for condition rows. */
export function firstByPath(byPath: Record<string, string[]>, prefix: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(byPath)
      .filter(([path]) => path === prefix || path.startsWith(`${prefix}.`))
      .map(([path, messages]) => [path, messages[0]]),
  )
}

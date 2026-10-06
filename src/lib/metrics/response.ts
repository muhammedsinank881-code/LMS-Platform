import { RESPONSE_BUCKETS, type ResponseBucket, type ResponseDistribution } from '@/types'

export const RESPONSE_BUCKET_LABELS: Record<ResponseBucket, string> = {
  lt5m: 'Under 5 min',
  lt15m: '5-15 min',
  lt1h: '15 min-1 h',
  lt4h: '1-4 h',
  gt4h: 'Over 4 h',
}

/** Speed-to-lead bucket for a first response time in minutes. Null when never responded. */
export function bucketResponseTime(mins: number | null | undefined): ResponseBucket | null {
  if (mins === null || mins === undefined || !Number.isFinite(mins) || mins < 0) return null
  if (mins < 5) return 'lt5m'
  if (mins < 15) return 'lt15m'
  if (mins < 60) return 'lt1h'
  if (mins < 240) return 'lt4h'
  return 'gt4h'
}

export function emptyDistribution(): ResponseDistribution {
  return { lt5m: 0, lt15m: 0, lt1h: 0, lt4h: 0, gt4h: 0 }
}

export function responseDistribution(
  times: ReadonlyArray<number | null | undefined>,
): ResponseDistribution {
  const result = emptyDistribution()
  for (const mins of times) {
    const bucket = bucketResponseTime(mins)
    if (bucket) result[bucket] += 1
  }
  return result
}

export function speedVsConversion(
  leads: ReadonlyArray<{ firstResponseTimeMins: number | null; won: boolean }>,
): Array<{ bucket: ResponseBucket; leads: number; conversionRate: number | null }> {
  return RESPONSE_BUCKETS.map((bucket) => {
    const inBucket = leads.filter((lead) => bucketResponseTime(lead.firstResponseTimeMins) === bucket)
    const won = inBucket.filter((lead) => lead.won).length
    return {
      bucket,
      leads: inBucket.length,
      conversionRate: inBucket.length === 0 ? null : (won / inBucket.length) * 100,
    }
  })
}

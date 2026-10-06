import { Faker, en, en_IN } from '@faker-js/faker'
import { addMilliseconds } from 'date-fns'

export const DEFAULT_SEED = 20260105

/** Everything a seed builder needs. `faker` is shared and seeded, so output is deterministic. */
export interface SeedEnv {
  faker: Faker
  now: Date
  tenantId: string
  /** Short workspace key used in ids, e.g. `acme`. */
  key: string
  /** 1 for the full dataset, smaller for the secondary workspace. */
  scale: number
}

export function createFaker(seed: number = DEFAULT_SEED): Faker {
  const faker = new Faker({ locale: [en_IN, en] })
  faker.seed(seed)
  return faker
}

export const seedId = (env: SeedEnv, kind: string, slug: string | number) =>
  `${kind}-${env.key}-${slug}`

export const scaled = (env: SeedEnv, base: number, min = 1) =>
  Math.max(min, Math.round(base * env.scale))

export function pick<T>(env: SeedEnv, items: readonly T[]): T {
  return env.faker.helpers.arrayElement(items)
}

export function weighted<T>(env: SeedEnv, items: ReadonlyArray<{ value: T; weight: number }>): T {
  return env.faker.helpers.weightedArrayElement(items)
}

export function int(env: SeedEnv, min: number, max: number): number {
  return env.faker.number.int({ min, max })
}

export function chance(env: SeedEnv, probability: number): boolean {
  return env.faker.datatype.boolean({ probability })
}

export function shuffle<T>(env: SeedEnv, items: readonly T[]): T[] {
  return env.faker.helpers.shuffle([...items])
}

export function sample<T>(env: SeedEnv, items: readonly T[], count: number): T[] {
  return shuffle(env, items).slice(0, Math.max(0, Math.min(count, items.length)))
}

/** A random moment between `maxMs` ago and `minMs` ago, relative to `env.now`. */
export function pastDate(env: SeedEnv, minMs: number, maxMs: number): Date {
  return addMilliseconds(env.now, -int(env, minMs, maxMs))
}

export const MINUTE = 60_000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

/**
 * Splits `total` across `weights` with the largest-remainder method, giving every bucket at
 * least `min` so that every status and source appears in the data.
 */
export function allocate(total: number, weights: readonly number[], min = 1): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  const exact = weights.map((w) => (w / sum) * total)
  const counts = exact.map((value) => Math.max(min, Math.floor(value)))
  let diff = total - counts.reduce((a, b) => a + b, 0)
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder)
  for (let i = 0; diff > 0; i = (i + 1) % byRemainder.length) {
    counts[byRemainder[i].index] += 1
    diff -= 1
  }
  // The per-bucket minimum can overshoot the total; trim the largest buckets back down.
  while (diff < 0) {
    const largest = counts.indexOf(Math.max(...counts))
    if (counts[largest] <= min) break
    counts[largest] -= 1
    diff += 1
  }
  return counts
}

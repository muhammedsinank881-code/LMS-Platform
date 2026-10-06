import { ApiError } from '@/services/api/errors'
import { getMockConfig } from './config'

/** Simulated network round trip (300-700ms by default, see `MockConfig`). */
export function delay(): Promise<void> {
  const { minLatencyMs, maxLatencyMs } = getMockConfig()
  const ms = minLatencyMs + Math.random() * Math.max(0, maxLatencyMs - minLatencyMs)
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** A data request: waits like a network call and fails randomly when `errorRate` is set. */
export async function simulateNetwork(): Promise<void> {
  await delay()
  if (Math.random() < getMockConfig().errorRate) {
    throw new ApiError('unknown', 'Simulated network error. Please try again.')
  }
}

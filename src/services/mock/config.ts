export interface MockConfig {
  /** Simulated round-trip bounds, in milliseconds. */
  minLatencyMs: number
  maxLatencyMs: number
  /** Probability (0 to 1) that any data request fails with a simulated network error. */
  errorRate: number
}

function envNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN
  return Number.isFinite(parsed) ? parsed : fallback
}

const config: MockConfig = {
  minLatencyMs: envNumber(import.meta.env.VITE_MOCK_LATENCY_MIN, 300),
  maxLatencyMs: envNumber(import.meta.env.VITE_MOCK_LATENCY_MAX, 700),
  errorRate: envNumber(import.meta.env.VITE_MOCK_ERROR_RATE, 0),
}

export function getMockConfig(): Readonly<MockConfig> {
  return config
}

/** Dev/test switch: `setMockConfig({ errorRate: 0.3 })` forces random failures. */
export function setMockConfig(patch: Partial<MockConfig>): void {
  Object.assign(config, patch)
}

let clock: (() => Date) | null = null

/** The mock backend's idea of "now". Tests pin it so date-based logic is deterministic. */
let offsetMs = 0

/** Dev-only simulated clock: moves "now" forward so delays and idle triggers can be tested. */
export function advanceMockClock(ms: number): void {
  offsetMs += ms
}

export function resetMockClock(): void {
  offsetMs = 0
}

export function getMockClockOffset(): number {
  return offsetMs
}

export function getMockNow(): Date {
  return clock ? clock() : new Date(Date.now() + offsetMs)
}

export function setMockClock(next: (() => Date) | null): void {
  clock = next
}

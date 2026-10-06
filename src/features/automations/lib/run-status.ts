import type { RunStatus } from '@/types'

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  running: 'Running',
  waiting: 'Waiting',
  succeeded: 'Succeeded',
  failed: 'Failed',
  skipped: 'Skipped',
  cancelled: 'Cancelled',
}

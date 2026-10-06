import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { mockControls } from '@/services'

/** Dev switches for the mock backend: forced failures, latency and reseeding. */
export function MockControlsPanel() {
  const queryClient = useQueryClient()
  // The mock hands out its live config object, so copy it for React to see changes.
  const [config, setConfig] = useState(() => ({ ...mockControls.getMockConfig() }))

  function update(patch: Partial<typeof config>) {
    mockControls.setMockConfig(patch)
    setConfig({ ...mockControls.getMockConfig() })
  }

  return (
    <fieldset>
      <legend>Mock backend</legend>
      <label>
        <input
          type="checkbox"
          checked={config.errorRate >= 1}
          onChange={(event) => update({ errorRate: event.target.checked ? 1 : 0 })}
        />{' '}
        Force every request to fail
      </label>{' '}
      <label>
        <input
          type="checkbox"
          checked={config.maxLatencyMs === 0}
          onChange={(event) =>
            update(
              event.target.checked
                ? { minLatencyMs: 0, maxLatencyMs: 0 }
                : { minLatencyMs: 300, maxLatencyMs: 700 },
            )
          }
        />{' '}
        No latency
      </label>{' '}
      <button
        type="button"
        onClick={() => {
          mockControls.resetMockDb()
          void queryClient.invalidateQueries()
        }}
      >
        Reseed database
      </button>{' '}
      <button type="button" onClick={() => void queryClient.invalidateQueries()}>
        Refetch everything
      </button>
      <div>
        latency {config.minLatencyMs}–{config.maxLatencyMs}ms, error rate {config.errorRate}
      </div>
    </fieldset>
  )
}

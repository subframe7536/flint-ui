import { CheckboxGroup } from '@src'
import { For } from 'solid-js'

export function OrientationIndicator() {
  const ITEMS = [
    { value: 'alpha', label: 'Alpha', description: 'Primary rollout channel' },
    { value: 'beta', label: 'Beta', description: 'Early access channel' },
    { value: 'stable', label: 'Stable', description: 'Production channel' },
  ]

  const INDICATORS = ['start', 'end', 'hidden'] as const

  return (
    <div class="gap-4 grid lg:grid-cols-3 sm:grid-cols-2">
      <For each={INDICATORS}>
        {(indicator) => (
          <div class="p-4 b-(1 border) rounded-lg space-y-2">
            <p class="text-xs text-muted-foreground">Indicator: {indicator}</p>
            <CheckboxGroup
              legend="Vertical"
              items={ITEMS}
              indicator={indicator}
              defaultValue={['beta']}
            />
            <CheckboxGroup
              legend="Horizontal"
              items={ITEMS}
              indicator={indicator}
              orientation="horizontal"
              defaultValue={['alpha']}
            />
          </div>
        )}
      </For>
    </div>
  )
}

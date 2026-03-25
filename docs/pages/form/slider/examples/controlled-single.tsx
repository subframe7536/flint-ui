import { Slider } from '@src'
import type { SliderT } from '@src'
import { createSignal } from 'solid-js'

export function ControlledSingle() {
  function formatSliderValue(value: SliderValue): string {
    if (Array.isArray(value)) {
      return value.join(' - ')
    }

    return String(value)
  }

  const [singleValue, setSingleValue] = createSignal<SliderValue>(32)

  const [singleCommit, setSingleCommit] = createSignal<SliderValue>(32)

  type SliderValue = SliderT.Value

  return (
    <div class="max-w-xl space-y-3">
      <Slider
        value={singleValue()}
        min={0}
        max={100}
        step={1}
        onValueChange={setSingleValue}
        onChange={setSingleCommit}
      />
      <p class="text-xs text-muted-foreground">Current value: {formatSliderValue(singleValue())}</p>
      <p class="text-xs text-muted-foreground">
        Last committed value: {formatSliderValue(singleCommit())}
      </p>
    </div>
  )
}

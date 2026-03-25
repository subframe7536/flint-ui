import { Slider } from '@src'
import { createSignal } from 'solid-js'

export function RangeSlider() {
  const [rangeValue, setRangeValue] = createSignal<number[]>([20, 75])

  return (
    <div class="max-w-xl space-y-3">
      <Slider
        value={rangeValue()}
        min={0}
        max={100}
        step={1}
        minStepsBetweenThumbs={10}
        onValueChange={(next) => {
          if (Array.isArray(next)) {
            setRangeValue(next)
          }
        }}
      />
      <p class="text-xs text-muted-foreground">
        Range: {rangeValue()[0]} - {rangeValue()[1]} ; Min steps between: 10
      </p>
    </div>
  )
}

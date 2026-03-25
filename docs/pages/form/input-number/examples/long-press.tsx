import { InputNumber } from '@src'
import { createSignal } from 'solid-js'

export function LongPress() {
  const [pressHoldValue, setPressHoldValue] = createSignal(12)

  return (
    <div class="max-w-xs space-y-2">
      <InputNumber
        value={pressHoldValue()}
        onRawValueChange={(v) => {
          if (Number.isFinite(v)) {
            setPressHoldValue(v)
          }
        }}
        minValue={0}
        maxValue={99}
        step={1}
        variant="subtle"
      />
      <p class="text-xs text-muted-foreground">
        Hold <span class="font-medium">+</span> or <span class="font-medium">−</span> to repeat.
        Current value: {pressHoldValue()}
      </p>
    </div>
  )
}

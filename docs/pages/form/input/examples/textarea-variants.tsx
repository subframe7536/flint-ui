import { Textarea } from '@src'
import { For } from 'solid-js'

export function TextareaVariants() {
  const VARIANTS = ['outline', 'subtle', 'ghost', 'none'] as const

  return (
    <div class="gap-3 grid lg:grid-cols-3 sm:grid-cols-2">
      <For each={VARIANTS}>{(variant) => <Textarea variant={variant} placeholder={variant} />}</For>
    </div>
  )
}

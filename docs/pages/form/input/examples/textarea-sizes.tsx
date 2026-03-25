import { Textarea } from '@src'
import { For } from 'solid-js'

export function TextareaSizes() {
  const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

  return (
    <div class="gap-3 grid lg:grid-cols-3 sm:grid-cols-2">
      <For each={SIZES}>
        {(size) => <Textarea size={size} placeholder={`Size: ${size}`} rows={2} />}
      </For>
    </div>
  )
}

import { Progress } from '@src'
import type { ProgressT } from '@src'
import { For } from 'solid-js'

type ProgressAnimation = Exclude<ProgressT.Variant['animation'], undefined>

export function Animations() {
  const ANIMATIONS: ProgressAnimation[] = ['carousel', 'reverse', 'swing', 'elastic']

  return (
    <div class="w-xl space-y-3">
      <For each={ANIMATIONS}>
        {(animation) => (
          <div class="flex items-center gap-3">
            <span class="w-16 font-mono text-xs text-muted-foreground">{animation}</span>
            <div class="flex-1">
              <Progress value={null} animation={animation} />
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

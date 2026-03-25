import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { ShikiCodeBlock } from './shiki-code-block'

export interface ExampleBlockProps {
  example: Component
  code?: string
}

export const ExampleBlock = (props: ExampleBlockProps) => {
  return (
    <section class="border border-border rounded-2xl bg-background shadow-sm overflow-hidden">
      <div class="p-6 flex items-center justify-center">
        <Dynamic component={props.example} />
      </div>
      <Show when={props.code}>
        <ShikiCodeBlock html={props.code} class="border-t border-border bg-muted/70" />
      </Show>
    </section>
  )
}

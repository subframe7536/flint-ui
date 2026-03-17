import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { Badge } from '../../src'

import { PropsTable } from './props-table'

// ── ComponentDocPage ───────────────────────────────────────────────────

interface ComponentMeta {
  name: string
  key: string
  sourcePath: string
  category: string
  description: string
  props: any[]
  variants: any[]
  slots: string[]
  polymorphic: boolean
}

export interface ComponentDocPageProps {
  meta: ComponentMeta
  children: JSX.Element
}

export const DemoPage = (props: ComponentDocPageProps) => (
  <main class="text-zinc-900 p-6 min-h-screen w-full from-stone-100 to-slate-100 via-zinc-50 bg-gradient-to-br sm:p-10">
    <div class="mx-auto flex flex-col gap-6 max-w-5xl">
      <header class="text-foreground p-6 sm:p-8">
        <div class="flex flex-wrap gap-2 items-center">
          <p class="text-sm text-zinc-700 tracking-[0.22em] uppercase">{props.meta.category}</p>
          <Show when={props.meta.polymorphic}>
            <Badge>Polymorphic</Badge>
          </Show>
        </div>
        <h1 class="text-2xl font-semibold mt-2 sm:text-3xl">{props.meta.name}</h1>
        <Show when={props.meta.description}>
          <p class="text-sm text-zinc-600 mt-2 max-w-2xl sm:text-base">{props.meta.description}</p>
        </Show>
        <p class="text-xs text-zinc-500 font-mono mt-3">{props.meta.sourcePath}</p>
      </header>

      {props.children}

      <Show when={props.meta.props.length > 0}>
        <section>
          <h2 class="text-sm text-zinc-600 tracking-[0.16em] font-semibold mb-4 uppercase">
            Props
          </h2>
          <PropsTable props={props.meta.props} />
        </section>
      </Show>

      <Show when={props.meta.slots.length > 0}>
        <section>
          <h2 class="text-sm text-zinc-600 tracking-[0.16em] font-semibold mb-3 uppercase">
            Slots
          </h2>
          <div class="flex flex-wrap gap-1.5">
            <For each={props.meta.slots}>
              {(slot) => <Badge classes={{ base: 'font-mono' }}>{slot}</Badge>}
            </For>
          </div>
        </section>
      </Show>
    </div>
  </main>
)

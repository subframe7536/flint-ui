import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { Badge } from '../../src'
import type { ItemsDoc } from '../vite-plugin/api-doc'

import { PropsTable } from './props-table'
import type { ComponentPropsDoc } from './props-table'

interface ComponentIndexEntry {
  name: string
  key: string
  category: string
  description?: string
  sourcePath?: string
  polymorphic: boolean
}

export interface ExamplePageApiDoc {
  component: ComponentIndexEntry
  slots: string[]
  props: ComponentPropsDoc
  items?: ItemsDoc
}

export interface ExamplePageProps {
  componentKey?: string
  apiDoc?: ExamplePageApiDoc
  extraApiDocs?: ExamplePageApiDoc[]
  children: JSX.Element
}

export const ExamplePage = (props: ExamplePageProps) => {
  const component = () => props.apiDoc?.component
  const propsDoc = () => props.apiDoc?.props ?? { own: [], inherited: [] }
  const itemsDoc = () => props.apiDoc?.items
  const slots = () => props.apiDoc?.slots ?? []
  const extraApiDocs = () => props.extraApiDocs ?? []

  const hasProps = (data: ComponentPropsDoc, items?: ItemsDoc) => {
    return data.own.length > 0 || data.inherited.length > 0 || Boolean(items)
  }

  const shouldShowHeader = () => Boolean(component() || props.componentKey)

  return (
    <main class="text-foreground p-4 min-h-screen w-full sm:p-8">
      <div class="mx-auto flex flex-col gap-8 max-w-4xl">
        <Show when={shouldShowHeader()}>
          <header class="text-foreground">
            <div class="flex flex-wrap gap-2 items-center">
              <Show when={component()?.category}>
                <p class="text-xs text-muted-foreground tracking-[0.16em] font-semibold uppercase">
                  {component()!.category}
                </p>
              </Show>
              <Show when={props.componentKey}>
                <p class="text-xs text-muted-foreground font-mono">{props.componentKey}</p>
              </Show>
              <Show when={component()?.polymorphic}>
                <span class="text-xs text-muted-foreground">•</span>
              </Show>
              <Show when={component()?.polymorphic}>
                <p class="text-xs text-muted-foreground font-medium">Polymorphic</p>
              </Show>
            </div>
            <Show when={component()?.name ?? props.componentKey}>
              <h1 class="text-2xl font-semibold mt-3 sm:text-3xl">
                {component()?.name ?? props.componentKey}
              </h1>
            </Show>
            <Show when={component()?.description}>
              <p class="text-sm text-muted-foreground mt-2 max-w-3xl sm:text-base">
                {component()!.description}
              </p>
            </Show>
            <Show when={component()?.sourcePath}>
              <p class="text-xs text-muted-foreground font-mono mt-3">{component()!.sourcePath}</p>
            </Show>
          </header>
        </Show>

        {props.children}

        <Show when={slots().length > 0}>
          <section>
            <h2 class="text-xs text-muted-foreground tracking-[0.16em] font-semibold mb-4 uppercase">
              Slots
            </h2>
            <div class="flex flex-wrap gap-2">
              <For each={slots()}>{(slot) => <Badge>{slot}</Badge>}</For>
            </div>
          </section>
        </Show>

        <Show when={hasProps(propsDoc(), itemsDoc())}>
          <section>
            <h2 class="text-xs text-muted-foreground tracking-[0.16em] font-semibold mb-4 uppercase">
              Props
            </h2>
            <PropsTable props={propsDoc()} items={itemsDoc()} />
          </section>
        </Show>

        <For each={extraApiDocs()}>
          {(doc) => (
            <>
              <section>
                <div class="mb-4 flex flex-wrap gap-2 items-center">
                  <h2 class="text-xs text-muted-foreground tracking-[0.16em] font-semibold uppercase">
                    {doc.component.name} API
                  </h2>
                  <p class="text-xs text-muted-foreground font-mono">{doc.component.key}</p>
                </div>
                <Show when={doc.component.description}>
                  <p class="text-sm text-muted-foreground max-w-3xl">{doc.component.description}</p>
                </Show>
                <Show when={doc.component.sourcePath}>
                  <p class="text-xs text-muted-foreground font-mono mt-2">
                    {doc.component.sourcePath}
                  </p>
                </Show>
              </section>

              <Show when={doc.slots.length > 0}>
                <section>
                  <h2 class="text-xs text-muted-foreground tracking-[0.16em] font-semibold mb-4 uppercase">
                    {doc.component.name} Slots
                  </h2>
                  <div class="flex flex-wrap gap-2">
                    <For each={doc.slots}>{(slot) => <Badge>{slot}</Badge>}</For>
                  </div>
                </section>
              </Show>

              <Show when={hasProps(doc.props, doc.items)}>
                <section>
                  <h2 class="text-xs text-muted-foreground tracking-[0.16em] font-semibold mb-4 uppercase">
                    {doc.component.name} Props
                  </h2>
                  <PropsTable props={doc.props} items={doc.items} />
                </section>
              </Show>
            </>
          )}
        </For>
      </div>
    </main>
  )
}

import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { docsWidgetMap } from '../widgets'

import { ExampleBlock } from './example-block'
import type { ExamplePageApiDoc } from './example-page'
import { ExamplePage } from './example-page'
import { MarkdownContent } from './markdown-content'

interface MarkdownRenderSegment {
  type: 'markdown'
  html: string
}

interface ExampleRenderSegment {
  type: 'example'
  component: Component
  code?: string
}

interface WidgetRenderSegment {
  type: 'widget'
  widgetName: string
  props?: Record<string, unknown>
}

type RenderSegment = MarkdownRenderSegment | ExampleRenderSegment | WidgetRenderSegment

export interface RenderExampleMarkdownPageInput {
  componentKey?: string
  apiDoc?: ExamplePageApiDoc
  extraApiDocs?: ExamplePageApiDoc[]
  segments: RenderSegment[]
}

export function renderExampleMarkdownPage(input: RenderExampleMarkdownPageInput) {
  return (
    <ExamplePage
      componentKey={input.componentKey}
      apiDoc={input.apiDoc}
      extraApiDocs={input.extraApiDocs}
    >
      <For each={input.segments}>
        {(segment) => (
          <>
            <Show when={segment.type === 'markdown'}>
              <MarkdownContent html={(segment as MarkdownRenderSegment).html} />
            </Show>
            <Show when={segment.type === 'example'}>
              <ExampleBlock
                example={(segment as ExampleRenderSegment).component}
                code={(segment as ExampleRenderSegment).code}
              />
            </Show>
            <Show when={segment.type === 'widget'}>
              {(() => {
                const widgetSegment = segment as WidgetRenderSegment
                const Widget = docsWidgetMap[widgetSegment.widgetName]
                return (
                  <Show
                    when={Widget}
                    fallback={
                      <div class="text-sm text-muted-foreground p-4 border border-border rounded-xl border-dashed">
                        Widget not found: {widgetSegment.widgetName}
                      </div>
                    }
                  >
                    <Dynamic component={Widget!} {...(widgetSegment.props ?? {})} />
                  </Show>
                )
              })()}
            </Show>
          </>
        )}
      </For>
    </ExamplePage>
  )
}

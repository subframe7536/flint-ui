import { createSignal } from 'solid-js'

import { Resizable } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

function formatSizes(sizes: number[]): string {
  return sizes.map((size) => `${Math.round(size * 100)}%`).join(' / ')
}

function createPanel(title: string, description: string, tone: string) {
  return (
    <div class={`p-4 h-full ${tone}`}>
      <p class="text-sm text-zinc-800 font-semibold">{title}</p>
      <p class="text-xs text-zinc-600 mt-1">{description}</p>
    </div>
  )
}

export const ResizableDemos = () => {
  const [sizes, setSizes] = createSignal<number[]>([0.35, 0.65])

  return (
    <DemoPage
      eyebrow="Rock UI Playground"
      title="Resizable"
      description="Panel splitter layout powered by panels array, with auto handles between panels."
    >
      <DemoSection
        title="Basic Horizontal"
        description="Two panels with auto-inserted handle and optional handle icon."
      >
        <div class="border border-zinc-200 rounded-xl h-52 overflow-hidden">
          <Resizable
            withHandle
            panels={[
              {
                initialSize: 0.4,
                minSize: 0.2,
                content: createPanel('Navigation', 'Left panel can shrink to 20%.', 'bg-zinc-100'),
              },
              {
                initialSize: 0.6,
                minSize: 0.3,
                content: createPanel(
                  'Content',
                  'Right panel keeps enough width for details.',
                  'bg-white',
                ),
              },
            ]}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="Controlled Sizes"
        description="Use sizes/onSizesChange to sync layout state externally."
      >
        <div class="space-y-3">
          <div class="border border-zinc-200 rounded-xl h-48 overflow-hidden">
            <Resizable
              sizes={sizes()}
              onSizesChange={setSizes}
              handleProps={{ withHandle: true }}
              panels={[
                {
                  minSize: 0.2,
                  content: createPanel(
                    'Logs',
                    'Drag handle to re-balance panel sizes.',
                    'bg-zinc-50',
                  ),
                },
                {
                  minSize: 0.25,
                  content: createPanel(
                    'Preview',
                    'Current ratio is live-updated below.',
                    'bg-zinc-100',
                  ),
                },
              ]}
            />
          </div>
          <p class="text-xs text-zinc-600">Current sizes: {formatSizes(sizes())}</p>
        </div>
      </DemoSection>

      <DemoSection
        title="Vertical + Per Panel Handle"
        description="Vertical orientation and selective handle insertion via panel.handle."
      >
        <div class="border border-zinc-200 rounded-xl h-72 overflow-hidden">
          <Resizable
            orientation="vertical"
            withHandle
            classes={{ handle: 'bg-zinc-300/80' }}
            panels={[
              {
                initialSize: 0.33,
                content: createPanel(
                  'Top',
                  'Default handle between top and middle.',
                  'bg-zinc-100',
                ),
              },
              {
                initialSize: 0.34,
                handle: false,
                content: createPanel(
                  'Middle',
                  'handle=false removes the divider after this panel.',
                  'bg-white',
                ),
              },
              {
                initialSize: 0.33,
                content: createPanel('Bottom', 'Last panel in vertical stack.', 'bg-zinc-50'),
              },
            ]}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="Nested Panels"
        description="Use startIntersection/endIntersection to control which crossed edge becomes draggable."
      >
        <div class="gap-4 grid md:grid-cols-2">
          <div class="space-y-2">
            <p class="text-xs text-zinc-600">
              <code>startIntersection: true</code> + <code>endIntersection: false</code>
            </p>
            <div class="border border-zinc-200 rounded-xl h-80 overflow-hidden">
              <Resizable
                withHandle
                classes={{ handle: 'bg-zinc-300/80' }}
                panels={[
                  {
                    initialSize: 0.32,
                    minSize: 0.2,
                    content: createPanel(
                      'Sidebar',
                      'Outer handle intersects the inner split on its start edge.',
                      'bg-zinc-100',
                    ),
                  },
                  {
                    initialSize: 0.68,
                    minSize: 0.35,
                    content: (
                      <Resizable
                        orientation="vertical"
                        withHandle
                        classes={{ handle: 'bg-zinc-400/80' }}
                        panels={[
                          {
                            minSize: 0.25,
                            handle: { startIntersection: true, endIntersection: false },
                            content: createPanel(
                              'Editor',
                              'Only the left cross target is active in this inner handle.',
                              'bg-zinc-50',
                            ),
                          },
                          {
                            minSize: 0.2,
                            content: createPanel(
                              'Console',
                              'Drag the visible cross target for dual-axis resizing.',
                              'bg-zinc-100',
                            ),
                          },
                        ]}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs text-zinc-600">
              <code>startIntersection: false</code> + <code>endIntersection: true</code>
            </p>
            <div class="border border-zinc-200 rounded-xl h-80 overflow-hidden">
              <Resizable
                withHandle
                classes={{ handle: 'bg-zinc-300/80' }}
                panels={[
                  {
                    initialSize: 0.68,
                    minSize: 0.35,
                    content: (
                      <Resizable
                        orientation="vertical"
                        withHandle
                        classes={{ handle: 'bg-zinc-400/80' }}
                        panels={[
                          {
                            minSize: 0.25,
                            handle: { startIntersection: false, endIntersection: true },
                            content: createPanel(
                              'Editor',
                              'Only the right cross target is active in this inner handle.',
                              'bg-zinc-50',
                            ),
                          },
                          {
                            minSize: 0.2,
                            content: createPanel(
                              'Console',
                              'This mirrors the first demo but keeps only end target.',
                              'bg-zinc-100',
                            ),
                          },
                        ]}
                      />
                    ),
                  },
                  {
                    initialSize: 0.32,
                    minSize: 0.2,
                    content: createPanel(
                      'Inspector',
                      'Move crossed target to resize both inner vertical and outer horizontal splits.',
                      'bg-zinc-100',
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </DemoSection>
    </DemoPage>
  )
}

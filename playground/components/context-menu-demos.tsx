import { createSignal } from 'solid-js'

import { ContextMenu } from '../../src'
import type { ContextMenuItems } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

export const ContextMenuDemos = () => {
  const [lastAction, setLastAction] = createSignal('None')
  const [pinned, setPinned] = createSignal(false)

  const items: ContextMenuItems = [
    [
      { type: 'label', label: 'Row Actions' },
      {
        label: 'Rename',
        icon: 'icon-pen',
        kbds: ['R'],
        onSelect: () => setLastAction('Rename'),
      },
      {
        label: 'Tag',
        icon: <span class="text-[10px] font-semibold">#</span>,
        kbds: ['T'],
        onSelect: () => setLastAction('Tag'),
      },
      { type: 'separator' },
      {
        type: 'checkbox',
        label: 'Pinned',
        onCheckedChange: (checked) => setPinned(checked),
      },
      {
        label: 'More',
        children: [
          { label: 'Duplicate', onSelect: () => setLastAction('Duplicate') },
          { label: 'Archive', onSelect: () => setLastAction('Archive') },
        ],
      },
    ],
  ]

  return (
    <DemoPage
      eyebrow="Rock UI Playground"
      title="Context Menu"
      description="Pointer-positioned menu opened by right click or context-menu gesture."
    >
      <DemoSection
        title="Right Click Area"
        description="Right click the card to open a contextual actions menu."
      >
        <ContextMenu
          items={items}
          // contentTop={({ sub }) => (
          //   <div class="text-xs text-muted-foreground">{sub ? 'Submenu' : 'Context'}</div>
          // )}
        >
          <div>
            <p class="text-sm font-medium">Right click this surface</p>
            <p class="text-xs text-zinc-500 mt-1">
              Supports submenu, checkbox items, icons, and shortcut labels.
            </p>
          </div>
        </ContextMenu>

        <div class="text-sm mt-3">
          <p>
            Last action: <span class="font-medium">{lastAction()}</span>
          </p>
          <p>
            Pinned: <span class="font-medium">{String(pinned())}</span>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="Custom Item Render"
        description="Use `itemRender` to customize item row appearance."
      >
        <ContextMenu
          items={[
            { label: 'Open' },
            { label: 'Inspect' },
            { label: 'Delete', color: 'destructive' },
          ]}
          itemRender={(ctx) => (
            <div class="flex w-full items-center justify-between">
              <span>{String(ctx.item.label ?? 'Item')}</span>
              <span class="text-xs text-muted-foreground">depth {ctx.depth}</span>
            </div>
          )}
        >
          <div>Right click this block for custom-rendered rows.</div>
        </ContextMenu>
      </DemoSection>
    </DemoPage>
  )
}

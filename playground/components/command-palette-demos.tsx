import { createSignal } from 'solid-js'

import { CommandPalette } from '../../src'
import type { CommandPaletteGroup } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

const BASIC_GROUPS: CommandPaletteGroup[] = [
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { label: 'New File', icon: 'i-lucide-file-plus', kbds: ['⌘', 'N'] },
      { label: 'Open File', icon: 'i-lucide-folder-open', kbds: ['⌘', 'O'] },
      { label: 'Save', icon: 'i-lucide-save', kbds: ['⌘', 'S'] },
      {
        label: 'Export as PDF',
        icon: 'i-lucide-file-text',
        description: 'Export current document to PDF',
      },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: [
      { label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
      { label: 'Settings', icon: 'i-lucide-settings', suffix: 'Preferences' },
      { label: 'Profile', icon: 'i-lucide-user', disabled: true },
    ],
  },
]

const SUB_NAV_GROUPS: CommandPaletteGroup[] = [
  {
    id: 'main',
    label: 'Commands',
    items: [
      {
        label: 'Create',
        icon: 'i-lucide-plus-circle',
        description: 'Create new resources',
        children: [
          { label: 'New File', icon: 'i-lucide-file-plus' },
          { label: 'New Folder', icon: 'i-lucide-folder-plus' },
          { label: 'New Project', icon: 'i-lucide-git-branch' },
        ],
      },
      {
        label: 'Share',
        icon: 'i-lucide-share-2',
        description: 'Share with others',
        children: [
          { label: 'Copy Link', icon: 'i-lucide-link', kbds: ['⌘', 'L'] },
          { label: 'Send via Email', icon: 'i-lucide-mail' },
        ],
      },
      { label: 'Delete', icon: 'i-lucide-trash-2' },
    ],
  },
]

export function CommandPaletteDemos() {
  const [closeCount, setCloseCount] = createSignal(0)

  return (
    <DemoPage
      eyebrow="Rock UI Playground"
      title="Command Palette"
      description="An inline, searchable command palette built on Kobalte Combobox."
    >
      <DemoSection title="Basic" description="Groups of items with icons, kbds, and descriptions.">
        <div class="border rounded-lg max-w-lg shadow-lg overflow-hidden">
          <CommandPalette groups={BASIC_GROUPS} />
        </div>
      </DemoSection>

      <DemoSection
        title="Sub-navigation"
        description="Items with children drill into a sub-group. Press Backspace or the back button to return."
      >
        <div class="border rounded-lg max-w-lg shadow-lg overflow-hidden">
          <CommandPalette groups={SUB_NAV_GROUPS} />
        </div>
      </DemoSection>

      <DemoSection
        title="With Close Button"
        description="A close button in the input trailing slot."
      >
        <div class="border rounded-lg max-w-lg shadow-lg overflow-hidden">
          <CommandPalette groups={BASIC_GROUPS} close onClose={() => setCloseCount((c) => c + 1)} />
        </div>
        <p class="text-sm text-muted-foreground mt-2">Close clicked: {closeCount()} time(s)</p>
      </DemoSection>

      <DemoSection title="Size: lg" description="Larger input and item sizing.">
        <div class="border rounded-lg max-w-lg shadow-lg overflow-hidden">
          <CommandPalette groups={BASIC_GROUPS} size="lg" />
        </div>
      </DemoSection>

      <DemoSection title="Size: xs" description="Compact sizing.">
        <div class="border rounded-lg max-w-lg shadow-lg overflow-hidden">
          <CommandPalette groups={BASIC_GROUPS} size="xs" />
        </div>
      </DemoSection>

      <DemoSection title="Empty state" description="No groups provided.">
        <div class="border rounded-lg max-w-lg shadow-lg overflow-hidden">
          <CommandPalette groups={[]} />
        </div>
      </DemoSection>
    </DemoPage>
  )
}

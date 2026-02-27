import { For } from 'solid-js'

import { Kbd } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const VARIANTS = ['outline', 'default', 'invert'] as const

export const KbdDemos = () => (
  <DemoPage
    eyebrow="Rock UI Playground"
    title="Kbd"
    description="Keyboard key styling for shortcuts and command hints."
  >
    <DemoSection title="Sizes" description="Keycap sizes from xs to xl.">
      <div class="flex flex-wrap gap-3 items-center">
        <For each={SIZES}>{(size) => <Kbd size={size} value={[size.toUpperCase()]} />}</For>
      </div>
    </DemoSection>

    <DemoSection title="Variants" description="Outline, default, and invert visual modes.">
      <div class="flex flex-wrap gap-3 items-center">
        <For each={VARIANTS}>{(variant) => <Kbd variant={variant} value={[variant]} />}</For>
      </div>
    </DemoSection>

    <DemoSection title="Shortcut Composition" description="Inline command palette hints.">
      <p class="text-sm text-zinc-700 flex flex-wrap gap-2 items-center">
        Open command palette
        <Kbd value={['Ctrl']} />
        <span>+</span>
        <Kbd value={['K']} />
      </p>
    </DemoSection>
  </DemoPage>
)

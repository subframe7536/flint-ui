import { createSignal } from 'solid-js'

import { NavigationMenu } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

export const NavigationMenuDemos = () => {
  const [horizontalValue, setHorizontalValue] = createSignal<string | string[] | undefined>('docs')

  return (
    <DemoPage
      eyebrow="Rock UI Playground"
      title="Navigation Menu"
      description="Primary navigation patterns for horizontal and vertical layouts."
    >
      <DemoSection
        title="Horizontal"
        description="Desktop-style top navigation with trigger content and indicator."
      >
        <div class="p-4 border border-zinc-200 rounded-xl bg-white">
          <NavigationMenu
            arrow
            value={horizontalValue() as string}
            onValueChange={setHorizontalValue}
            items={[
              {
                label: 'Docs',
                value: 'docs',
                children: [
                  {
                    label: 'Guides',
                    description: 'Step-by-step documentation',
                    href: '#',
                  },
                  {
                    label: 'API Reference',
                    description: 'Component and prop references',
                    href: '#',
                  },
                ],
              },
              {
                label: 'Blog',
                value: 'blog',
                href: '#',
              },
              {
                label: 'Releases',
                value: 'releases',
                children: [{ label: 'Changelog', href: '#' }],
              },
            ]}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="Vertical Collapsed"
        description="Sidebar pattern with icon-only collapsed links, tooltip, and popover."
      >
        <div class="p-3 border border-zinc-200 rounded-xl bg-white max-w-sm">
          <NavigationMenu
            orientation="vertical"
            collapsed
            tooltip
            popover
            items={[
              {
                label: 'Projects',
                icon: 'icon-folder',
                children: [
                  { label: 'Alpha', href: '#' },
                  { label: 'Bravo', href: '#' },
                ],
              },
              {
                label: 'Settings',
                icon: 'icon-settings',
                children: [
                  { label: 'Profile', href: '#' },
                  { label: 'Members', href: '#' },
                ],
              },
            ]}
          />
        </div>
      </DemoSection>
    </DemoPage>
  )
}

import { Breadcrumb } from '@src'

export function Size() {
  return (
    <>
      <Breadcrumb
        size="sm"
        items={[
          { label: 'Workspace', href: '#', icon: 'i-lucide:briefcase' },
          { label: 'Settings', href: '#', icon: 'i-lucide:settings' },
          { label: 'Danger Zone', href: '#', disabled: true, icon: 'i-lucide:triangle-alert' },
        ]}
      />
      <Breadcrumb
        size="lg"
        items={[
          { label: 'Workspace', href: '#', icon: 'i-lucide:briefcase' },
          { label: 'Settings', href: '#', icon: 'i-lucide:settings' },
          { label: 'Danger Zone', href: '#', disabled: true, icon: 'i-lucide:triangle-alert' },
        ]}
      />
    </>
  )
}

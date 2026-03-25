import { Collapsible } from '@src'

export function Uncontrolled() {
  return (
    <Collapsible
      defaultOpen={false}
      classes={{
        root: 'w-xl rounded-lg b-(1 border) bg-muted',
        trigger: 'w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between',
        content: 'px-4 pb-4 text-sm text-foreground',
      }}
      trigger={(props) => (
        <>
          <span>Release notes</span>
          <span
            class={`text-muted-foreground transition-transform ${props.open ? 'rotate-180' : ''}`}
          >
            <span class="i-lucide-chevron-down" />
          </span>
        </>
      )}
    >
      <p>Version 0.1 includes Tabs, Pagination, Breadcrumb, and Form primitives.</p>
    </Collapsible>
  )
}

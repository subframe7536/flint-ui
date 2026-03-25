import { Collapsible } from '@src'
import { createSignal } from 'solid-js'

export function DisabledForceMount() {
  const [quickPanelOpen, setQuickPanelOpen] = createSignal(false)

  return (
    <div class="gap-3 grid lg:grid-cols-2">
      <Collapsible
        disabled
        defaultOpen
        classes={{
          root: 'rounded-lg b-(1 border)',
          trigger:
            'w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between data-disabled:opacity-60',
          content: 'px-4 pb-4 text-sm text-foreground',
        }}
        trigger={({ open: isOpen }) => (
          <>
            <span>Disabled panel</span>
            <span
              class={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <span class="i-lucide-chevron-down" />
            </span>
          </>
        )}
      >
        <p>Trigger is disabled, content keeps current state.</p>
      </Collapsible>

      <Collapsible
        forceMount
        open={quickPanelOpen()}
        onOpenChange={setQuickPanelOpen}
        classes={{
          root: 'rounded-lg b-(1 border)',
          trigger:
            'w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between',
          content: 'px-4 pb-4 text-sm text-foreground',
        }}
        trigger={({ open: isOpen }) => (
          <>
            <span>Force-mount panel</span>
            <span
              class={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <span class="i-lucide-chevron-down" />
            </span>
          </>
        )}
      >
        <p>Content DOM stays mounted even when closed.</p>
      </Collapsible>
    </div>
  )
}

import { Button, Collapsible } from '@src'
import { createSignal } from 'solid-js'

export function Controlled() {
  const [open, setOpen] = createSignal(true)

  return (
    <div class="max-w-xl space-y-3">
      <div class="flex gap-2">
        <Button onClick={() => setOpen((value) => !value)}>Toggle controlled panel</Button>
      </div>

      <Collapsible
        open={open()}
        onOpenChange={setOpen}
        classes={{
          root: 'rounded-lg b-(1 border)',
          trigger:
            'w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between hover:bg-muted',
          content: 'px-4 pb-4 text-sm text-foreground',
        }}
        trigger={({ open: isOpen }) => (
          <>
            <span>Controlled state panel</span>
            <span
              class={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <span class="i-lucide-chevron-down" />
            </span>
          </>
        )}
      >
        <p>Current state: {open() ? 'open' : 'closed'}</p>
      </Collapsible>
    </div>
  )
}

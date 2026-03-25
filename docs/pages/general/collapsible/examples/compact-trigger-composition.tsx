import { Collapsible } from '@src'

export function CompactTriggerComposition() {
  return (
    <div class="max-w-xl space-y-2">
      <Collapsible
        defaultOpen
        classes={{
          root: 'rounded-lg b-(1 border)',
          trigger:
            'w-xl px-3 py-2 text-left text-xs font-semibold tracking-wide flex items-center justify-between',
          content: 'px-3 pb-3 text-sm text-foreground',
        }}
        trigger={({ open: isOpen }) => (
          <>
            <span class="text-muted-foreground uppercase">Quick panel</span>
            <span
              class={`rounded bg-muted inline-flex size-5 transition-transform items-center justify-center ${isOpen ? 'rotate-180' : ''}`}
            >
              <span class="i-lucide-chevron-down text-xs text-muted-foreground" />
            </span>
          </>
        )}
      >
        <p>Small trigger footprint for navigation and side content.</p>
      </Collapsible>
    </div>
  )
}

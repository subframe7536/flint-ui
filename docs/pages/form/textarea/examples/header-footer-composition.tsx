import { Textarea } from '@src'
import { createSignal } from 'solid-js'

export function HeaderFooterComposition() {
  const [composerValue, setComposerValue] = createSignal('Ship docs refresh this week.')

  return (
    <div class="gap-3 grid lg:grid-cols-2">
      <Textarea
        placeholder="Ask, search or chat..."
        header={
          <>
            <span class="font-semibold">Info text</span>
            <span class="i-lucide-info text-base ms-auto" />
          </>
        }
        classes={{
          header: 'b-(b border)',
          input: 'min-h-24',
        }}
      />

      <Textarea
        value={composerValue()}
        onValueChange={(next) => setComposerValue(String(next ?? ''))}
        placeholder="Write your message..."
        autoresize
        footer={
          <>
            <span>{composerValue().length}/280 characters</span>
            <button
              type="button"
              class="text-xs text-primary-foreground ms-auto px-2 py-1 rounded-md bg-primary"
            >
              Send
            </button>
          </>
        }
        classes={{
          footer: 'b-(t border)',
          input: 'min-h-24',
        }}
      />
    </div>
  )
}

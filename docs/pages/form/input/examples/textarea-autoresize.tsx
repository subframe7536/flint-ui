import { Textarea } from '@src'
import { createSignal } from 'solid-js'

export function TextareaAutoresize() {
  const [textareaValue, setTextareaValue] = createSignal('Type here to see autoresize...')

  return (
    <div class="max-w-md space-y-2">
      <Textarea
        autoresize
        maxrows={6}
        value={textareaValue()}
        onValueChange={setTextareaValue}
        placeholder="Start typing..."
      />
      <p class="text-xs text-muted-foreground">Characters: {textareaValue().length}</p>
    </div>
  )
}

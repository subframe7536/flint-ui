import { Avatar } from '@src'

export function FallbackModes() {
  return (
    <div class="flex flex-wrap gap-3 items-center">
      <Avatar items={[{ text: 'FL' }]} />
      <Avatar items={[{ alt: 'Flint UI Team' }]} />
      <Avatar items={[{ fallback: 'i-lucide-user' }]} />
    </div>
  )
}

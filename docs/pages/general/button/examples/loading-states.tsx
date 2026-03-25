import { Button } from '@src/elements/button/button'
import { createSignal } from 'solid-js'

export function LoadingStates() {
  const [manualLoading, setManualLoading] = createSignal(false)
  const [autoRuns, setAutoRuns] = createSignal(0)

  const runManualLoading = async () => {
    setManualLoading(true)
    await wait(1000)
    setManualLoading(false)
  }

  const onClickWait = async () => {
    await wait(2000)
    setAutoRuns((value) => value + 1)
  }

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms)
    })

  return (
    <div class="flex flex-wrap gap-3 items-center">
      <Button
        loading={manualLoading()}
        onclick={runManualLoading}
        leading={<div class="i-lucide:loader-circle animate-loading" />}
      >
        {manualLoading() ? 'Processing...' : 'Manual loading'}
      </Button>

      <Button
        loadingAuto
        variant="outline"
        leading="i-lucide:a-arrow-up"
        trailing="i-lucide:timer"
        onClick={onClickWait}
      >
        Async auto-loading ({autoRuns()})
      </Button>

      <Button disabled variant="ghost">
        Disabled
      </Button>
    </div>
  )
}

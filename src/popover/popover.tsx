import * as KobalteHoverCard from '@kobalte/core/hover-card'
import * as KobaltePopover from '@kobalte/core/popover'
import type { PopoverContentProps as KobaltePopoverContentProps } from '@kobalte/core/popover'
import type { JSX } from 'solid-js'
import { Show, children, mergeProps, onCleanup, splitProps } from 'solid-js'

import { cn } from '../shared/utils'

import { popoverContentVariants } from './popover.class'

type PopoverMode = 'click' | 'hover'
type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'

export interface PopoverClasses {
  trigger?: string
  content?: string
  body?: string
  arrow?: string
}

export interface PopoverBaseProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  mode?: PopoverMode
  placement?: PopoverPlacement
  gutter?: number
  openDelay?: number
  closeDelay?: number
  content?: JSX.Element
  arrow?: boolean
  dismissible?: boolean
  classes?: PopoverClasses
  onClosePrevent?: () => void
  children?: JSX.Element
}

export type PopoverProps = PopoverBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof PopoverBaseProps | 'children' | 'class'>

function resolvePopoverSide(placement?: PopoverPlacement): PopoverSide {
  if (placement?.startsWith('right')) {
    return 'right'
  }

  if (placement?.startsWith('bottom')) {
    return 'bottom'
  }

  if (placement?.startsWith('left')) {
    return 'left'
  }

  return 'top'
}

export function Popover(props: PopoverProps): JSX.Element {
  const merged = mergeProps(
    {
      mode: 'click' as const,
      placement: 'bottom' as const,
      gutter: 8,
      openDelay: 0,
      closeDelay: 0,
      dismissible: true,
    },
    props,
  ) as PopoverProps
  const [local, rest] = splitProps(merged, [
    'mode',
    'placement',
    'content',
    'arrow',
    'dismissible',
    'classes',
    'onClosePrevent',
    'children',
  ])

  const triggerChildren = children(() => local.children)
  const hasTrigger = () => triggerChildren.toArray().length > 0

  const preventDismiss = () => {
    local.onClosePrevent?.()
  }

  let hasPreventedPointerAttempt = false
  let resetPreventedPointerAttemptTimeout: ReturnType<typeof setTimeout> | undefined

  const schedulePreventedPointerAttemptReset = () => {
    if (resetPreventedPointerAttemptTimeout !== undefined) {
      clearTimeout(resetPreventedPointerAttemptTimeout)
    }

    resetPreventedPointerAttemptTimeout = setTimeout(() => {
      hasPreventedPointerAttempt = false
      resetPreventedPointerAttemptTimeout = undefined
    }, 0)
  }

  onCleanup(() => {
    if (resetPreventedPointerAttemptTimeout !== undefined) {
      clearTimeout(resetPreventedPointerAttemptTimeout)
    }
  })

  const onPointerDownOutside = (
    event: Parameters<NonNullable<KobaltePopoverContentProps['onPointerDownOutside']>>[0],
  ) => {
    if (local.dismissible) {
      return
    }

    event.preventDefault()
    hasPreventedPointerAttempt = true
    schedulePreventedPointerAttemptReset()
    preventDismiss()
  }

  const onInteractOutside = (
    event: Parameters<NonNullable<KobaltePopoverContentProps['onInteractOutside']>>[0],
  ) => {
    if (local.dismissible) {
      return
    }

    if (event.defaultPrevented) {
      return
    }

    if (hasPreventedPointerAttempt) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    preventDismiss()
  }

  const onEscapeKeyDown = (
    event: Parameters<NonNullable<KobaltePopoverContentProps['onEscapeKeyDown']>>[0],
  ) => {
    if (local.dismissible) {
      return
    }

    event.preventDefault()
    preventDismiss()
  }

  const arrowClass = () => {
    return local.classes?.arrow
  }

  const side = () => resolvePopoverSide(local.placement)

  const content = () => {
    if (local.content === undefined || local.content === null) {
      return undefined
    }

    return (
      <div
        data-slot="body"
        class={cn('max-h-$kb-popper-content-available-height overflow-auto', local.classes?.body)}
      >
        {local.content}
      </div>
    )
  }

  const clickContent = () => (
    <KobaltePopover.Content
      data-slot="content"
      class={popoverContentVariants({ side: side() }, local.classes?.content)}
      onPointerDownOutside={onPointerDownOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      {content()}

      <Show when={local.arrow}>
        <KobaltePopover.Arrow data-slot="arrow" class={arrowClass()} />
      </Show>
    </KobaltePopover.Content>
  )

  const hoverContent = () => (
    <KobalteHoverCard.Content
      data-slot="content"
      class={popoverContentVariants({ side: side() }, local.classes?.content)}
    >
      {content()}

      <Show when={local.arrow}>
        <KobalteHoverCard.Arrow data-slot="arrow" class={arrowClass()} />
      </Show>
    </KobalteHoverCard.Content>
  )

  const hoverRoot = () => (
    <KobalteHoverCard.Root placement={local.placement} overflowPadding={-8} {...rest}>
      <Show when={hasTrigger()}>
        <KobalteHoverCard.Trigger as="span" data-slot="trigger" class={local.classes?.trigger}>
          {triggerChildren()}
        </KobalteHoverCard.Trigger>
      </Show>

      <KobalteHoverCard.Portal>{hoverContent()}</KobalteHoverCard.Portal>
    </KobalteHoverCard.Root>
  )

  const clickRoot = () => (
    <KobaltePopover.Root placement={local.placement} overflowPadding={-8} {...rest}>
      <Show when={hasTrigger()}>
        <KobaltePopover.Trigger as="span" data-slot="trigger" class={local.classes?.trigger}>
          {triggerChildren()}
        </KobaltePopover.Trigger>
      </Show>

      <KobaltePopover.Portal>{clickContent()}</KobaltePopover.Portal>
    </KobaltePopover.Root>
  )

  return (
    <Show when={local.mode === 'hover'} fallback={clickRoot()}>
      {hoverRoot()}
    </Show>
  )
}

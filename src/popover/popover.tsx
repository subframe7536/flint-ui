import * as KobalteHoverCard from '@kobalte/core/hover-card'
import * as KobaltePopover from '@kobalte/core/popover'
import type { PopoverContentProps as KobaltePopoverContentProps } from '@kobalte/core/popover'
import type { JSX } from 'solid-js'
import { Show, mergeProps, onCleanup, splitProps } from 'solid-js'

import { cn } from '../shared/utils'

import { popoverContentVariants } from './popover.class'

type PopoverMode = 'click' | 'hover'
type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
type PopoverPlacement = NonNullable<
  KobaltePopover.PopoverRootProps['placement'] | KobalteHoverCard.HoverCardRootProps['placement']
>

export interface PopoverClasses {
  trigger?: string
  content?: string
  body?: string
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
  dismissible?: boolean
  classes?: PopoverClasses
  onClosePrevent?: () => void
  children: JSX.Element
}

type PopoverRootProps = Omit<KobaltePopover.PopoverRootProps, 'children' | 'class'> &
  Omit<KobalteHoverCard.HoverCardRootProps, 'children' | 'class'>

export type PopoverProps = PopoverBaseProps & Omit<PopoverRootProps, keyof PopoverBaseProps>

function resolvePopoverSide(placement: PopoverPlacement | undefined): PopoverSide {
  if (!placement) {
    return 'bottom'
  }

  const [side] = placement.split('-')
  if (side === 'top' || side === 'right' || side === 'bottom' || side === 'left') {
    return side
  }

  return 'bottom'
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
  const [behaviorProps, contentProps, rootProps] = splitProps(
    merged,
    ['mode', 'placement', 'dismissible', 'onClosePrevent'],
    ['content', 'classes', 'children'],
  )

  const preventDismiss = () => {
    behaviorProps.onClosePrevent?.()
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
    if (behaviorProps.dismissible) {
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
    if (behaviorProps.dismissible || event.defaultPrevented) {
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
    if (behaviorProps.dismissible) {
      return
    }

    event.preventDefault()
    preventDismiss()
  }

  const content = () => {
    if (contentProps.content === undefined || contentProps.content === null) {
      return undefined
    }

    return (
      <div
        data-slot="body"
        class={cn(
          'max-h-$kb-popper-content-available-height overflow-auto',
          contentProps.classes?.body,
        )}
      >
        {contentProps.content}
      </div>
    )
  }

  const clickContent = () => (
    <KobaltePopover.Content
      data-slot="content"
      class={popoverContentVariants(
        { side: resolvePopoverSide(behaviorProps.placement) },
        contentProps.classes?.content,
      )}
      onPointerDownOutside={onPointerDownOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      {content()}
    </KobaltePopover.Content>
  )

  const hoverContent = () => (
    <KobalteHoverCard.Content
      data-slot="content"
      class={popoverContentVariants(
        { side: resolvePopoverSide(behaviorProps.placement) },
        contentProps.classes?.content,
      )}
    >
      {content()}
    </KobalteHoverCard.Content>
  )

  const hoverRoot = () => (
    <KobalteHoverCard.Root placement={behaviorProps.placement} overflowPadding={-4} {...rootProps}>
      <KobalteHoverCard.Trigger as="span" data-slot="trigger" class={contentProps.classes?.trigger}>
        {contentProps.children}
      </KobalteHoverCard.Trigger>

      <KobalteHoverCard.Portal>{hoverContent()}</KobalteHoverCard.Portal>
    </KobalteHoverCard.Root>
  )

  const clickRoot = () => (
    <KobaltePopover.Root placement={behaviorProps.placement} overflowPadding={-4} {...rootProps}>
      <KobaltePopover.Trigger as="span" data-slot="trigger" class={contentProps.classes?.trigger}>
        {contentProps.children}
      </KobaltePopover.Trigger>

      <KobaltePopover.Portal>{clickContent()}</KobaltePopover.Portal>
    </KobaltePopover.Root>
  )

  return (
    <Show when={behaviorProps.mode === 'hover'} fallback={clickRoot()}>
      {hoverRoot()}
    </Show>
  )
}

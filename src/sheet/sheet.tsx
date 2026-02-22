import * as KobalteDialog from '@kobalte/core/dialog'
import type { DialogContentProps as KobalteDialogContentProps } from '@kobalte/core/dialog'
import type { JSX } from 'solid-js'
import { Show, children, mergeProps, onCleanup, splitProps } from 'solid-js'

import { Icon } from '../icon'
import { cn } from '../shared/utils'

import { sheetContentVariants } from './sheet.class'

type SheetSide = 'left' | 'right' | 'top' | 'bottom'

export interface SheetClasses {
  trigger?: string
  overlay?: string
  content?: string
  header?: string
  wrapper?: string
  title?: string
  description?: string
  actions?: string
  close?: string
  body?: string
  footer?: string
}

export interface SheetBaseProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title?: JSX.Element
  description?: JSX.Element
  overlay?: boolean
  transition?: boolean
  side?: SheetSide
  inset?: boolean
  close?: boolean | JSX.Element
  dismissible?: boolean
  onClosePrevent?: () => void
  header?: JSX.Element
  body?: JSX.Element
  footer?: JSX.Element
  actions?: JSX.Element
  classes?: SheetClasses
  children?: JSX.Element
}

export type SheetProps = SheetBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof SheetBaseProps | 'children' | 'class'>

export function Sheet(props: SheetProps): JSX.Element {
  const merged = mergeProps(
    {
      overlay: true,
      transition: true,
      side: 'right' as const,
      inset: false,
      close: true,
      dismissible: true,
    },
    props,
  ) as SheetProps
  const [local, rest] = splitProps(merged, [
    'id',
    'open',
    'defaultOpen',
    'onOpenChange',
    'title',
    'description',
    'overlay',
    'transition',
    'side',
    'inset',
    'close',
    'dismissible',
    'onClosePrevent',
    'header',
    'body',
    'footer',
    'actions',
    'classes',
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
    event: Parameters<NonNullable<KobalteDialogContentProps['onPointerDownOutside']>>[0],
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
    event: Parameters<NonNullable<KobalteDialogContentProps['onInteractOutside']>>[0],
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
    event: Parameters<NonNullable<KobalteDialogContentProps['onEscapeKeyDown']>>[0],
  ) => {
    if (local.dismissible) {
      return
    }

    event.preventDefault()
    preventDismiss()
  }

  const hasDefaultHeader = () =>
    Boolean(local.title || local.description || local.actions || local.close)

  const computedContentClass = () => {
    const transitionClass = local.transition
      ? ''
      : 'transition-none data-expanded:animate-none data-closed:animate-none'

    return sheetContentVariants(
      {
        side: local.side,
        inset: local.inset,
      },
      transitionClass,
      local.classes?.content,
    )
  }

  const content = () => (
    <KobalteDialog.Content
      data-slot="content"
      data-side={local.side}
      class={computedContentClass()}
      onPointerDownOutside={onPointerDownOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      <Show when={local.header || hasDefaultHeader()}>
        <div
          data-slot="header"
          class={cn('relative flex flex-col gap-0.5 p-4 pe-12', local.classes?.header)}
        >
          <Show
            when={local.header}
            fallback={
              <>
                <div data-slot="wrapper" class={cn('grid gap-0.5', local.classes?.wrapper)}>
                  <Show when={local.title}>
                    <KobalteDialog.Title
                      data-slot="title"
                      class={cn('text-foreground text-base font-medium', local.classes?.title)}
                    >
                      {local.title}
                    </KobalteDialog.Title>
                  </Show>

                  <Show when={local.description}>
                    <KobalteDialog.Description
                      data-slot="description"
                      class={cn('text-muted-foreground text-sm', local.classes?.description)}
                    >
                      {local.description}
                    </KobalteDialog.Description>
                  </Show>
                </div>

                <Show when={local.actions}>
                  <div
                    data-slot="actions"
                    class={cn('inline-flex items-center gap-2', local.classes?.actions)}
                  >
                    {local.actions}
                  </div>
                </Show>

                <Show when={local.close !== false}>
                  <KobalteDialog.CloseButton
                    data-slot="close"
                    class={cn(
                      'absolute top-3 right-3 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:(bg-accent text-accent-foreground) effect-fv',
                      local.classes?.close,
                    )}
                    aria-label="Close"
                  >
                    <Show when={local.close !== true} fallback={<Icon name="icon-close" />}>
                      {local.close as JSX.Element}
                    </Show>
                  </KobalteDialog.CloseButton>
                </Show>
              </>
            }
          >
            {local.header}
          </Show>
        </div>
      </Show>

      <Show when={local.body}>
        <div
          data-slot="body"
          class={cn(
            'flex-1 overflow-auto',
            local.header || hasDefaultHeader() ? 'px-4 pb-4 pt-0' : 'p-4',
            local.classes?.body,
          )}
        >
          {local.body}
        </div>
      </Show>

      <Show when={local.footer}>
        <div
          data-slot="footer"
          class={cn('mt-auto flex flex-col gap-2 p-4', local.classes?.footer)}
        >
          {local.footer}
        </div>
      </Show>
    </KobalteDialog.Content>
  )

  const layer = () => (
    <>
      <Show when={local.overlay}>
        <KobalteDialog.Overlay
          data-slot="overlay"
          class={cn(
            'fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-expanded:(animate-in fade-in-0) data-closed:(animate-out fade-out-0) data-ending-style:opacity-0 data-starting-style:opacity-0 duration-100',
            local.classes?.overlay,
          )}
        />
      </Show>

      {content()}
    </>
  )

  return (
    <KobalteDialog.Root
      id={local.id}
      open={local.open}
      defaultOpen={local.defaultOpen}
      onOpenChange={local.onOpenChange}
      modal
      {...rest}
    >
      <Show when={hasTrigger()}>
        <KobalteDialog.Trigger as="span" data-slot="trigger" class={local.classes?.trigger}>
          {triggerChildren()}
        </KobalteDialog.Trigger>
      </Show>

      <KobalteDialog.Portal>{layer()}</KobalteDialog.Portal>
    </KobalteDialog.Root>
  )
}

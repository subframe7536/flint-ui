import * as KobalteDialog from '@kobalte/core/dialog'
import type { DialogContentProps as KobalteDialogContentProps } from '@kobalte/core/dialog'
import type { JSX } from 'solid-js'
import { Show, children, mergeProps, onCleanup, splitProps } from 'solid-js'

import { Icon } from '../icon'
import { cn } from '../shared/utils'

import { modalContentVariants, modalOverlayVariants } from './modal.class'

export interface ModalClasses {
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

export interface ModalBaseProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title?: JSX.Element
  description?: JSX.Element
  overlay?: boolean
  scrollable?: boolean
  transition?: boolean
  fullscreen?: boolean
  close?: boolean | JSX.Element
  dismissible?: boolean
  onClosePrevent?: () => void
  header?: JSX.Element
  body?: JSX.Element
  footer?: JSX.Element
  actions?: JSX.Element
  classes?: ModalClasses
  children?: JSX.Element
}

export type ModalProps = ModalBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof ModalBaseProps | 'children' | 'class'>

export function Modal(props: ModalProps): JSX.Element {
  const merged = mergeProps(
    {
      overlay: true,
      transition: true,
      close: true,
      dismissible: true,
    },
    props,
  ) as ModalProps
  const [local, rest] = splitProps(merged, [
    'id',
    'open',
    'defaultOpen',
    'onOpenChange',
    'title',
    'description',
    'overlay',
    'scrollable',
    'transition',
    'fullscreen',
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

  const contentLayout = () => {
    if (local.fullscreen) {
      return 'fullscreen'
    }

    if (local.scrollable) {
      return 'scrollable'
    }

    return 'default'
  }

  const content = () => (
    <KobalteDialog.Content
      data-slot="content"
      class={modalContentVariants(
        {
          layout: contentLayout(),
          transition: local.transition,
        },
        local.classes?.content,
      )}
      onPointerDownOutside={onPointerDownOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      <Show when={local.header || hasDefaultHeader()}>
        <div data-slot="header" class={cn('relative flex flex-col gap-2 p-4 pe-12', local.classes?.header)}>
          <Show
            when={local.header}
            fallback={
              <>
                <div data-slot="wrapper" class={cn('grid gap-0.5', local.classes?.wrapper)}>
                  <Show when={local.title}>
                    <KobalteDialog.Title
                      data-slot="title"
                      class={cn('text-sm leading-none font-medium', local.classes?.title)}
                    >
                      {local.title}
                    </KobalteDialog.Title>
                  </Show>

                  <Show when={local.description}>
                    <KobalteDialog.Description
                      data-slot="description"
                      class={cn(
                        'text-muted-foreground text-sm *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
                        local.classes?.description,
                      )}
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
                      'absolute top-2 right-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:(bg-accent text-accent-foreground) effect-fv',
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
          class={cn(
            'bg-muted/50 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 sm:flex-row sm:justify-end',
            local.classes?.footer,
          )}
        >
          {local.footer}
        </div>
      </Show>
    </KobalteDialog.Content>
  )

  const layer = () => (
    <Show
      when={local.scrollable && local.overlay}
      fallback={
        <>
          <Show when={local.overlay}>
            <KobalteDialog.Overlay
              data-slot="overlay"
              class={modalOverlayVariants(
                {
                  scrollable: local.scrollable,
                },
                local.classes?.overlay,
              )}
            />
          </Show>

          {content()}
        </>
      }
    >
      <KobalteDialog.Overlay
        data-slot="overlay"
        class={modalOverlayVariants(
          {
            scrollable: local.scrollable,
          },
          local.classes?.overlay,
        )}
      >
        {content()}
      </KobalteDialog.Overlay>
    </Show>
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

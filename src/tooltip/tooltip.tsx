import * as KobalteTooltip from '@kobalte/core/tooltip'
import type { JSX } from 'solid-js'
import { For, Show, children, mergeProps, splitProps } from 'solid-js'

import { Kbd } from '../kbd'
import { cn } from '../shared/utils'

import { tooltipContentVariants } from './tooltip.class'

type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
type TooltipPlacement =
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

export interface TooltipClasses {
  root?: string
  trigger?: string
  text?: string
  kbds?: string
  kbd?: string
  arrow?: string
}

export interface TooltipBaseProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: TooltipPlacement
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
  text?: JSX.Element
  kbds?: string[]
  arrow?: boolean
  classes?: TooltipClasses
  children?: JSX.Element
}

export type TooltipProps = TooltipBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof TooltipBaseProps | 'children' | 'class'>

function resolveTooltipSide(placement?: TooltipPlacement): TooltipSide {
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

export function Tooltip(props: TooltipProps): JSX.Element {
  const merged = mergeProps(
    {
      placement: 'top' as const,
      openDelay: 0,
      closeDelay: 0,
      arrow: false,
    },
    props,
  ) as TooltipProps
  const [local, rest] = splitProps(merged, [
    'open',
    'defaultOpen',
    'onOpenChange',
    'placement',
    'openDelay',
    'closeDelay',
    'disabled',
    'text',
    'kbds',
    'arrow',
    'classes',
    'children',
  ])

  const triggerChildren = children(() => local.children)
  const hasTrigger = () => triggerChildren.toArray().length > 0
  const hasTooltipContent = () => Boolean(local.text) || (local.kbds?.length ?? 0) > 0
  const isDisabled = () => Boolean(local.disabled || !hasTooltipContent())

  return (
    <KobalteTooltip.Root
      open={local.open}
      defaultOpen={local.defaultOpen}
      onOpenChange={local.onOpenChange}
      placement={local.placement}
      openDelay={local.openDelay}
      closeDelay={local.closeDelay}
      disabled={isDisabled()}
      overflowPadding={4}
      {...rest}
    >
      <Show when={hasTrigger()}>
        <KobalteTooltip.Trigger as="span" data-slot="trigger" class={local.classes?.trigger}>
          {triggerChildren()}
        </KobalteTooltip.Trigger>
      </Show>

      <Show when={hasTooltipContent()}>
        <KobalteTooltip.Portal>
          <KobalteTooltip.Content
            data-slot="content"
            class={tooltipContentVariants(
              {
                side: resolveTooltipSide(local.placement),
              },
              local.classes?.root,
            )}
          >
            <Show when={local.text}>
              <span data-slot="text" class={cn('text-pretty leading-4', local.classes?.text)}>
                {local.text}
              </span>
            </Show>

            <Show when={(local.kbds?.length || 0) > 0}>
              <span
                data-slot="kbds"
                class={cn('ms-1 inline-flex items-center gap-1', local.classes?.kbds)}
              >
                <For each={local.kbds}>
                  {(kbd) => (
                    <Kbd data-slot="kbd" classes={{ root: local.classes?.kbd }}>
                      {kbd}
                    </Kbd>
                  )}
                </For>
              </span>
            </Show>

            <Show when={local.arrow}>
              <KobalteTooltip.Arrow
                data-slot="arrow"
                class={cn(
                  'size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground',
                  local.classes?.arrow,
                )}
              />
            </Show>
          </KobalteTooltip.Content>
        </KobalteTooltip.Portal>
      </Show>
    </KobalteTooltip.Root>
  )
}

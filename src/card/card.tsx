import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../shared/utils'

import type { CardVariantProps } from './card.class'
import { cardRootVariants } from './card.class'

export interface CardClasses {
  root?: string
  header?: string
  body?: string
  footer?: string
}

export interface CardBaseProps extends CardVariantProps {
  header?: JSX.Element
  footer?: JSX.Element
  classes?: CardClasses
  children?: JSX.Element
}

export type CardProps = CardBaseProps

export function Card(props: CardProps): JSX.Element {
  return (
    <div
      data-slot="root"
      class={cardRootVariants(
        {
          variant: props.variant,
        },
        props.classes?.root,
      )}
    >
      <Show when={props.header}>
        <div
          data-slot="header"
          class={cn(
            'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-6',
            props.classes?.header,
          )}
        >
          {props.header}
        </div>
      </Show>

      <Show when={props.children}>
        <div data-slot="body" class={cn('flex-1 p-6', props.classes?.body)}>
          {props.children}
        </div>
      </Show>

      <Show when={props.footer}>
        <div data-slot="footer" class={cn('flex items-center p-6', props.classes?.footer)}>
          {props.footer}
        </div>
      </Show>
    </div>
  )
}

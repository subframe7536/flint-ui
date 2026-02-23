import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { cn } from '../shared/utils'

export interface CardClasses {
  root?: string
  header?: string
  body?: string
  footer?: string
}

export interface CardBaseProps {
  header?: JSX.Element
  footer?: JSX.Element
  classes?: CardClasses
  children?: JSX.Element
}

export type CardProps = CardBaseProps

export function Card(props: CardProps): JSX.Element {
  return (
    <div
      data-slot="card"
      class={cn(
        'ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden rounded-xl py-4 text-sm ring-1 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl flex flex-col',
        props.footer && 'pb-0',
        props.classes?.root,
      )}
    >
      <Show when={props.header}>
        <div
          data-slot="card-header"
          class={cn(
            'gap-1 rounded-t-xl px-4 is-[.border-b]:pb-4 grid auto-rows-min items-start',
            props.classes?.header,
          )}
        >
          {props.header}
        </div>
      </Show>

      <Show when={props.children}>
        <div data-slot="card-content" class={cn('flex-1 px-4', props.classes?.body)}>
          {props.children}
        </div>
      </Show>

      <Show when={props.footer}>
        <div
          data-slot="card-footer"
          class={cn(
            'flex items-center bg-muted/50 rounded-b-xl b-t-(1 border) p-4',
            props.classes?.footer,
          )}
        >
          {props.footer}
        </div>
      </Show>
    </div>
  )
}

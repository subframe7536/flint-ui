import type { JSX } from 'solid-js'
import { Show, splitProps } from 'solid-js'

import type { CardVariantProps } from './card.class'
import {
  cardBodyVariants,
  cardFooterVariants,
  cardHeaderVariants,
  cardRootVariants,
} from './card.class'

type CardVariant = NonNullable<CardVariantProps['variant']>

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

export type CardProps = CardBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof CardBaseProps | 'children' | 'class'>

function normalizeCardVariant(value?: string): CardVariant {
  if (value === 'solid' || value === 'soft' || value === 'subtle') {
    return value
  }

  return 'outline'
}

export function Card(props: CardProps): JSX.Element {
  const [local, rest] = splitProps(props as CardProps & { class?: string }, [
    'variant',
    'header',
    'footer',
    'classes',
    'children',
    'class',
  ])

  return (
    <div
      data-slot="root"
      class={cardRootVariants(
        {
          variant: normalizeCardVariant(local.variant),
        },
        local.classes?.root,
      )}
      {...rest}
    >
      <Show when={local.header}>
        <div data-slot="header" class={cardHeaderVariants({}, local.classes?.header)}>
          {local.header}
        </div>
      </Show>

      <Show when={local.children}>
        <div data-slot="body" class={cardBodyVariants({}, local.classes?.body)}>
          {local.children}
        </div>
      </Show>

      <Show when={local.footer}>
        <div data-slot="footer" class={cardFooterVariants({}, local.classes?.footer)}>
          {local.footer}
        </div>
      </Show>
    </div>
  )
}

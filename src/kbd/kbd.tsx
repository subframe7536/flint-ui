import type { JSX } from 'solid-js'
import { For, splitProps } from 'solid-js'

import type { KbdVariantProps } from './kbd.class'
import { kbdItemVariants, kbdRootVariants } from './kbd.class'

export interface KbdClasses {
  root?: string
  item?: string
}

export interface KbdBaseProps extends KbdVariantProps {
  classes?: KbdClasses
  'data-slot'?: string
  value: string[]
}

export type KbdProps = KbdBaseProps

export function Kbd(props: KbdProps): JSX.Element {
  const [styleProps, contentProps] = splitProps(props as KbdProps, ['size', 'variant', 'classes'])

  return (
    <span data-slot="root" class={kbdRootVariants(undefined, styleProps.classes?.root)}>
      <For each={contentProps.value}>
        {(value) => (
          <kbd
            data-slot={contentProps['data-slot'] ?? 'item'}
            class={kbdItemVariants(
              {
                size: styleProps.size,
                variant: styleProps.variant,
              },
              styleProps.classes?.item,
            )}
          >
            {value}
          </kbd>
        )}
      </For>
    </span>
  )
}

import type { JSX } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'

import { FieldGroupProvider } from './field-group-context'
import type { FieldGroupOrientation, FieldGroupSize } from './field-group-context'
import { fieldGroupVariants } from './field-group.class'

export type { FieldGroupOrientation, FieldGroupSize } from './field-group-context'

export interface FieldGroupClasses {
  root?: string
}

export interface FieldGroupBaseProps {
  size?: FieldGroupSize
  orientation?: FieldGroupOrientation
  classes?: FieldGroupClasses
  children?: JSX.Element
}

export type FieldGroupProps = FieldGroupBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof FieldGroupBaseProps | 'children' | 'class'>

export function FieldGroup(props: FieldGroupProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      orientation: 'horizontal' as const,
    },
    props,
  )

  const [local, rest] = splitProps(merged as FieldGroupProps & { class?: string }, [
    'size',
    'orientation',
    'classes',
    'children',
  ])

  return (
    <FieldGroupProvider
      value={{
        get size() {
          return local.size
        },
        get orientation() {
          return local.orientation
        },
      }}
    >
      <div
        data-slot="root"
        data-orientation={local.orientation}
        class={fieldGroupVariants(
          {
            orientation: local.orientation,
          },
          local.classes?.root,
        )}
        {...rest}
      >
        {local.children}
      </div>
    </FieldGroupProvider>
  )
}

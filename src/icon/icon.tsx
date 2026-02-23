import type { JSX } from 'solid-js'
import { createMemo, splitProps } from 'solid-js'

import { cn, combineStyle } from '../shared/utils'

export type IconName = string | JSX.Element | (() => JSX.Element)

export interface IconClasses {
  root?: string
}

export interface IconBaseProps {
  /**
   * Icon source. Strings should be Uno icon classes such as `i-lucide-search`
   * or app-config aliases such as `icon-search`.
   * Non-string values can be JSX nodes or render functions.
   */
  name: IconName

  /**
   * Icon size. Numbers are interpreted as px.
   */
  size?: string | number

  /**
   * Optional icon name customizer for string-based icons.
   */
  customize?: (content: string, name?: string, prefix?: string, provider?: string) => string

  /**
   * Slot-based class overrides.
   */
  classes?: IconClasses
  style?: JSX.CSSProperties | string
  'aria-label'?: string
  'data-slot'?: string
}

export type IconProps = IconBaseProps

function parseIconName(value: string): { name: string; prefix?: string } {
  const cleaned = value.startsWith('i-') ? value.slice(2) : value
  const [prefix] = cleaned.split('-')

  return {
    name: cleaned,
    prefix,
  }
}

function resolveStringIconClass(
  name: string,
  customize?: IconBaseProps['customize'],
): string | undefined {
  const parsed = parseIconName(name)
  return customize?.(parsed.name, parsed.name, parsed.prefix, undefined) ?? name
}

function resolveNonStringIconContent(name: IconName): JSX.Element | undefined {
  if (typeof name === 'string') {
    return undefined
  }

  if (typeof name === 'function') {
    return name()
  }

  return name
}

export function Icon(props: IconProps): JSX.Element {
  const [sourceProps, a11ySlotProps, styleProps] = splitProps(
    props as IconProps,
    ['name', 'size', 'customize'],
    ['style', 'aria-label', 'data-slot'],
  )

  const sizeStyle = createMemo<JSX.CSSProperties | undefined>(() => {
    if (sourceProps.size === undefined || sourceProps.size === null) {
      return undefined
    }

    if (typeof sourceProps.size === 'number') {
      return {
        'font-size': `${sourceProps.size}px`,
      }
    }

    return {
      'font-size': sourceProps.size,
    }
  })

  const iconClass = createMemo<string | undefined>(() =>
    typeof sourceProps.name === 'string'
      ? resolveStringIconClass(sourceProps.name, sourceProps.customize)
      : undefined,
  )
  const renderedContent = createMemo(() => resolveNonStringIconContent(sourceProps.name))

  return (
    <span
      data-slot={a11ySlotProps['data-slot'] ?? 'icon'}
      class={cn(
        'inline-flex shrink-0 items-center justify-center align-middle',
        iconClass(),
        styleProps.classes?.root,
      )}
      style={combineStyle(a11ySlotProps.style, sizeStyle())}
      aria-hidden={a11ySlotProps['aria-label'] ? undefined : true}
    >
      {renderedContent()}
    </span>
  )
}

import * as KobalteNumberField from '@kobalte/core/number-field'
import type { JSX } from 'solid-js'
import { createMemo, mergeProps, onMount, Show, splitProps } from 'solid-js'

import { Button } from '../button'
import type { ButtonProps } from '../button/button'
import { useFormField } from '../form-field/form-field-context'
import type { IconName } from '../icon'
import { Icon } from '../icon'
import { callHandler, cn, useId } from '../shared/utils'

import type { InputNumberVariantProps } from './input-number.class'
import {
  inputNumberBaseVariants,
  inputNumberDecrementPaddingVariants,
  inputNumberDecrementVariants,
  inputNumberIncrementPaddingVariants,
  inputNumberIncrementVariants,
} from './input-number.class'

type InputNumberColor = NonNullable<InputNumberVariantProps['color']>
type InputNumberSize = NonNullable<InputNumberVariantProps['size']>
type InputNumberButtonSize = NonNullable<ButtonProps<'button'>['size']>
type InputNumberControlTrigger =
  | typeof KobalteNumberField.IncrementTrigger
  | typeof KobalteNumberField.DecrementTrigger

type InputNumberControlButtonProps = Partial<
  Omit<ButtonProps<'button'>, 'children' | 'label' | 'onClick' | 'type'>
>

export interface InputNumberClasses {
  root?: string
  base?: string
  increment?: string
  decrement?: string
}

export interface InputNumberBaseProps extends Pick<
  InputNumberVariantProps,
  'size' | 'color' | 'variant' | 'highlight' | 'orientation'
> {
  id?: string
  name?: string
  placeholder?: string
  increment?: boolean | InputNumberControlButtonProps
  incrementIcon?: IconName
  incrementDisabled?: boolean
  decrement?: boolean | InputNumberControlButtonProps
  decrementIcon?: IconName
  decrementDisabled?: boolean
  autofocus?: boolean
  autofocusDelay?: number
  onBlur?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>
  onFocus?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>
  classes?: InputNumberClasses
}

export type InputNumberProps = InputNumberBaseProps &
  Omit<KobalteNumberField.NumberFieldRootProps, keyof InputNumberBaseProps | 'children' | 'class'>

function toButtonIconSize(size: InputNumberSize): InputNumberButtonSize {
  if (size === 'xs') {
    return 'icon-xs'
  }

  if (size === 'sm') {
    return 'icon-sm'
  }

  if (size === 'lg') {
    return 'icon-lg'
  }

  if (size === 'xl') {
    return 'icon-xl'
  }

  return 'icon'
}

export function InputNumber(props: InputNumberProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      color: 'primary' as const,
      variant: 'outline' as const,
      orientation: 'horizontal' as const,
      increment: true,
      decrement: true,
      autofocusDelay: 0,
    },
    props,
  )

  const [formProps, controlProps, styleProps, rootProps] = splitProps(
    merged as InputNumberProps,
    ['id', 'name', 'disabled', 'onRawValueChange', 'onBlur', 'onFocus'],
    [
      'placeholder',
      'orientation',
      'increment',
      'incrementIcon',
      'incrementDisabled',
      'decrement',
      'decrementIcon',
      'decrementDisabled',
      'autofocus',
      'autofocusDelay',
    ],
    ['size', 'color', 'variant', 'highlight', 'classes'],
  )

  const field = useFormField(() => ({
    id: formProps.id,
    name: formProps.name,
    size: styleProps.size,
    color: styleProps.color,
    highlight: styleProps.highlight,
    disabled: formProps.disabled,
  }))
  const generatedId = useId(() => formProps.id, 'input-number')

  let inputEl: HTMLInputElement | undefined

  const inputId = createMemo(() => field.id() ?? generatedId())
  const rootId = createMemo(() => `${inputId()}-root`)
  const resolvedSize = createMemo(() => (field.size() ?? styleProps.size) as InputNumberSize)
  const resolvedColor = createMemo(() => (field.color() ?? styleProps.color) as InputNumberColor)
  const resolvedHighlight = createMemo(() => field.highlight() ?? styleProps.highlight)
  const disabled = createMemo(() => field.disabled())
  const ariaAttrs = createMemo(() => field.ariaAttrs() ?? {})
  const buttonSize = createMemo(() => toButtonIconSize(resolvedSize()))

  const resolvedIncrement = createMemo(() => {
    if (controlProps.orientation === 'vertical') {
      return Boolean(controlProps.increment || controlProps.decrement)
    }

    return Boolean(controlProps.increment)
  })

  const resolvedDecrement = createMemo(() => {
    if (controlProps.orientation === 'vertical') {
      return false
    }

    return Boolean(controlProps.decrement)
  })

  const incrementIcon = createMemo<IconName>(() => {
    if (controlProps.incrementIcon) {
      return controlProps.incrementIcon
    }

    return controlProps.orientation === 'vertical' ? 'icon-chevron-up' : 'icon-plus'
  })

  const decrementIcon = createMemo<IconName>(() => {
    if (controlProps.decrementIcon) {
      return controlProps.decrementIcon
    }

    return controlProps.orientation === 'vertical' ? 'icon-chevron-down' : 'icon-minus'
  })

  const incrementProps = createMemo<InputNumberControlButtonProps | undefined>(() => {
    return typeof controlProps.increment === 'object' ? controlProps.increment : undefined
  })

  const decrementProps = createMemo<InputNumberControlButtonProps | undefined>(() => {
    return typeof controlProps.decrement === 'object' ? controlProps.decrement : undefined
  })

  function renderControl(config: {
    slot: 'increment' | 'decrement'
    trigger: InputNumberControlTrigger
    className: string
    disabled: boolean | undefined
    ariaLabel: 'Increment' | 'Decrement'
    icon: IconName
    buttonProps: InputNumberControlButtonProps | undefined
  }): JSX.Element {
    const Trigger = config.trigger

    return (
      <div data-slot={config.slot} class={config.className}>
        <Trigger
          as={Button}
          disabled={config.disabled}
          variant="ghost"
          size={buttonSize()}
          aria-label={config.ariaLabel}
          leading={<Icon name={config.icon} />}
          {...config.buttonProps}
        />
      </div>
    )
  }

  function onRawValueChange(value: number): void {
    formProps.onRawValueChange?.(value)
    field.emitFormChange()
    field.emitFormInput()
  }

  const onBlur: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    callHandler(event, formProps.onBlur as any)
    field.emitFormBlur()
  }

  const onFocus: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    callHandler(event, formProps.onFocus as any)
    field.emitFormFocus()
  }

  onMount(() => {
    if (!controlProps.autofocus) {
      return
    }

    setTimeout(() => {
      inputEl?.focus()
    }, controlProps.autofocusDelay ?? 0)
  })

  return (
    <KobalteNumberField.Root
      id={rootId()}
      name={field.name()}
      disabled={disabled()}
      onRawValueChange={onRawValueChange}
      data-slot="root"
      class={cn('relative inline-flex w-full items-center', styleProps.classes?.root)}
      {...rootProps}
    >
      <KobalteNumberField.Input
        id={inputId()}
        ref={(e) => (inputEl = e)}
        placeholder={controlProps.placeholder}
        data-slot="base"
        class={inputNumberBaseVariants(
          {
            color: resolvedColor(),
            size: resolvedSize(),
            variant: styleProps.variant,
            highlight: resolvedHighlight(),
            orientation: controlProps.orientation,
          },
          resolvedIncrement() && inputNumberIncrementPaddingVariants({ size: resolvedSize() }),
          resolvedDecrement() && inputNumberDecrementPaddingVariants({ size: resolvedSize() }),
          controlProps.orientation === 'horizontal' && !resolvedDecrement() && 'text-start',
          styleProps.classes?.base,
        )}
        onBlur={onBlur}
        onFocus={onFocus}
        {...(ariaAttrs() as Record<string, string | boolean | undefined>)}
      />

      <KobalteNumberField.HiddenInput data-slot="hidden-input" />

      <Show when={resolvedIncrement()}>
        {renderControl({
          slot: 'increment',
          trigger: KobalteNumberField.IncrementTrigger,
          className: inputNumberIncrementVariants(
            {
              orientation: controlProps.orientation,
              disabled: disabled() || controlProps.incrementDisabled,
            },
            styleProps.classes?.increment,
          ),
          disabled: disabled() || controlProps.incrementDisabled,
          ariaLabel: 'Increment',
          icon: incrementIcon(),
          buttonProps: incrementProps(),
        })}
      </Show>

      <Show when={resolvedDecrement()}>
        {renderControl({
          slot: 'decrement',
          trigger: KobalteNumberField.DecrementTrigger,
          className: inputNumberDecrementVariants(
            {
              orientation: controlProps.orientation,
              disabled: disabled() || controlProps.decrementDisabled,
            },
            styleProps.classes?.decrement,
          ),
          disabled: disabled() || controlProps.decrementDisabled,
          ariaLabel: 'Decrement',
          icon: decrementIcon(),
          buttonProps: decrementProps(),
        })}
      </Show>
    </KobalteNumberField.Root>
  )
}

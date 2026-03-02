import type { JSX } from 'solid-js'
import { For, Show, createMemo, createSignal, mergeProps, splitProps } from 'solid-js'

import { Checkbox } from '../checkbox'
import type { CheckboxProps } from '../checkbox/checkbox'
import { useFormField } from '../form-field/form-field-context'
import type {
  FormDisableOption,
  FormIdentityOptions,
  FormRequiredOption,
  FormValueOptions,
} from '../form-field/form-options'
import { FORM_ID_NAME_VALUE_REQUIRED_DISABLED_KEYS } from '../form-field/form-options'
import { cn, useId } from '../shared/utils'

import type { CheckboxGroupVariantProps } from './checkbox-group.class'
import {
  checkboxGroupFieldsetVariants,
  checkboxGroupItemVariants,
  checkboxGroupLegendVariants,
} from './checkbox-group.class'

export type CheckboxGroupValue = string

export interface CheckboxGroupItemObject {
  value?: unknown
  label?: JSX.Element
  description?: JSX.Element
  disabled?: boolean
  checkedIcon?: CheckboxProps['checkedIcon']
  indeterminateIcon?: CheckboxProps['indeterminateIcon']
}

export type CheckboxGroupItem = string | number | boolean | null | CheckboxGroupItemObject

export interface CheckboxGroupClasses {
  root?: string
  fieldset?: string
  legend?: string
  item?: string
  checkbox?: CheckboxProps['classes']
}

export interface CheckboxGroupBaseProps
  extends
    CheckboxGroupVariantProps,
    FormIdentityOptions,
    FormValueOptions<CheckboxGroupValue[]>,
    FormRequiredOption,
    FormDisableOption {
  legend?: JSX.Element
  valueKey?: string
  labelKey?: string
  descriptionKey?: string
  items?: CheckboxGroupItem[]
  indicator?: CheckboxProps['indicator']
  checkedIcon?: CheckboxProps['checkedIcon']
  indeterminateIcon?: CheckboxProps['indeterminateIcon']
  onChange?: (value: CheckboxGroupValue[]) => void
  classes?: CheckboxGroupClasses
}

export type CheckboxGroupProps = CheckboxGroupBaseProps

interface NormalizedCheckboxGroupItem {
  id: string
  value: CheckboxGroupValue
  label?: JSX.Element
  description?: JSX.Element
  disabled: boolean
  checkedIcon?: CheckboxProps['checkedIcon']
  indeterminateIcon?: CheckboxProps['indeterminateIcon']
}

function getAtPath(data: Record<string, unknown>, path: string): unknown {
  return data[path]
}

function toValueString(value: unknown, fallback: string): CheckboxGroupValue {
  if (value === null || value === undefined) {
    return fallback
  }

  return String(value)
}

export function CheckboxGroup(props: CheckboxGroupProps): JSX.Element {
  const merged = mergeProps(
    {
      valueKey: 'value',
      labelKey: 'label',
      descriptionKey: 'description',
      orientation: 'vertical' as const,
      variant: 'list' as const,
      size: 'md' as const,
      defaultValue: [] as CheckboxGroupValue[],
    },
    props,
  )

  const [formProps, collectionProps, styleBehaviorProps] = splitProps(
    merged as CheckboxGroupProps,
    [...FORM_ID_NAME_VALUE_REQUIRED_DISABLED_KEYS, 'onChange'],
    ['legend', 'items', 'valueKey', 'labelKey', 'descriptionKey'],
  )

  const groupId = useId(() => formProps.id, 'checkbox-group')
  const field = useFormField(
    () => ({
      id: formProps.id,
      name: formProps.name,
      size: styleBehaviorProps.size,
      disabled: formProps.disabled,
    }),
    {
      bind: false,
      defaultId: groupId,
      defaultSize: 'md',
    },
  )

  const [uncontrolledValue, setUncontrolledValue] = createSignal<CheckboxGroupValue[]>(
    formProps.defaultValue ?? [],
  )

  const selectedValues = createMemo(() => formProps.value ?? uncontrolledValue())
  const legendId = createMemo(() => `${groupId()}-legend`)

  const normalizedItems = createMemo<NormalizedCheckboxGroupItem[]>(() => {
    const items = collectionProps.items ?? []
    const valueKey = collectionProps.valueKey ?? 'value'
    const labelKey = collectionProps.labelKey ?? 'label'
    const descriptionKey = collectionProps.descriptionKey ?? 'description'

    return items.map((item, index) => {
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
        const value = toValueString(item, String(index))

        return {
          id: `${groupId()}:${value}`,
          value,
          label: value,
          disabled: false,
        }
      }

      if (item === null) {
        const value = String(index)

        return {
          id: `${groupId()}:${value}`,
          value,
          label: undefined,
          description: undefined,
          disabled: false,
        }
      }

      const objectItem = item as CheckboxGroupItemObject
      const value = toValueString(
        getAtPath(objectItem as Record<string, unknown>, valueKey),
        String(index),
      )
      const label = getAtPath(objectItem as Record<string, unknown>, labelKey) as
        | JSX.Element
        | undefined
      const description = getAtPath(objectItem as Record<string, unknown>, descriptionKey) as
        | JSX.Element
        | undefined

      return {
        id: `${groupId()}:${value}`,
        value,
        label,
        description,
        disabled: Boolean(objectItem.disabled),
        checkedIcon: objectItem.checkedIcon,
        indeterminateIcon: objectItem.indeterminateIcon,
      }
    })
  })

  function onItemCheckedChange(value: CheckboxGroupValue, checked: boolean): void {
    const nextValues = checked
      ? selectedValues().includes(value)
        ? selectedValues()
        : [...selectedValues(), value]
      : selectedValues().filter((itemValue) => itemValue !== value)

    if (formProps.value === undefined) {
      setUncontrolledValue(nextValues)
    }

    formProps.onChange?.(nextValues)
    field.emitFormChange()
    field.emitFormInput()
  }

  return (
    <div
      id={`${groupId()}-root`}
      data-slot="root"
      class={cn('relative', styleBehaviorProps.classes?.root)}
    >
      <fieldset
        id={groupId()}
        data-slot="fieldset"
        aria-labelledby={collectionProps.legend ? legendId() : undefined}
        class={checkboxGroupFieldsetVariants(
          {
            orientation: styleBehaviorProps.orientation,
          },
          styleBehaviorProps.variant !== 'table' && 'gap-2',
          styleBehaviorProps.classes?.fieldset,
        )}
        {...field.ariaAttrs()}
      >
        <Show when={collectionProps.legend}>
          <legend
            id={legendId()}
            data-slot="legend"
            class={checkboxGroupLegendVariants(
              {
                size: field.size(),
                required: formProps.required,
              },
              styleBehaviorProps.classes?.legend,
            )}
          >
            {collectionProps.legend}
          </legend>
        </Show>

        <For each={normalizedItems()}>
          {(item) => {
            const isItemDisabled = item.disabled || field.disabled()
            const isChecked = () => selectedValues().includes(item.value)

            return (
              <div
                data-slot="item"
                data-checked={isChecked() ? '' : undefined}
                class={checkboxGroupItemVariants(
                  {
                    tableSize: styleBehaviorProps.variant === 'table' ? field.size() : undefined,
                    disabled: isItemDisabled,
                  },
                  styleBehaviorProps.variant === 'table' && [
                    'relative border data-checked:(bg-primary/10 border-primary/50) data-checked:z-1',
                    styleBehaviorProps.orientation === 'horizontal'
                      ? 'first-of-type:rounded-s-lg last-of-type:rounded-e-lg'
                      : 'first-of-type:rounded-t-lg last-of-type:rounded-b-lg',
                  ],
                  styleBehaviorProps.classes?.item,
                )}
              >
                <Checkbox
                  id={item.id}
                  name={field.name()}
                  formFieldBind={false}
                  checked={isChecked()}
                  value={item.value}
                  label={item.label}
                  description={item.description}
                  disabled={isItemDisabled}
                  required={formProps.required}
                  size={field.size()}
                  variant={styleBehaviorProps.variant === 'list' ? 'list' : 'card'}
                  indicator={styleBehaviorProps.indicator}
                  checkedIcon={item.checkedIcon ?? styleBehaviorProps.checkedIcon}
                  indeterminateIcon={item.indeterminateIcon ?? styleBehaviorProps.indeterminateIcon}
                  classes={{
                    ...styleBehaviorProps.classes?.checkbox,
                    root: [
                      styleBehaviorProps.variant === 'table' &&
                        'w-full rounded-none border-none p-0 data-checked:(border-none rounded-none)',
                      styleBehaviorProps.classes?.checkbox?.root,
                    ],
                  }}
                  onChange={(checked) => onItemCheckedChange(item.value, checked)}
                />
              </div>
            )
          }}
        </For>
      </fieldset>
    </div>
  )
}

export type EmptyValueMode = 'preserve' | 'null' | 'undefined'

export interface ModelModifiers {
  trim?: boolean
  lazy?: boolean
  number?: boolean
  empty?: EmptyValueMode
}

export interface ApplyInputModifiersOptions {
  number?: boolean
}

export function looseToNumber(value: unknown): unknown {
  const nextValue = Number.parseFloat(String(value))

  if (Number.isNaN(nextValue)) {
    return value
  }

  return nextValue
}

export function applyInputModifiers<T>(
  value: string | null | undefined,
  modelModifiers?: ModelModifiers,
  options?: ApplyInputModifiersOptions,
): T {
  let nextValue: unknown = value

  if (modelModifiers?.trim) {
    nextValue = String(nextValue ?? '').trim()
  }

  if (modelModifiers?.number || options?.number) {
    nextValue = looseToNumber(nextValue)
  }

  if (modelModifiers?.empty === 'null' && nextValue === '') {
    nextValue = null
  }

  if (modelModifiers?.empty === 'undefined' && nextValue === '') {
    nextValue = undefined
  }

  return nextValue as T
}

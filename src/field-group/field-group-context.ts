import { createContextProvider } from '../shared/create-context-provider'

export type FieldGroupOrientation = 'horizontal' | 'vertical'

export type FieldGroupSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface FieldGroupContextValue {
  size?: FieldGroupSize
  orientation?: FieldGroupOrientation
}

export const [FieldGroupProvider, useFieldGroupContext] =
  createContextProvider<FieldGroupContextValue | null>('FieldGroup', null)

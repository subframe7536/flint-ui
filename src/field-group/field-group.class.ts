import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const fieldGroupVariants = cva(
  'relative isolate [&>*]:relative [&>*:focus-within]:z-2 [&>*:not(:first-child):not(:last-child)]:rounded-none',
  {
    defaultVariants: {
      orientation: 'horizontal',
    },
    variants: {
      orientation: {
        horizontal:
          'inline-flex -space-x-px [&>*:first-child]:rounded-e-none [&>*:last-child]:rounded-s-none [&>*:not(:first-child)]:shadow-[-1px_0_0_0_var(--un-border-color)]',
        vertical:
          'flex flex-col -space-y-px [&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none [&>*:not(:first-child)]:shadow-[0_-1px_0_0_var(--un-border-color)]',
      },
    },
  },
)

export type FieldGroupVariantProps = VariantProps<typeof fieldGroupVariants>

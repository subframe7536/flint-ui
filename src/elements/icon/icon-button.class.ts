import { cva } from 'cls-variant/cva'

export const iconButtonVariants = cva(
  'inline-flex cursor-pointer cursor-pointer select-none whitespace-nowrap items-center justify-center bg-clip-padding data-loading:effect-loading',
  {
    defaultVariants: {
      size: 'md',
    },
    variants: {
      size: {
        xs: 'rounded-md size-6',
        sm: 'rounded-md size-7',
        md: 'rounded-lg size-8',
        lg: 'rounded-lg size-9',
        xl: 'rounded-xl size-10',
      },
    },
  },
)

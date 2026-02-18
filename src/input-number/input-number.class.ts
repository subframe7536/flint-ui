import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const inputNumberBaseVariants = cva(
  'w-full rounded-md border border-input bg-background text-foreground outline-none transition-shadow placeholder:text-muted-foreground disabled:(cursor-not-allowed opacity-75)',
  {
    defaultVariants: {
      color: 'primary',
      size: 'md',
      variant: 'outline',
      orientation: 'horizontal',
    },
    variants: {
      color: {
        primary: 'focus-visible:(ring-2 ring-inset ring-primary)',
        secondary: 'focus-visible:(ring-2 ring-inset ring-secondary)',
        neutral: 'focus-visible:(ring-2 ring-inset ring-neutral)',
        error: 'focus-visible:(ring-2 ring-inset ring-destructive)',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-9 px-2.5 text-sm',
        lg: 'h-10 px-3 text-sm',
        xl: 'h-11 px-3 text-base',
      },
      variant: {
        outline: 'border border-input bg-background',
        soft: 'border-transparent bg-muted/50 hover:bg-muted',
        subtle: 'border border-border bg-muted',
        ghost: 'border-transparent bg-transparent hover:bg-muted',
        none: 'border-transparent bg-transparent',
      },
      orientation: {
        horizontal: 'text-center',
        vertical: 'text-center pe-9',
      },
      highlight: {
        true: 'ring-1 ring-inset ring-border',
      },
    },
    compoundVariants: [
      { color: 'primary', highlight: true, class: 'ring-primary' },
      { color: 'secondary', highlight: true, class: 'ring-secondary' },
      { color: 'neutral', highlight: true, class: 'ring-foreground' },
      { color: 'error', highlight: true, class: 'ring-destructive' },
    ],
  },
)

export const inputNumberIncrementPaddingVariants = cva('pe-9', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'pe-7',
      sm: 'pe-8',
      md: 'pe-9',
      lg: 'pe-10',
      xl: 'pe-11',
    },
  },
})

export const inputNumberDecrementPaddingVariants = cva('ps-9', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'ps-7',
      sm: 'ps-8',
      md: 'ps-9',
      lg: 'ps-10',
      xl: 'ps-11',
    },
  },
})

export const inputNumberIncrementVariants = cva('absolute flex items-center', {
  defaultVariants: {
    orientation: 'horizontal',
    disabled: false,
  },
  variants: {
    orientation: {
      horizontal: 'inset-y-0 end-0 pe-1',
      vertical: 'top-0 end-0 pe-1',
    },
    disabled: {
      true: 'opacity-75',
    },
  },
})

export const inputNumberDecrementVariants = cva('absolute flex items-center', {
  defaultVariants: {
    orientation: 'horizontal',
    disabled: false,
  },
  variants: {
    orientation: {
      horizontal: 'inset-y-0 start-0 ps-1',
      vertical: 'bottom-0 end-0 pe-1',
    },
    disabled: {
      true: 'opacity-75',
    },
  },
})

export type InputNumberVariantProps = VariantProps<typeof inputNumberBaseVariants> &
  VariantProps<typeof inputNumberIncrementVariants> &
  VariantProps<typeof inputNumberDecrementVariants>

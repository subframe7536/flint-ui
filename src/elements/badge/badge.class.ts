import type { ClassValue, VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

import { buttonIconSizeVariants } from '../button/button.class'
import type { ButtonIconSizeProps } from '../button/button.class'

export const badgeVariants = cva(
  'font-500 inline-flex shrink-0 max-w-full select-none whitespace-nowrap items-center',
  {
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'text-accent-foreground bg-accent/50',
        outline: 'text-foreground bg-background surface-outline-inset',
        solid: 'text-primary-foreground bg-primary shadow-xs',
      },
      size: {
        xs: 'text-xs px-1 rounded-sm',
        sm: 'text-xs px-1 rounded-sm',
        md: 'text-sm px-1.5 rounded-md',
        lg: 'text-sm px-1.5 rounded-md',
        xl: 'text-base px-2 rounded-lg',
      },
    },
  },
)

export function badgeIconVariants(
  size: ButtonIconSizeProps['size'],
  cls: ClassValue,
  isLeading: boolean,
) {
  return buttonIconSizeVariants({ size }, 'scale-80', isLeading ? 'me-.5' : 'ms-.5', cls)
}

export type BadgeVariantProps = VariantProps<typeof badgeVariants>

import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const cardRootVariants = cva(
  'relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs/5',
  {
    defaultVariants: {
      variant: 'outline',
    },
    variants: {
      variant: {
        outline: 'divide-y border-border bg-card text-card-foreground',
        soft: 'divide-y border-transparent bg-muted/56 text-card-foreground',
        subtle: 'divide-y border-border bg-muted/40 text-card-foreground ring-1 ring-border/60',
        solid: 'border-transparent bg-inverted text-inverted',
      },
    },
  },
)

export type CardVariantProps = VariantProps<typeof cardRootVariants>

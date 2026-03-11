import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const tooltipContentVariants = cva(
  'z-50 w-fit max-w-xs origin-$kb-tooltip-content-transform-origin rounded-md px-2 py-1 text-xs outline-none flex items-baseline data-expanded:(animate-in fade-in-0 zoom-in-95) data-[state=delayed-open]:(animate-in fade-in-0 zoom-in-95) data-closed:(animate-out fade-out-0 zoom-out-95)',
  {
    variants: {
      side: {
        left: 'data-expanded:slide-in-from-right-1 mr-$kb-popper-content-overflow-padding',
        right: 'data-expanded:slide-in-from-left-1 ml-$kb-popper-content-overflow-padding',
        top: 'data-expanded:slide-in-from-bottom-1 mb-$kb-popper-content-overflow-padding',
        bottom: 'data-expanded:slide-in-from-top-1 mt-$kb-popper-content-overflow-padding',
      },
      invert: {
        true: 'bg-foreground text-background',
        false: 'bg-background text-foreground surface-outline shadow-sm',
      },
    },
    defaultVariants: {
      side: 'top',
    },
  },
)

export type TooltipVariantProps = VariantProps<typeof tooltipContentVariants>

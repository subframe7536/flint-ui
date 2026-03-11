import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const overlayMenuItemVariants = cva(
  'relative grid cursor-default select-none grid-cols-[auto_1fr_auto] items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none data-disabled:effect-dis data-highlighted:(bg-accent text-accent-foreground)',
  {
    defaultVariants: {
      color: 'default',
      size: 'md',
    },
    variants: {
      color: {
        default: 'text-foreground',
        destructive: 'text-destructive data-highlighted:(bg-destructive/10 text-destructive)',
      },
      size: {
        sm: 'min-h-7 text-xs',
        md: 'min-h-8 text-sm sm:min-h-7',
        lg: 'min-h-9 text-sm',
      },
    },
  },
)

export type OverlayMenuItemVariantProps = VariantProps<typeof overlayMenuItemVariants>

export const overlayMenuContentVariants = cva(
  'z-50 origin-$kb-popper-content-transform-origin bg-popover text-popover-foreground outline-none flex flex-col min-w-32 rounded-lg p-1 shadow-lg surface-overlay data-expanded:(animate-in fade-in-0 zoom-in-90) data-closed:(animate-out fade-out-0 zoom-out-90)',
  {
    defaultVariants: {
      side: 'right',
    },
    variants: {
      side: {
        top: 'mb-$kb-popper-content-overflow-padding data-expanded:slide-in-from-bottom-2 data-closed:slide-out-to-bottom-2',
        right:
          'ml-$kb-popper-content-overflow-padding data-expanded:slide-in-from-left-2 data-closed:slide-out-to-left-2',
        bottom:
          'mt-$kb-popper-content-overflow-padding data-expanded:slide-in-from-top-2 data-closed:slide-out-to-top-2',
        left: 'mr-$kb-popper-content-overflow-padding data-expanded:slide-in-from-right-2 data-closed:slide-out-to-right-2',
      },
    },
  },
)

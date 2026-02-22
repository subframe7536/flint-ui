import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const dropdownMenuContentVariants = cva(
  'z-50 relative origin-$kb-popper-content-transform-origin bg-popover text-popover-foreground outline-none data-expanded:(animate-in fade-in-0 zoom-in-95) data-closed:(animate-out fade-out-0 zoom-out-95) duration-100',
  {
    defaultVariants: {
      side: 'bottom',
      sub: false,
    },
    variants: {
      side: {
        top: 'mb-$kb-popper-content-overflow-padding slide-in-from-bottom-2',
        right: 'ml-$kb-popper-content-overflow-padding slide-in-from-left-2',
        bottom: 'mt-$kb-popper-content-overflow-padding slide-in-from-top-2',
        left: 'mr-$kb-popper-content-overflow-padding slide-in-from-right-2',
      },
      sub: {
        true: 'min-w-[96px] rounded-md p-1 shadow-lg ring-1 ring-foreground/10',
        false: 'flex flex-col min-w-32 rounded-lg p-1 shadow-md ring-1 ring-foreground/10',
      },
    },
  },
)

export const dropdownMenuItemVariants = cva(
  'group/dropdown-menu-item relative grid cursor-default select-none grid-cols-[auto_1fr_auto] items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none data-disabled:(pointer-events-none opacity-50) data-highlighted:(bg-accent text-accent-foreground)',
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

export type DropdownMenuItemVariantProps = VariantProps<typeof dropdownMenuItemVariants>

import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const commandPaletteInputWrapperVariants = cva('flex items-center gap-2 px-3', {
  defaultVariants: { size: 'md' },
  variants: {
    size: {
      xs: 'h-10',
      sm: 'h-11',
      md: 'h-12',
      lg: 'h-13',
      xl: 'h-14',
    },
  },
})

export const commandPaletteInputVariants = cva(
  'flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:(cursor-not-allowed opacity-50)',
  {
    defaultVariants: { size: 'md' },
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
        xl: 'text-base',
      },
    },
  },
)

export const commandPaletteGroupLabelVariants = cva('font-semibold text-muted-foreground px-2', {
  defaultVariants: { size: 'md' },
  variants: {
    size: {
      xs: 'py-1 text-[10px]/3',
      sm: 'py-1.5 text-[10px]/3',
      md: 'py-1.5 text-xs',
      lg: 'py-2 text-xs',
      xl: 'py-2 text-sm',
    },
  },
})

export const commandPaletteItemVariants = cva(
  'group relative w-full flex items-start cursor-default select-none outline-none rounded-md data-disabled:(pointer-events-none opacity-75) data-highlighted:(bg-accent text-accent-foreground)',
  {
    defaultVariants: { size: 'md' },
    variants: {
      size: {
        xs: 'gap-1 p-1 text-xs',
        sm: 'gap-1.5 p-1.5 text-xs',
        md: 'gap-1.5 p-1.5 text-sm',
        lg: 'gap-2 p-2 text-sm',
        xl: 'gap-2 p-2 text-base',
      },
    },
  },
)

export const commandPaletteItemTrailingIconVariants = cva('shrink-0 text-muted-foreground', {
  defaultVariants: { size: 'md' },
  variants: {
    size: {
      xs: 'size-4',
      sm: 'size-4',
      md: 'size-5',
      lg: 'size-5',
      xl: 'size-6',
    },
  },
})

export const commandPaletteEmptyVariants = cva('text-center text-muted-foreground', {
  defaultVariants: { size: 'md' },
  variants: {
    size: {
      xs: 'py-3 text-xs',
      sm: 'py-4 text-xs',
      md: 'py-6 text-sm',
      lg: 'py-7 text-sm',
      xl: 'py-8 text-base',
    },
  },
})

export type CommandPaletteSizeVariantProps = VariantProps<typeof commandPaletteItemVariants>
export type CommandPaletteSize = NonNullable<CommandPaletteSizeVariantProps['size']>

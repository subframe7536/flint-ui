import * as KobalteDropdownMenu from '@kobalte/core/dropdown-menu'
import type { JSX } from 'solid-js'
import { Show, children, mergeProps, splitProps } from 'solid-js'

import type { IconName } from '../icon'
import { resolveOverlayMenuSide } from '../shared/overlay-menu'
import type { OverlayMenuContentSlot, OverlayMenuItems } from '../shared/overlay-menu'
import { OverlayMenuBaseContent } from '../shared/overlay-menu-base'
import type {
  OverlayMenuPrimitives,
  OverlayMenuSharedClasses,
  OverlayMenuSharedItem,
  OverlayMenuSharedItemRenderContext,
} from '../shared/overlay-menu-base.types'

import type { DropdownMenuItemVariantProps } from './dropdown-menu.class'
import { dropdownMenuContentVariants, dropdownMenuItemVariants } from './dropdown-menu.class'

const DROPDOWN_MENU_PRIMITIVES: OverlayMenuPrimitives = {
  Portal: KobalteDropdownMenu.Portal as unknown as OverlayMenuPrimitives['Portal'],
  Content: KobalteDropdownMenu.Content as unknown as OverlayMenuPrimitives['Content'],
  Group: KobalteDropdownMenu.Group as unknown as OverlayMenuPrimitives['Group'],
  GroupLabel: KobalteDropdownMenu.GroupLabel as unknown as OverlayMenuPrimitives['GroupLabel'],
  Separator: KobalteDropdownMenu.Separator as unknown as OverlayMenuPrimitives['Separator'],
  Item: KobalteDropdownMenu.Item as unknown as OverlayMenuPrimitives['Item'],
  CheckboxItem:
    KobalteDropdownMenu.CheckboxItem as unknown as OverlayMenuPrimitives['CheckboxItem'],
  ItemIndicator:
    KobalteDropdownMenu.ItemIndicator as unknown as OverlayMenuPrimitives['ItemIndicator'],
  Sub: KobalteDropdownMenu.Sub as unknown as OverlayMenuPrimitives['Sub'],
  SubTrigger: KobalteDropdownMenu.SubTrigger as unknown as OverlayMenuPrimitives['SubTrigger'],
  SubContent: KobalteDropdownMenu.SubContent as unknown as OverlayMenuPrimitives['SubContent'],
  Arrow: KobalteDropdownMenu.Arrow as unknown as OverlayMenuPrimitives['Arrow'],
}

type DropdownMenuColor = NonNullable<DropdownMenuItemVariantProps['color']>
type DropdownMenuSize = NonNullable<DropdownMenuItemVariantProps['size']>
type DropdownMenuPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'

export interface DropdownMenuItem extends OverlayMenuSharedItem<
  DropdownMenuColor,
  DropdownMenuItem
> {}

export type DropdownMenuItems = OverlayMenuItems<DropdownMenuItem>

export interface DropdownMenuClasses extends OverlayMenuSharedClasses {}

export interface DropdownMenuItemRenderContext extends OverlayMenuSharedItemRenderContext<DropdownMenuItem> {}

export interface DropdownMenuBaseProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: DropdownMenuPlacement
  gutter?: number
  size?: DropdownMenuSize
  disabled?: boolean
  items?: DropdownMenuItems
  arrow?: boolean
  checkedIcon?: IconName
  submenuIcon?: IconName
  itemRender?: (context: DropdownMenuItemRenderContext) => JSX.Element
  contentTop?: OverlayMenuContentSlot
  contentBottom?: OverlayMenuContentSlot
  classes?: DropdownMenuClasses
  children?: JSX.Element
}

export type DropdownMenuProps = DropdownMenuBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof DropdownMenuBaseProps | 'children' | 'class'>

export function DropdownMenu(props: DropdownMenuProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      placement: 'bottom-start' as const,
      gutter: 8,
      checkedIcon: 'icon-check' as IconName,
      submenuIcon: 'icon-chevron-right' as IconName,
    },
    props,
  ) as DropdownMenuProps
  const [local, rest] = splitProps(merged, [
    'defaultOpen',
    'placement',
    'gutter',
    'size',
    'disabled',
    'items',
    'arrow',
    'checkedIcon',
    'submenuIcon',
    'itemRender',
    'contentTop',
    'contentBottom',
    'classes',
    'children',
  ])

  const triggerChildren = children(() => local.children)
  const hasTrigger = () => triggerChildren.toArray().length > 0

  const rootSide = () => resolveOverlayMenuSide(local.placement)

  return (
    <KobalteDropdownMenu.Root
      defaultOpen={local.defaultOpen}
      modal
      placement={local.placement}
      gutter={local.gutter}
      overflowPadding={0}
      {...rest}
    >
      <Show when={hasTrigger()}>
        <KobalteDropdownMenu.Trigger
          as="span"
          data-slot="trigger"
          class={local.classes?.trigger}
          disabled={local.disabled}
        >
          {triggerChildren()}
        </KobalteDropdownMenu.Trigger>
      </Show>

      <OverlayMenuBaseContent<DropdownMenuColor, DropdownMenuItem, DropdownMenuSize>
        primitives={DROPDOWN_MENU_PRIMITIVES}
        items={local.items}
        size={local.size}
        classes={local.classes}
        checkedIcon={local.checkedIcon}
        submenuIcon={local.submenuIcon}
        itemRender={local.itemRender}
        contentTop={local.contentTop}
        contentBottom={local.contentBottom}
        itemClassName={(item) =>
          dropdownMenuItemVariants(
            {
              size: local.size,
              color: item.color,
            },
            local.classes?.item,
          )
        }
        checkboxItemClassName={(item) =>
          dropdownMenuItemVariants(
            {
              size: local.size,
              color: item.color,
            },
            'pr-8 pl-1.5',
            local.classes?.item,
          )
        }
        subTriggerClassName={(item) =>
          dropdownMenuItemVariants(
            {
              size: local.size,
              color: item.color,
            },
            'data-expanded:(bg-accent text-accent-foreground)',
            local.classes?.item,
          )
        }
        rootContentClassName={(side) =>
          dropdownMenuContentVariants({ side, sub: false }, local.classes?.content)
        }
        subContentClassName={(side) =>
          dropdownMenuContentVariants({ side, sub: true }, local.classes?.content)
        }
        rootSide={rootSide()}
        separatorClassName="-mx-1 my-1 h-px bg-border"
        renderRootExtras={() => (
          <Show when={local.arrow}>
            <KobalteDropdownMenu.Arrow data-slot="arrow" class={local.classes?.arrow} />
          </Show>
        )}
      />
    </KobalteDropdownMenu.Root>
  )
}

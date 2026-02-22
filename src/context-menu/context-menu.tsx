import * as KobalteContextMenu from '@kobalte/core/context-menu'
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

import type { ContextMenuItemVariantProps } from './context-menu.class'
import { contextMenuContentVariants, contextMenuItemVariants } from './context-menu.class'

const CONTEXT_MENU_PRIMITIVES: OverlayMenuPrimitives = {
  Portal: KobalteContextMenu.Portal as unknown as OverlayMenuPrimitives['Portal'],
  Content: KobalteContextMenu.Content as unknown as OverlayMenuPrimitives['Content'],
  Group: KobalteContextMenu.Group as unknown as OverlayMenuPrimitives['Group'],
  GroupLabel: KobalteContextMenu.GroupLabel as unknown as OverlayMenuPrimitives['GroupLabel'],
  Separator: KobalteContextMenu.Separator as unknown as OverlayMenuPrimitives['Separator'],
  Item: KobalteContextMenu.Item as unknown as OverlayMenuPrimitives['Item'],
  CheckboxItem: KobalteContextMenu.CheckboxItem as unknown as OverlayMenuPrimitives['CheckboxItem'],
  ItemIndicator:
    KobalteContextMenu.ItemIndicator as unknown as OverlayMenuPrimitives['ItemIndicator'],
  Sub: KobalteContextMenu.Sub as unknown as OverlayMenuPrimitives['Sub'],
  SubTrigger: KobalteContextMenu.SubTrigger as unknown as OverlayMenuPrimitives['SubTrigger'],
  SubContent: KobalteContextMenu.SubContent as unknown as OverlayMenuPrimitives['SubContent'],
  Arrow: KobalteContextMenu.Arrow as unknown as OverlayMenuPrimitives['Arrow'],
}

type ContextMenuColor = NonNullable<ContextMenuItemVariantProps['color']>
type ContextMenuSize = NonNullable<ContextMenuItemVariantProps['size']>
type ContextMenuPlacement =
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

export interface ContextMenuItem extends OverlayMenuSharedItem<ContextMenuColor, ContextMenuItem> {}

export type ContextMenuItems = OverlayMenuItems<ContextMenuItem>

export interface ContextMenuClasses extends OverlayMenuSharedClasses {}

export interface ContextMenuItemRenderContext extends OverlayMenuSharedItemRenderContext<ContextMenuItem> {}

export interface ContextMenuBaseProps {
  id?: string
  onOpenChange?: (open: boolean) => void
  placement?: ContextMenuPlacement
  gutter?: number
  size?: ContextMenuSize
  disabled?: boolean
  items?: ContextMenuItems
  checkedIcon?: IconName
  submenuIcon?: IconName
  itemRender?: (context: ContextMenuItemRenderContext) => JSX.Element
  contentTop?: OverlayMenuContentSlot
  contentBottom?: OverlayMenuContentSlot
  classes?: ContextMenuClasses
  children?: JSX.Element
}

export type ContextMenuProps = ContextMenuBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof ContextMenuBaseProps | 'children' | 'class'>

export function ContextMenu(props: ContextMenuProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      checkedIcon: 'icon-check' as IconName,
      submenuIcon: 'icon-chevron-right' as IconName,
    },
    props,
  ) as ContextMenuProps
  const [local, rest] = splitProps(merged, [
    'id',
    'onOpenChange',
    'placement',
    'gutter',
    'size',
    'disabled',
    'items',
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

  const rootSide = () => resolveOverlayMenuSide(local.placement ?? 'right-start')

  return (
    <KobalteContextMenu.Root
      id={local.id}
      onOpenChange={local.onOpenChange}
      modal
      placement={local.placement}
      gutter={local.gutter}
      overflowPadding={4}
      {...rest}
    >
      <Show when={hasTrigger()}>
        <KobalteContextMenu.Trigger
          data-slot="trigger"
          class={local.classes?.trigger}
          disabled={local.disabled}
        >
          {triggerChildren()}
        </KobalteContextMenu.Trigger>
      </Show>

      <OverlayMenuBaseContent<ContextMenuColor, ContextMenuItem, ContextMenuSize>
        primitives={CONTEXT_MENU_PRIMITIVES}
        items={local.items}
        size={local.size}
        classes={local.classes}
        checkedIcon={local.checkedIcon}
        submenuIcon={local.submenuIcon}
        itemRender={local.itemRender}
        contentTop={local.contentTop}
        contentBottom={local.contentBottom}
        itemClassName={(item) =>
          contextMenuItemVariants(
            {
              size: local.size,
              color: item.color,
            },
            local.classes?.item,
          )
        }
        checkboxItemClassName={(item) =>
          contextMenuItemVariants(
            {
              size: local.size,
              color: item.color,
            },
            'pr-8 pl-1.5',
            local.classes?.item,
          )
        }
        subTriggerClassName={(item) =>
          contextMenuItemVariants(
            {
              size: local.size,
              color: item.color,
            },
            'data-expanded:(bg-accent text-accent-foreground)',
            local.classes?.item,
          )
        }
        rootContentClassName={(side) =>
          contextMenuContentVariants({ side, sub: false }, local.classes?.content)
        }
        subContentClassName={(side) =>
          contextMenuContentVariants({ side, sub: true }, local.classes?.content)
        }
        rootSide={rootSide()}
        separatorClassName="-mx-1 my-1 h-px border-t-border"
      />
    </KobalteContextMenu.Root>
  )
}

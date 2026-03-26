import type { JSX } from 'solid-js'

export type OverlayMenuSide = 'top' | 'right' | 'bottom' | 'left'

export type OverlayMenuPlacement =
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

export type OverlayMenuContentSlot = (context: { sub: boolean }) => JSX.Element

export function resolveOverlayMenuSide(placement?: string): OverlayMenuSide {
  if (placement?.startsWith('right')) {
    return 'right'
  }

  if (placement?.startsWith('bottom')) {
    return 'bottom'
  }

  if (placement?.startsWith('left')) {
    return 'left'
  }

  return 'top'
}

export function getOverlayMenuTextValue(item: {
  label?: JSX.Element
  description?: JSX.Element
}): string | undefined {
  if (typeof item.label === 'string') {
    return item.label
  }

  if (typeof item.description === 'string') {
    return item.description
  }

  return undefined
}

interface OverlayMenuGroup<TItem> {
  label?: JSX.Element
  items: TItem[]
}
export function resolveMenuGroups<
  TItem extends { type?: string; children?: any[]; label?: JSX.Element },
>(items?: TItem[]): OverlayMenuGroup<TItem>[] {
  if (!items || items.length === 0) {
    return []
  }

  const groups: OverlayMenuGroup<TItem>[] = []
  let defaultGroup: TItem[] = []

  for (const item of items) {
    if (item.type === 'group') {
      if (defaultGroup.length > 0) {
        groups.push({ items: defaultGroup })
        defaultGroup = []
      }

      if (item.children?.length) {
        groups.push({
          label: item.label,
          items: item.children,
        })
      }

      continue
    }

    defaultGroup.push(item)
  }

  if (defaultGroup.length > 0) {
    groups.push({ items: defaultGroup })
  }

  return groups
}

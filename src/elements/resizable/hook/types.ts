import type { JSX } from 'solid-js'

export type ResizableOrientation = 'vertical' | 'horizontal'

export type ResizableSize = number | `${number}%`
export interface ResizablePanelItem {
  panelId?: string
  size?: ResizableSize
  defaultSize?: ResizableSize
  min?: ResizableSize
  max?: ResizableSize
  resizable?: boolean
  collapsible?: boolean
  onResize?: (size: number) => void
  onCollapse?: (size: number) => void
  onExpand?: (size: number) => void
  class?: string
  style?: JSX.CSSProperties
  content?: JSX.Element
}

export const PRECISION = 6
export const EPSILON = 10 ** -PRECISION

export interface ResizableResolvedPanel extends Omit<
  ResizablePanelItem,
  'size' | 'defaultSize' | 'min' | 'max' | 'resizable' | 'collapsible'
> {
  panelId: string
  defaultSize?: ResizableSize
  min: number
  max: number
  resizable: boolean
  collapsible: boolean
}

export interface ResizableHandleAria {
  controls?: string
  valueNow: number
  valueMin: number
  valueMax: number
}

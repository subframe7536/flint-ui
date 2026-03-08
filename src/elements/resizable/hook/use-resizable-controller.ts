import type { Accessor } from 'solid-js'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'

import {
  isPanelCollapsed,
  normalizePanelSizes,
  resolveKeyboardDelta,
  resolvePanels,
  resizeFromHandle,
  toggleHandleNearestPanel,
} from './core'
import type { ResizablePanelItem, ResizableResolvedPanel, ResizableSize } from './core'
import type { ResizableOrientation } from './handle-manager'

const EPSILON = 1e-6
const DRAG_STATE_INITIALIZED = 1 << 0
const DRAG_STATE_ALT_KEY = 1 << 1

export interface UseResizableControllerOptions {
  orientation: Accessor<ResizableOrientation>
  panels: Accessor<ResizablePanelItem[]>
  controlledSizes: Accessor<number[] | undefined>
  keyboardDelta: Accessor<ResizableSize | undefined>
  panelIdPrefix: Accessor<string>
  onSizesChange?: (sizes: number[]) => void
}

export interface ResizableController {
  setRootElement: (element: HTMLDivElement) => void
  rootSize: Accessor<number>
  resolvedPanels: Accessor<ResizableResolvedPanel[]>
  sizes: Accessor<number[]>
  resizeHandleByDelta: (handleIndex: number, deltaPx: number, altKey: boolean) => void
  stopHandleDrag: () => void
  onHandleKeyDown: (handleIndex: number, event: KeyboardEvent, altKey: boolean) => void
}

export function useResizableController(
  options: UseResizableControllerOptions,
): ResizableController {
  const [rootElement, setRootElement] = createSignal<HTMLDivElement>()
  const [rootSize, setRootSize] = createSignal(1)
  const [uncontrolledSizes, setUncontrolledSizes] = createSignal<number[]>([])

  const resolvedPanels = createMemo(() =>
    resolvePanels(options.panels(), rootSize(), options.panelIdPrefix()),
  )
  const panelInitialSizes = createMemo(() => resolvedPanels().map((panel) => panel.initialSize))

  const normalizedControlledSizes = createMemo(() => {
    const controlledSizes = options.controlledSizes()
    if (!controlledSizes) {
      return undefined
    }

    return normalizePanelSizes({
      panelCount: resolvedPanels().length,
      rootSize: rootSize(),
      panelInitialSizes: panelInitialSizes(),
      controlledSizes,
    })
  })

  createEffect(() => {
    if (options.controlledSizes() !== undefined) {
      return
    }

    const panels = resolvedPanels()
    const nextInitialSizes = normalizePanelSizes({
      panelCount: panels.length,
      rootSize: rootSize(),
      panelInitialSizes: panelInitialSizes(),
    })

    setUncontrolledSizes((previous) => {
      if (previous.length === 0 || previous.length !== panels.length) {
        return nextInitialSizes
      }

      return normalizePanelSizes({
        panelCount: panels.length,
        rootSize: rootSize(),
        panelInitialSizes: panelInitialSizes(),
        controlledSizes: previous,
      })
    })
  })

  const sizes = createMemo(() => normalizedControlledSizes() ?? uncontrolledSizes())

  createEffect(() => {
    const element = rootElement()
    if (!element) {
      return
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect()
      const value = options.orientation() === 'horizontal' ? rect.width : rect.height
      setRootSize(value > EPSILON ? value : 1)
    }

    updateSize()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => {
      updateSize()
    })

    observer.observe(element)

    onCleanup(() => {
      observer.disconnect()
    })
  })

  let previousSizes: number[] = []
  let previousCollapsedStates: boolean[] = []

  createEffect(() => {
    const panels = resolvedPanels()
    const currentSizes = sizes()

    for (let index = 0; index < panels.length; index += 1) {
      const panel = panels[index]
      const size = currentSizes[index] ?? 0
      const collapsed = panel ? isPanelCollapsed(size, panel) : false

      if (
        panel &&
        (previousSizes[index] === undefined ||
          Math.abs((previousSizes[index] ?? 0) - size) > EPSILON)
      ) {
        panel.onResize?.(size)
      }

      if (
        panel &&
        previousCollapsedStates[index] !== undefined &&
        previousCollapsedStates[index] !== collapsed
      ) {
        if (collapsed) {
          panel.onCollapse?.(size)
        } else {
          panel.onExpand?.(size)
        }
      }
    }

    previousSizes = [...currentSizes]
    previousCollapsedStates = panels.map((panel, index) =>
      isPanelCollapsed(currentSizes[index] ?? 0, panel),
    )
  })

  function emitSizes(nextSizes: number[]): void {
    const panelCount = resolvedPanels().length
    let normalized = nextSizes

    if (nextSizes.length !== panelCount) {
      normalized = normalizePanelSizes({
        panelCount,
        rootSize: rootSize(),
        panelInitialSizes: panelInitialSizes(),
        controlledSizes: nextSizes,
      })
    } else {
      let total = 0
      let valid = true

      for (const size of nextSizes) {
        if (!Number.isFinite(size) || size < 0) {
          valid = false
          break
        }

        total += size
      }

      if (!valid || Math.abs(total - 1) > EPSILON * Math.max(1, panelCount)) {
        normalized = normalizePanelSizes({
          panelCount,
          rootSize: rootSize(),
          panelInitialSizes: panelInitialSizes(),
          controlledSizes: nextSizes,
        })
      }
    }

    if (options.controlledSizes() === undefined) {
      setUncontrolledSizes(normalized)
    }

    options.onSizesChange?.(normalized)
  }

  let dragInitialSizes: number[] | null = null
  let dragHandleIndex = -1
  let dragState = 0

  function resizeHandleByDelta(handleIndex: number, deltaPx: number, altKey: boolean): void {
    const currentSizes = sizes()
    if (currentSizes.length <= 1) {
      return
    }

    if (
      dragInitialSizes === null ||
      (dragState & DRAG_STATE_INITIALIZED) === 0 ||
      dragHandleIndex !== handleIndex ||
      ((dragState & DRAG_STATE_ALT_KEY) !== 0) !== altKey
    ) {
      dragInitialSizes = [...currentSizes]
      dragHandleIndex = handleIndex
      dragState = DRAG_STATE_INITIALIZED | (altKey ? DRAG_STATE_ALT_KEY : 0)
    }

    const nextSizes = resizeFromHandle({
      handleIndex,
      deltaPercentage: deltaPx / Math.max(rootSize(), 1),
      altKey,
      initialSizes: dragInitialSizes,
      panels: resolvedPanels(),
    })

    emitSizes(nextSizes)
  }

  function stopHandleDrag(): void {
    dragInitialSizes = null
    dragHandleIndex = -1
    dragState = 0
  }

  function onHandleKeyDown(handleIndex: number, event: KeyboardEvent, altKey: boolean): void {
    if (event.key === 'Enter') {
      const nextSizes = toggleHandleNearestPanel({
        handleIndex,
        initialSizes: sizes(),
        panels: resolvedPanels(),
      })
      emitSizes(nextSizes)
      event.preventDefault()
      return
    }

    let deltaPercentage: number | null = null
    const orientation = options.orientation()
    const keyboardDelta = resolveKeyboardDelta(options.keyboardDelta(), rootSize())

    if (
      (orientation === 'horizontal' && event.key === 'ArrowLeft') ||
      (orientation === 'vertical' && event.key === 'ArrowUp') ||
      event.key === 'Home'
    ) {
      deltaPercentage = event.shiftKey || event.key === 'Home' ? -1 : -keyboardDelta
    } else if (
      (orientation === 'horizontal' && event.key === 'ArrowRight') ||
      (orientation === 'vertical' && event.key === 'ArrowDown') ||
      event.key === 'End'
    ) {
      deltaPercentage = event.shiftKey || event.key === 'End' ? 1 : keyboardDelta
    }

    if (deltaPercentage === null) {
      return
    }

    const nextSizes = resizeFromHandle({
      handleIndex,
      deltaPercentage,
      altKey,
      initialSizes: sizes(),
      panels: resolvedPanels(),
    })

    emitSizes(nextSizes)
    event.preventDefault()
  }

  return {
    setRootElement,
    rootSize,
    resolvedPanels,
    sizes,
    resizeHandleByDelta,
    stopHandleDrag,
    onHandleKeyDown,
  }
}

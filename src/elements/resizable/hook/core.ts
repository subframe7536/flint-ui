import { clamp } from '@kobalte/utils'
import type { JSX } from 'solid-js'

import type { ResizableHandleOptions } from './use-resizable-handle'

export type ResizableSize = number | `${number}px`
export interface ResizablePanelItem {
  panelId?: string
  initialSize?: ResizableSize
  minSize?: ResizableSize
  maxSize?: ResizableSize
  collapsible?: boolean
  collapsedSize?: ResizableSize
  collapseThreshold?: ResizableSize
  onResize?: (size: number) => void
  onCollapse?: (size: number) => void
  onExpand?: (size: number) => void
  class?: string
  style?: JSX.CSSProperties
  content?: JSX.Element
  handle?: ResizableHandleOptions | false
}

export type ResizableResizeStrategy = 'preceding' | 'following' | 'both'

export const PRECISION = 6
export const EPSILON = 10 ** -PRECISION

export interface ResizableResolvedPanel extends Omit<
  ResizablePanelItem,
  'initialSize' | 'minSize' | 'maxSize' | 'collapsible' | 'collapsedSize' | 'collapseThreshold'
> {
  panelId: string
  initialSize?: ResizableSize
  minSize: number
  maxSize: number
  collapsible: boolean
  collapsedSize: number
  collapseThreshold: number
}

export interface ResizableHandleAria {
  controls?: string
  valueNow: number
  valueMin: number
  valueMax: number
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPSILON
}

function fixToPrecision(value: number): number {
  return Number.parseFloat(value.toFixed(PRECISION))
}

function correctRemainder(sizes: number[], total: number): void {
  const lastIndex = sizes.length - 1
  const remainder = fixToPrecision(1 - total)
  sizes[lastIndex] = fixToPrecision((sizes[lastIndex] ?? 0) + remainder)
}

export function normalizeSizeVector(sizes: number[]): number[] {
  const sizeCount = sizes.length
  if (sizeCount === 0) {
    return []
  }

  const normalized: number[] = []
  let total = 0

  for (let index = 0; index < sizeCount; index += 1) {
    const size = sizes[index]
    const clamped = isFiniteNumber(size) ? Math.max(0, size) : 0

    normalized[index] = clamped
    total += clamped
  }

  if (total <= EPSILON) {
    const equal = fixToPrecision(1 / sizeCount)
    let fallbackTotal = 0

    for (let index = 0; index < sizeCount; index += 1) {
      normalized[index] = equal
      fallbackTotal += equal
    }

    correctRemainder(normalized, fallbackTotal)
    return normalized
  }

  let normalizedTotal = 0

  for (let index = 0; index < sizeCount; index += 1) {
    const nextSize = fixToPrecision(normalized[index] / total)
    normalized[index] = nextSize
    normalizedTotal += nextSize
  }

  correctRemainder(normalized, normalizedTotal)

  return normalized
}

export function resolveSize(size: ResizableSize | undefined | null, rootSize: number): number {
  const safeRootSize = rootSize > EPSILON ? rootSize : 1

  if (size === undefined || size === null) {
    return 0
  }

  if (isFiniteNumber(size)) {
    return size
  }

  if (typeof size === 'string' && size.endsWith('px')) {
    const pixel = Number.parseFloat(size)
    if (!Number.isFinite(pixel)) {
      return 0
    }

    return fixToPrecision(pixel / safeRootSize)
  }

  return 0
}

export function resolveKeyboardDelta(delta: ResizableSize | undefined, rootSize: number): number {
  if (delta === undefined) {
    return 0.1
  }

  return resolveSize(delta, rootSize)
}

export function normalizePanelSizes(input: {
  panelCount: number
  rootSize: number
  panelInitialSizes: Array<ResizableSize | undefined>
  controlledSizes?: number[]
}): number[] {
  const { panelCount, rootSize, panelInitialSizes, controlledSizes } = input

  if (panelCount === 0) {
    return []
  }

  if (controlledSizes && controlledSizes.length > 0) {
    const aligned: number[] = []

    for (let index = 0; index < panelCount; index += 1) {
      aligned[index] = controlledSizes[index] ?? 0
    }

    return normalizeSizeVector(aligned)
  }

  const resolved: number[] = []
  let definedSum = 0
  let undefinedCount = 0

  for (let index = 0; index < panelCount; index += 1) {
    const panelSize = panelInitialSizes[index]
    if (panelSize === undefined) {
      resolved[index] = 0
      undefinedCount += 1
      continue
    }

    const size = resolveSize(panelSize, rootSize)
    resolved[index] = size
    definedSum += size
  }

  if (undefinedCount > 0) {
    const remaining = 1 - definedSum
    const fallbackSize = remaining > EPSILON ? remaining / undefinedCount : 1 / panelCount

    for (let index = 0; index < panelCount; index += 1) {
      if (resolved[index] === 0 && panelInitialSizes[index] === undefined) {
        resolved[index] = fallbackSize
      }
    }
  }

  return normalizeSizeVector(resolved)
}

export function resolvePanels(
  panels: ResizablePanelItem[] | undefined,
  rootSize: number,
  panelIdPrefix: string,
): ResizableResolvedPanel[] {
  return (panels ?? []).map((panel, index) => {
    const minSize = clamp(resolveSize(panel.minSize ?? 0, rootSize), 0, 1)
    const maxSize = clamp(resolveSize(panel.maxSize ?? 1, rootSize), minSize, 1)
    const collapsedSize = clamp(resolveSize(panel.collapsedSize ?? 0, rootSize), 0, minSize)
    const collapseThreshold = clamp(
      resolveSize(panel.collapseThreshold ?? 0.05, rootSize),
      0,
      Math.max(0, minSize - collapsedSize),
    )

    return Object.assign({}, panel, {
      panelId: panel.panelId ?? `${panelIdPrefix}-panel-${index + 1}`,
      initialSize: panel.initialSize,
      minSize,
      maxSize,
      collapsible: panel.collapsible === true,
      collapsedSize,
      collapseThreshold,
    })
  })
}

export function isPanelCollapsed(size: number, panel: ResizableResolvedPanel): boolean {
  return panel.collapsible && nearlyEqual(size, panel.collapsedSize)
}

export function getHandleAria(input: {
  handleIndex: number
  sizes: number[]
  panels: ResizableResolvedPanel[]
}): ResizableHandleAria {
  const { handleIndex, sizes, panels } = input
  let valueNow = 0
  let valueMin = 0
  let followingMin = 0

  for (let index = 0; index <= handleIndex; index += 1) {
    valueNow += sizes[index] ?? 0
    valueMin += panels[index]?.minSize ?? 0
  }

  for (let index = handleIndex + 1; index < panels.length; index += 1) {
    followingMin += panels[index]?.minSize ?? 0
  }

  return {
    controls: panels[handleIndex]?.panelId,
    valueNow: fixToPrecision(valueNow),
    valueMin: fixToPrecision(valueMin),
    valueMax: fixToPrecision(1 - followingMin),
  }
}

interface IndexSpan {
  start: number
  end: number
}

function createIndexSpan(start: number, end: number): IndexSpan {
  return { start, end }
}

function getIndexSpanLength(span: IndexSpan): number {
  return span.end < span.start ? 0 : span.end - span.start + 1
}

function getIndexSpanIndex(span: IndexSpan, offset: number): number {
  return span.start + offset
}

function copySizesForSpan(initialSizes: number[], span: IndexSpan): number[] {
  const spanLength = getIndexSpanLength(span)
  const copiedSizes: number[] = []

  for (let offset = 0; offset < spanLength; offset += 1) {
    copiedSizes[offset] = initialSizes[getIndexSpanIndex(span, offset)] ?? 0
  }

  return copiedSizes
}

function applyDistributedSizes(
  nextSizes: number[],
  span: IndexSpan,
  distributedSizes: number[],
): void {
  const spanLength = getIndexSpanLength(span)

  for (let offset = 0; offset < spanLength; offset += 1) {
    nextSizes[getIndexSpanIndex(span, offset)] = distributedSizes[offset]
  }
}

interface ResizeAction {
  precedingRange: IndexSpan
  followingRange: IndexSpan
  negate?: boolean
}

interface ResizeApplyAction extends ResizeAction {
  deltaPercentage: number
}

const RESIZE_DIRECTION_FLAG_PRECEDING = 1 << 0
const RESIZE_DIRECTION_FLAG_INCREASING = 1 << 1
type ResizeDirection = 0 | 1 | 2 | 3

function getResizeDirection(
  side: 'preceding' | 'following',
  desiredPercentage: number,
): ResizeDirection {
  let direction = 0

  if (side === 'preceding') {
    direction |= RESIZE_DIRECTION_FLAG_PRECEDING
  }

  const shouldIncrease = (side === 'preceding') === desiredPercentage >= 0
  if (shouldIncrease) {
    direction |= RESIZE_DIRECTION_FLAG_INCREASING
  }

  return direction as ResizeDirection
}

function isPrecedingDirection(direction: ResizeDirection): boolean {
  return (direction & RESIZE_DIRECTION_FLAG_PRECEDING) !== 0
}

function isIncreasingDirection(direction: ResizeDirection): boolean {
  return (direction & RESIZE_DIRECTION_FLAG_INCREASING) !== 0
}

function applyDistributedSizeChange(input: {
  resizeDirection: ResizeDirection
  distributedPercentage: number
  panelSize: number
  previousSize: number
  nextSize: number
}): number {
  const previousDelta = input.previousSize - input.panelSize
  const nextDelta = input.nextSize - input.panelSize

  if (isPrecedingDirection(input.resizeDirection)) {
    return input.distributedPercentage + (nextDelta - previousDelta)
  }

  return input.distributedPercentage - (nextDelta - previousDelta)
}

function resolveExpandedSize(input: {
  resizeDirection: ResizeDirection
  panel: ResizableResolvedPanel
  panelSize: number
  availablePercentage: number
}): { nextSize: number; collapsed: boolean } {
  let nextSize = input.panel.minSize
  let collapsed = false

  if (Math.abs(input.availablePercentage) >= input.panel.minSize - input.panel.collapsedSize) {
    if (isPrecedingDirection(input.resizeDirection)) {
      nextSize = Math.min(input.panel.maxSize, input.panelSize + input.availablePercentage)
    } else {
      nextSize = Math.min(input.panel.maxSize, input.panelSize - input.availablePercentage)
    }
  } else {
    collapsed = true
  }

  return { nextSize, collapsed }
}

interface DistributePercentageInput {
  desiredPercentage: number
  side: 'preceding' | 'following'
  range: IndexSpan
  initialSizes: number[]
  panels: ResizableResolvedPanel[]
  collapsible: boolean
}

function distributePercentage(input: DistributePercentageInput): [number, number[], boolean] {
  const desiredPercentage = fixToPrecision(input.desiredPercentage)
  const spanLength = getIndexSpanLength(input.range)
  if (spanLength === 0) {
    return [0, [], false]
  }

  const resizeDirection = getResizeDirection(input.side, desiredPercentage)
  const precedingDirection = isPrecedingDirection(resizeDirection)
  const increasingDirection = isIncreasingDirection(resizeDirection)
  const pointerStep = precedingDirection ? -1 : 1
  const pointerEnd = precedingDirection ? -1 : spanLength
  let distributedPercentage = 0
  const distributedSizes = copySizesForSpan(input.initialSizes, input.range)

  for (
    let pointer = precedingDirection ? spanLength - 1 : 0;
    pointer !== pointerEnd;
    pointer += pointerStep
  ) {
    const panelIndex = getIndexSpanIndex(input.range, pointer)
    const panel = input.panels[panelIndex]
    const panelSize = input.initialSizes[panelIndex] ?? 0

    if (!panel) {
      continue
    }

    if (panel.collapsible && nearlyEqual(panelSize, panel.collapsedSize)) {
      continue
    }

    const availablePercentage = fixToPrecision(desiredPercentage - distributedPercentage)

    if (nearlyEqual(availablePercentage, 0)) {
      break
    }

    const boundarySize = increasingDirection ? panel.maxSize : panel.minSize
    const signedAvailable = precedingDirection ? availablePercentage : -availablePercentage
    const nextSize = increasingDirection
      ? Math.min(boundarySize, panelSize + signedAvailable)
      : Math.max(boundarySize, panelSize + signedAvailable)

    distributedSizes[pointer] = nextSize
    const delta = nextSize - panelSize
    distributedPercentage += precedingDirection ? delta : -delta
  }

  distributedPercentage = fixToPrecision(distributedPercentage)

  if (!input.collapsible || nearlyEqual(distributedPercentage, desiredPercentage)) {
    return [distributedPercentage, distributedSizes, false]
  }

  const targetPointer = precedingDirection ? spanLength - 1 : 0
  const panelIndex = getIndexSpanIndex(input.range, targetPointer)
  const panel = input.panels[panelIndex]

  if (!panel || !panel.collapsible) {
    return [distributedPercentage, distributedSizes, false]
  }

  const availablePercentage = fixToPrecision(desiredPercentage - distributedPercentage)
  const panelSize = input.initialSizes[panelIndex] ?? 0
  const collapsedSize = panel.collapsedSize
  const minSize = panel.minSize
  const collapseThreshold = Math.min(panel.collapseThreshold, Math.max(0, minSize - collapsedSize))
  const isCollapsed = nearlyEqual(panelSize, collapsedSize)
  let collapsed = false

  if (Math.abs(availablePercentage) < collapseThreshold) {
    return [fixToPrecision(distributedPercentage), distributedSizes, false]
  }

  if (!increasingDirection && !isCollapsed) {
    const previousSize = distributedSizes[targetPointer] ?? panelSize
    distributedSizes[targetPointer] = collapsedSize
    distributedPercentage = applyDistributedSizeChange({
      resizeDirection,
      distributedPercentage,
      panelSize,
      previousSize,
      nextSize: collapsedSize,
    })
    collapsed = true
  } else if (increasingDirection && isCollapsed) {
    const previousSize = distributedSizes[targetPointer] ?? panelSize
    const expanded = resolveExpandedSize({
      resizeDirection,
      panel,
      panelSize,
      availablePercentage,
    })

    distributedSizes[targetPointer] = expanded.nextSize
    distributedPercentage = applyDistributedSizeChange({
      resizeDirection,
      distributedPercentage,
      panelSize,
      previousSize,
      nextSize: expanded.nextSize,
    })
    collapsed = expanded.collapsed
  }

  return [fixToPrecision(distributedPercentage), distributedSizes, collapsed]
}

interface DistributableInput {
  desiredPercentage: number
  initialSizes: number[]
  panels: ResizableResolvedPanel[]
  collapsible: boolean
  actions: ResizeAction[]
}

function getDistributablePercentage(input: DistributableInput): number {
  if (input.actions.length === 0) {
    return 0
  }

  let distributablePercentage =
    input.desiredPercentage >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
  const nextSizes = [...input.initialSizes]

  for (const action of input.actions) {
    const desiredPercentage = action.negate ? -input.desiredPercentage : input.desiredPercentage

    let [precedingPercentage, precedingSizes, collapsedPreceding] = distributePercentage({
      desiredPercentage,
      side: 'preceding',
      range: action.precedingRange,
      initialSizes: nextSizes,
      panels: input.panels,
      collapsible: input.collapsible,
    })

    let [followingPercentage, followingSizes, collapsedFollowing] = distributePercentage({
      desiredPercentage,
      side: 'following',
      range: action.followingRange,
      initialSizes: nextSizes,
      panels: input.panels,
      collapsible: input.collapsible,
    })

    if (action.negate) {
      precedingPercentage = -precedingPercentage
      followingPercentage = -followingPercentage
    }

    if (collapsedPreceding) {
      followingPercentage = precedingPercentage
    }

    if (collapsedFollowing) {
      precedingPercentage = followingPercentage
    }

    distributablePercentage =
      input.desiredPercentage >= 0
        ? Math.min(distributablePercentage, Math.min(precedingPercentage, followingPercentage))
        : Math.max(distributablePercentage, Math.max(precedingPercentage, followingPercentage))

    applyDistributedSizes(nextSizes, action.precedingRange, precedingSizes)
    applyDistributedSizes(nextSizes, action.followingRange, followingSizes)
  }

  if (!Number.isFinite(distributablePercentage)) {
    return 0
  }

  return fixToPrecision(distributablePercentage)
}

interface ResizeApplyInput {
  initialSizes: number[]
  panels: ResizableResolvedPanel[]
  collapsible: boolean
  actions: ResizeApplyAction[]
}

function applyResize(input: ResizeApplyInput): number[] {
  const nextSizes = [...input.initialSizes]

  for (const action of input.actions) {
    const [, precedingSizes] = distributePercentage({
      desiredPercentage: action.deltaPercentage,
      side: 'preceding',
      range: action.precedingRange,
      initialSizes: nextSizes,
      panels: input.panels,
      collapsible: input.collapsible,
    })

    const [, followingSizes] = distributePercentage({
      desiredPercentage: action.deltaPercentage,
      side: 'following',
      range: action.followingRange,
      initialSizes: nextSizes,
      panels: input.panels,
      collapsible: input.collapsible,
    })

    applyDistributedSizes(nextSizes, action.precedingRange, precedingSizes)
    applyDistributedSizes(nextSizes, action.followingRange, followingSizes)
  }

  return normalizeSizeVector(nextSizes)
}

export function resizeFromHandle(input: {
  handleIndex: number
  deltaPercentage: number
  altKey: boolean
  initialSizes: number[]
  panels: ResizableResolvedPanel[]
}): number[] {
  const panelCount = input.panels.length

  if (panelCount <= 1 || input.handleIndex < 0 || input.handleIndex >= panelCount - 1) {
    return normalizeSizeVector(input.initialSizes)
  }

  if (input.altKey && panelCount > 2) {
    let panelIndex = input.handleIndex
    let deltaPercentage = input.deltaPercentage

    const isPrecedingHandle = panelIndex === 0
    if (isPrecedingHandle) {
      panelIndex += 1
      deltaPercentage = -deltaPercentage
    }

    const panel = input.panels[panelIndex]
    const panelSize = input.initialSizes[panelIndex] ?? 0
    const minDelta = panel.minSize - panelSize
    const maxDelta = panel.maxSize - panelSize
    const cappedDelta = clamp(deltaPercentage * 2, minDelta, maxDelta) / 2

    const precedingRange = createIndexSpan(0, panelIndex - 1)
    const followingRange = createIndexSpan(panelIndex + 1, panelCount - 1)
    const precedingRangeWithPanel = createIndexSpan(0, panelIndex)
    const followingRangeWithPanel = createIndexSpan(panelIndex, panelCount - 1)

    const distributablePercentage = getDistributablePercentage({
      desiredPercentage: cappedDelta,
      initialSizes: input.initialSizes,
      panels: input.panels,
      collapsible: false,
      actions: [
        {
          precedingRange: precedingRangeWithPanel,
          followingRange,
        },
        {
          precedingRange,
          followingRange: followingRangeWithPanel,
          negate: true,
        },
      ],
    })

    return applyResize({
      initialSizes: input.initialSizes,
      panels: input.panels,
      collapsible: false,
      actions: [
        {
          precedingRange: precedingRangeWithPanel,
          followingRange,
          deltaPercentage: distributablePercentage,
        },
        {
          precedingRange,
          followingRange: followingRangeWithPanel,
          deltaPercentage: -distributablePercentage,
        },
      ],
    })
  }

  const precedingRange = createIndexSpan(0, input.handleIndex)
  const followingRange = createIndexSpan(input.handleIndex + 1, panelCount - 1)

  const distributablePercentage = getDistributablePercentage({
    desiredPercentage: input.deltaPercentage,
    initialSizes: input.initialSizes,
    panels: input.panels,
    collapsible: true,
    actions: [
      {
        precedingRange,
        followingRange,
      },
    ],
  })

  return applyResize({
    initialSizes: input.initialSizes,
    panels: input.panels,
    collapsible: true,
    actions: [
      {
        precedingRange,
        followingRange,
        deltaPercentage: distributablePercentage,
      },
    ],
  })
}

function resizePanelByDelta(input: {
  panelIndex: number
  deltaPercentage: number
  strategy: ResizableResizeStrategy
  initialSizes: number[]
  panels: ResizableResolvedPanel[]
  collapsible: boolean
}): number[] {
  const panelCount = input.panels.length
  const targetPanel = input.panels[input.panelIndex]

  if (!targetPanel) {
    return normalizeSizeVector(input.initialSizes)
  }

  let strategy = input.strategy

  if (input.panelIndex === 0) {
    strategy = 'following'
  } else if (input.panelIndex === panelCount - 1) {
    strategy = 'preceding'
  }

  const precedingRange = createIndexSpan(0, input.panelIndex - 1)
  const followingRange = createIndexSpan(input.panelIndex + 1, panelCount - 1)

  if (strategy === 'both') {
    const precedingRangeWithPanel = createIndexSpan(0, input.panelIndex)
    const followingRangeWithPanel = createIndexSpan(input.panelIndex, panelCount - 1)

    const distributablePercentage = getDistributablePercentage({
      desiredPercentage: input.deltaPercentage / 2,
      initialSizes: input.initialSizes,
      panels: input.panels,
      collapsible: input.collapsible,
      actions: [
        {
          precedingRange: precedingRangeWithPanel,
          followingRange,
        },
        {
          precedingRange,
          followingRange: followingRangeWithPanel,
          negate: true,
        },
      ],
    })

    return applyResize({
      initialSizes: input.initialSizes,
      panels: input.panels,
      collapsible: input.collapsible,
      actions: [
        {
          precedingRange: precedingRangeWithPanel,
          followingRange,
          deltaPercentage: distributablePercentage,
        },
        {
          precedingRange,
          followingRange: followingRangeWithPanel,
          deltaPercentage: -distributablePercentage,
        },
      ],
    })
  }

  let desiredPercentage = input.deltaPercentage
  const adjustedPreceding =
    strategy === 'preceding' ? precedingRange : createIndexSpan(0, input.panelIndex)
  const adjustedFollowing =
    strategy === 'following' ? followingRange : createIndexSpan(input.panelIndex, panelCount - 1)

  if (strategy === 'preceding') {
    desiredPercentage = -desiredPercentage
  }

  const distributablePercentage = getDistributablePercentage({
    desiredPercentage,
    initialSizes: input.initialSizes,
    panels: input.panels,
    collapsible: input.collapsible,
    actions: [
      {
        precedingRange: adjustedPreceding,
        followingRange: adjustedFollowing,
      },
    ],
  })

  return applyResize({
    initialSizes: input.initialSizes,
    panels: input.panels,
    collapsible: input.collapsible,
    actions: [
      {
        precedingRange: adjustedPreceding,
        followingRange: adjustedFollowing,
        deltaPercentage: distributablePercentage,
      },
    ],
  })
}

export function resizePanelToSize(input: {
  panelIndex: number
  size: ResizableSize
  strategy: ResizableResizeStrategy
  initialSizes: number[]
  panels: ResizableResolvedPanel[]
  rootSize: number
}): number[] {
  const panel = input.panels[input.panelIndex]
  if (!panel) {
    return normalizeSizeVector(input.initialSizes)
  }

  const requestedSize = resolveSize(input.size, input.rootSize)
  const allowedSize = clamp(requestedSize, panel.minSize, panel.maxSize)
  const deltaPercentage = allowedSize - (input.initialSizes[input.panelIndex] ?? 0)

  return resizePanelByDelta({
    panelIndex: input.panelIndex,
    deltaPercentage,
    strategy: input.strategy,
    initialSizes: input.initialSizes,
    panels: input.panels,
    collapsible: false,
  })
}

export function collapsePanel(input: {
  panelIndex: number
  strategy: ResizableResizeStrategy
  initialSizes: number[]
  panels: ResizableResolvedPanel[]
}): number[] {
  const panel = input.panels[input.panelIndex]
  if (!panel) {
    return normalizeSizeVector(input.initialSizes)
  }

  const panelSize = input.initialSizes[input.panelIndex] ?? 0
  if (!panel.collapsible || nearlyEqual(panelSize, panel.collapsedSize)) {
    return normalizeSizeVector(input.initialSizes)
  }

  return resizePanelByDelta({
    panelIndex: input.panelIndex,
    deltaPercentage: panel.collapsedSize - panelSize,
    strategy: input.strategy,
    initialSizes: input.initialSizes,
    panels: input.panels,
    collapsible: true,
  })
}

export function expandPanel(input: {
  panelIndex: number
  strategy: ResizableResizeStrategy
  initialSizes: number[]
  panels: ResizableResolvedPanel[]
}): number[] {
  const panel = input.panels[input.panelIndex]
  if (!panel) {
    return normalizeSizeVector(input.initialSizes)
  }

  const panelSize = input.initialSizes[input.panelIndex] ?? 0
  if (!panel.collapsible || !nearlyEqual(panelSize, panel.collapsedSize)) {
    return normalizeSizeVector(input.initialSizes)
  }

  return resizePanelByDelta({
    panelIndex: input.panelIndex,
    deltaPercentage: panel.minSize - panelSize,
    strategy: input.strategy,
    initialSizes: input.initialSizes,
    panels: input.panels,
    collapsible: true,
  })
}

export function toggleHandleNearestPanel(input: {
  handleIndex: number
  initialSizes: number[]
  panels: ResizableResolvedPanel[]
}): number[] {
  const precedingPanel = input.panels[input.handleIndex]
  const followingPanel = input.panels[input.handleIndex + 1]

  const panelIndex =
    precedingPanel?.collapsible === true
      ? input.handleIndex
      : followingPanel?.collapsible === true
        ? input.handleIndex + 1
        : -1

  if (panelIndex < 0) {
    return normalizeSizeVector(input.initialSizes)
  }

  const panel = input.panels[panelIndex]!
  const panelSize = input.initialSizes[panelIndex] ?? 0

  if (nearlyEqual(panelSize, panel.collapsedSize)) {
    return expandPanel({
      panelIndex,
      strategy: 'following',
      initialSizes: input.initialSizes,
      panels: input.panels,
    })
  }

  return collapsePanel({
    panelIndex,
    strategy: 'following',
    initialSizes: input.initialSizes,
    panels: input.panels,
  })
}

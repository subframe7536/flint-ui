import type { JSX } from 'solid-js'
import { For, Show, createMemo, mergeProps } from 'solid-js'

import type { SlotClasses } from '../../shared/slot-class'
import { cn, useId } from '../../shared/utils'

import { getHandleAria, isPanelCollapsed } from './hook/core'
import type { ResizablePanelItem, ResizableSize } from './hook/core'
import { RESIZABLE_HANDLE_TARGET_END, RESIZABLE_HANDLE_TARGET_START } from './hook/handle-manager'
import { useResizableController } from './hook/use-resizable-controller'
import { useResizableHandle } from './hook/use-resizable-handle'
import type { ResizableHandleOptions } from './hook/use-resizable-handle'
import {
  resizableCrossTargetVariants,
  resizableHandleVariants,
  resizableRootVariants,
} from './resizable.class'
import type { ResizableVariantProps } from './resizable.class'

type ResizableSlots = 'root' | 'panel' | 'handle' | 'handleInner' | 'crossTarget'

export type ResizableClasses = SlotClasses<ResizableSlots>

export interface ResizableProps extends ResizableVariantProps {
  panels?: ResizablePanelItem[]
  sizes?: number[]
  onSizesChange?: (sizes: number[]) => void
  keyboardDelta?: ResizableSize
  withHandle?: boolean
  handleProps?: ResizableHandleOptions
  classes?: ResizableClasses
  id?: string
}

export function Resizable(props: ResizableProps): JSX.Element {
  const localProps = mergeProps(
    {
      orientation: 'horizontal' as const,
      keyboardDelta: 0.1 as const,
      withHandle: false,
    },
    props,
  ) as ResizableProps

  const panelIdPrefix = useId(() => localProps.id, 'resizable')

  const controller = useResizableController({
    orientation: () => localProps.orientation!,
    panels: () => localProps.panels ?? [],
    controlledSizes: () => localProps.sizes,
    keyboardDelta: () => localProps.keyboardDelta,
    panelIdPrefix,
    onSizesChange: (sizes) => localProps.onSizesChange?.(sizes),
  })

  const orientation = () => localProps.orientation!

  return (
    <div
      ref={controller.setRootElement}
      id={localProps.id}
      data-slot="root"
      data-resizable-root
      data-orientation={localProps.orientation}
      class={resizableRootVariants({ orientation: orientation() }, localProps.classes?.root)}
    >
      <For each={controller.resolvedPanels()}>
        {(panel, index) => {
          const panelSize = () => controller.sizes()[index()] ?? 0
          const collapsed = () => isPanelCollapsed(panelSize(), panel)
          const shouldRenderHandle = () =>
            index() < controller.resolvedPanels().length - 1 && panel.handle !== false
          const mergedHandleOptions = createMemo<ResizableHandleOptions | undefined>(() => {
            if (panel.handle === false) {
              return undefined
            }

            return Object.assign({}, localProps.handleProps, panel.handle)
          })
          const handleDisabled = createMemo(() => mergedHandleOptions()?.disabled === true)
          const handleTabIndex = createMemo(() => {
            const value = mergedHandleOptions()?.tabIndex
            if (typeof value === 'number') {
              return value
            }

            return handleDisabled() ? -1 : 0
          })
          const showInnerHandle = createMemo(
            () => mergedHandleOptions()?.withHandle ?? localProps.withHandle ?? false,
          )
          const bindings = useResizableHandle({
            handleIndex: index,
            orientation,
            options: mergedHandleOptions,
            onDrag: controller.resizeHandleByDelta,
            onDragEnd: controller.stopHandleDrag,
            onKeyDown: controller.onHandleKeyDown,
          })
          const aria = createMemo(() =>
            getHandleAria({
              handleIndex: index(),
              sizes: controller.sizes(),
              panels: controller.resolvedPanels(),
            }),
          )

          return (
            <>
              <div
                id={panel.panelId}
                data-slot="panel"
                data-orientation={localProps.orientation}
                data-collapsed={collapsed() ? '' : undefined}
                data-expanded={panel.collapsible && !collapsed() ? '' : undefined}
                class={cn('min-h-0 min-w-0 overflow-auto', localProps.classes?.panel, panel.class)}
                style={{
                  'flex-basis': `${panelSize() * 100}%`,
                  ...panel.style,
                }}
              >
                {panel.content}
              </div>

              <Show when={shouldRenderHandle()}>
                <div
                  ref={bindings.setElement}
                  role="separator"
                  aria-controls={aria().controls}
                  aria-orientation={orientation()}
                  aria-valuemin={aria().valueMin}
                  aria-valuemax={aria().valueMax}
                  aria-valuenow={aria().valueNow}
                  aria-disabled={handleDisabled() ? 'true' : undefined}
                  tabIndex={handleTabIndex()}
                  data-slot="handle"
                  data-orientation={orientation()}
                  data-active={bindings.active() ? '' : undefined}
                  data-dragging={bindings.dragging() ? '' : undefined}
                  class={resizableHandleVariants(
                    { orientation: orientation() },
                    localProps.classes?.handle,
                    mergedHandleOptions()?.class,
                  )}
                  onMouseEnter={bindings.onMouseEnter}
                  onMouseLeave={bindings.onMouseLeave}
                  onFocus={bindings.onFocus}
                  onBlur={bindings.onBlur}
                  onKeyDown={bindings.onKeyDown}
                  onKeyUp={bindings.onKeyUp}
                  onPointerDown={bindings.onPointerDown}
                  {...mergedHandleOptions()}
                >
                  <Show when={bindings.startIntersectionVisible()}>
                    <div
                      data-slot="cross-target"
                      data-resizable-handle-start-target
                      data-cross={bindings.cross() ? '' : undefined}
                      class={resizableCrossTargetVariants(
                        { orientation: orientation(), target: 'startIntersection' },
                        localProps.classes?.crossTarget,
                      )}
                      onMouseEnter={() =>
                        bindings.onIntersectionMouseEnter(RESIZABLE_HANDLE_TARGET_START)
                      }
                      onMouseLeave={bindings.onIntersectionMouseLeave}
                    />
                  </Show>

                  <Show when={showInnerHandle()}>
                    <div
                      data-slot="handle-inner"
                      class={cn(
                        'z-10 h-6 w-1 rounded-lg bg-border/90 pointer-events-none flex shrink-0',
                        orientation() === 'horizontal' ? 'mx-auto' : 'rotate-90',
                        localProps.classes?.handleInner,
                      )}
                    />
                  </Show>

                  <Show when={bindings.endIntersectionVisible()}>
                    <div
                      data-slot="cross-target"
                      data-resizable-handle-end-target
                      data-cross={bindings.cross() ? '' : undefined}
                      class={resizableCrossTargetVariants(
                        { orientation: orientation(), target: 'endIntersection' },
                        localProps.classes?.crossTarget,
                      )}
                      onMouseEnter={() =>
                        bindings.onIntersectionMouseEnter(RESIZABLE_HANDLE_TARGET_END)
                      }
                      onMouseLeave={bindings.onIntersectionMouseLeave}
                    />
                  </Show>
                </div>
              </Show>
            </>
          )
        }}
      </For>
    </div>
  )
}

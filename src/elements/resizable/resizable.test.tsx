import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, test, vi } from 'vitest'

import { Resizable } from './resizable'

if (!(globalThis as Record<string, unknown>).ResizeObserver) {
  ;(globalThis as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

function createRect(input: { top: number; right: number; bottom: number; left: number }): DOMRect {
  const { top, right, bottom, left } = input

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    top,
    right,
    bottom,
    left,
    toJSON: () => ({}),
  } as DOMRect
}

describe('Resizable', () => {
  test('renders panels and auto inserts handles between panels', () => {
    const screen = render(() => (
      <Resizable panels={[{ content: 'Left' }, { content: 'Center' }, { content: 'Right' }]} />
    ))

    const panels = screen.container.querySelectorAll('[data-slot="panel"]')
    const handles = screen.container.querySelectorAll('[data-slot="handle"]')

    expect(panels).toHaveLength(3)
    expect(handles).toHaveLength(2)
    expect(handles[0]?.getAttribute('role')).toBe('separator')
  })

  test('supports vertical orientation classes', () => {
    const screen = render(() => (
      <Resizable orientation="vertical" panels={[{ content: 'Top' }, { content: 'Bottom' }]} />
    ))

    const root = screen.container.querySelector('[data-slot="root"]')
    const handle = screen.container.querySelector('[data-slot="handle"]')

    expect(root?.getAttribute('data-orientation')).toBe('vertical')
    expect(root?.className).toContain('flex-col')
    expect(handle?.className).toContain('cursor-row-resize')
  })

  test('allows disabling an auto handle via panel config', () => {
    const screen = render(() => (
      <Resizable
        panels={[{ content: 'One', handle: false }, { content: 'Two' }, { content: 'Three' }]}
      />
    ))

    const handles = screen.container.querySelectorAll('[data-slot="handle"]')
    expect(handles).toHaveLength(1)
  })

  test('applies class overrides and supports per-handle options', () => {
    const screen = render(() => (
      <Resizable
        withHandle
        classes={{
          root: 'root-override',
          panel: 'panel-override',
          handle: 'handle-override',
          handleInner: 'handle-inner-override',
        }}
        panels={[
          { content: 'A', class: 'panel-a' },
          {
            content: 'B',
            handle: {
              class: 'handle-b',
              withHandle: false,
            },
          },
          { content: 'C' },
        ]}
      />
    ))

    const root = screen.container.querySelector('[data-slot="root"]')
    const panels = screen.container.querySelectorAll('[data-slot="panel"]')
    const handles = screen.container.querySelectorAll('[data-slot="handle"]')
    const handleInners = screen.container.querySelectorAll('[data-slot="handle-inner"]')

    expect(root?.className).toContain('root-override')
    expect(panels[0]?.className).toContain('panel-override')
    expect(panels[0]?.className).toContain('panel-a')
    expect(handles[0]?.className).toContain('handle-override')
    expect(handles[1]?.className).toContain('handle-b')
    expect(handleInners).toHaveLength(1)
    expect(handleInners[0]?.className).toContain('handle-inner-override')
  })

  test('emits onSizesChange from keyboard resizing in controlled mode', async () => {
    const onSizesChange = vi.fn()

    const screen = render(() => (
      <Resizable
        sizes={[0.5, 0.5]}
        onSizesChange={onSizesChange}
        panels={[
          { content: 'Left', minSize: 0.2 },
          { content: 'Right', minSize: 0.2 },
        ]}
      />
    ))

    const handle = screen.container.querySelector('[data-slot="handle"]') as HTMLElement
    await fireEvent.keyDown(handle, { key: 'ArrowRight' })

    expect(onSizesChange).toHaveBeenCalled()

    const nextSizes = onSizesChange.mock.calls.at(-1)?.[0] as number[] | undefined
    expect(Array.isArray(nextSizes)).toBe(true)
    expect((nextSizes?.[0] ?? 0) > 0.5).toBe(true)
    expect((nextSizes?.[1] ?? 1) < 0.5).toBe(true)
  })

  test('preserves resize behavior when toggling between controlled and uncontrolled mode', async () => {
    const onSizesChange = vi.fn()

    const TestHarness = () => {
      const [controlled, setControlled] = createSignal(true)
      const [sizes, setSizes] = createSignal([0.7, 0.3])

      return (
        <div>
          <button
            type="button"
            data-slot="toggle-control"
            onClick={() => setControlled((prev) => !prev)}
          >
            Toggle Control
          </button>
          <Resizable
            sizes={controlled() ? sizes() : undefined}
            onSizesChange={(nextSizes) => {
              onSizesChange(nextSizes)
              setSizes(nextSizes)
            }}
            panels={[
              { content: 'Left', minSize: 0.2 },
              { content: 'Right', minSize: 0.2 },
            ]}
          />
        </div>
      )
    }

    const screen = render(() => <TestHarness />)

    const toggleButton = screen.container.querySelector(
      '[data-slot="toggle-control"]',
    ) as HTMLButtonElement
    const handle = screen.container.querySelector('[data-slot="handle"]') as HTMLElement
    const panel = screen.container.querySelector('[data-slot="panel"]') as HTMLElement

    expect(panel.style.flexBasis).toBe('70%')

    await fireEvent.keyDown(handle, { key: 'ArrowRight' })
    const controlledNextSizes = onSizesChange.mock.calls.at(-1)?.[0] as number[] | undefined
    expect(Array.isArray(controlledNextSizes)).toBe(true)
    expect((controlledNextSizes?.[0] ?? 0) > 0.7).toBe(true)

    await fireEvent.click(toggleButton)
    const basisAfterToggle = Number.parseFloat(panel.style.flexBasis)
    expect(Number.isFinite(basisAfterToggle)).toBe(true)
    expect(basisAfterToggle > 0 && basisAfterToggle < 100).toBe(true)

    await fireEvent.keyDown(handle, { key: 'ArrowLeft' })
    const uncontrolledNextSizes = onSizesChange.mock.calls.at(-1)?.[0] as number[] | undefined
    expect(Array.isArray(uncontrolledNextSizes)).toBe(true)
    expect(uncontrolledNextSizes).toHaveLength(2)
    expect(((uncontrolledNextSizes?.[0] ?? 0) + (uncontrolledNextSizes?.[1] ?? 0)).toFixed(6)).toBe(
      '1.000000',
    )

    await fireEvent.click(toggleButton)
    expect(Number.parseFloat(panel.style.flexBasis)).toBeCloseTo(
      (uncontrolledNextSizes?.[0] ?? 0) * 100,
      4,
    )
  })

  test('toggles nearest collapsible panel by Enter key', async () => {
    const onCollapse = vi.fn()
    const onExpand = vi.fn()

    const screen = render(() => (
      <Resizable
        panels={[
          {
            content: 'Left',
            collapsible: true,
            minSize: 0.2,
            collapsedSize: 0,
            onCollapse,
            onExpand,
          },
          { content: 'Right', minSize: 0.2 },
        ]}
      />
    ))

    const handle = screen.container.querySelector('[data-slot="handle"]') as HTMLElement
    const panel = screen.container.querySelector('[data-slot="panel"]')

    await fireEvent.keyDown(handle, { key: 'Enter' })

    expect(panel?.getAttribute('data-collapsed')).toBe('')
    expect(onCollapse).toHaveBeenCalled()

    await fireEvent.keyDown(handle, { key: 'Enter' })

    expect(panel?.getAttribute('data-collapsed')).toBeNull()
    expect(onExpand).toHaveBeenCalled()
  })

  test('fires handle drag callbacks', async () => {
    const onHandleDrag = vi.fn()
    const onHandleDragEnd = vi.fn()

    const screen = render(() => (
      <Resizable
        handleProps={{ onHandleDrag, onHandleDragEnd }}
        panels={[{ content: 'Left' }, { content: 'Right' }]}
      />
    ))

    const handle = screen.container.querySelector('[data-slot="handle"]') as HTMLElement

    await fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0, clientY: 0 })
    await fireEvent.pointerMove(window, { pointerId: 1, clientX: 40, clientY: 0, altKey: true })
    await fireEvent.pointerUp(window, { pointerId: 1, clientX: 40, clientY: 0 })

    expect(onHandleDrag).toHaveBeenCalled()
    expect(onHandleDragEnd).toHaveBeenCalled()
  })

  test('supports nested resizable panels', async () => {
    const screen = render(() => (
      <Resizable
        panels={[
          { content: 'Outer Left' },
          {
            content: (
              <Resizable
                orientation="vertical"
                panels={[{ content: 'Inner Top' }, { content: 'Inner Bottom' }]}
              />
            ),
          },
        ]}
      />
    ))

    const roots = screen.container.querySelectorAll('[data-slot="root"]')
    const handles = screen.container.querySelectorAll('[data-slot="handle"]')

    expect(roots).toHaveLength(2)
    expect(handles).toHaveLength(2)
    const [outerHandle, innerHandle] = Array.from(handles) as HTMLButtonElement[]

    Object.defineProperty(outerHandle, 'getBoundingClientRect', {
      value: () => createRect({ top: 0, right: 101, bottom: 200, left: 100 }),
      configurable: true,
    })
    Object.defineProperty(innerHandle, 'getBoundingClientRect', {
      value: () => createRect({ top: 80, right: 220, bottom: 81, left: 101 }),
      configurable: true,
    })

    const { refreshResizableHandleIntersections } = await import('./hook/handle-manager')
    refreshResizableHandleIntersections()
    await Promise.resolve()

    const crossTargets = screen.container.querySelectorAll('[data-slot="cross-target"]')
    expect(crossTargets.length).toBeGreaterThan(0)
    const hasEdgeTarget = Array.from(crossTargets).some(
      (target) =>
        target.hasAttribute('data-resizable-handle-start-target') ||
        target.hasAttribute('data-resizable-handle-end-target'),
    )
    expect(hasEdgeTarget).toBe(true)
  })

  test('marks all affected handles as active when hovering cross-target', async () => {
    const screen = render(() => (
      <Resizable
        panels={[
          { content: 'Outer Left' },
          {
            content: (
              <Resizable
                orientation="vertical"
                panels={[{ content: 'Inner Top' }, { content: 'Inner Bottom' }]}
              />
            ),
          },
        ]}
      />
    ))

    const handles = screen.container.querySelectorAll('[data-slot="handle"]')
    const [outerHandle, innerHandle] = Array.from(handles) as HTMLButtonElement[]

    Object.defineProperty(outerHandle, 'getBoundingClientRect', {
      value: () => createRect({ top: 0, right: 101, bottom: 200, left: 100 }),
      configurable: true,
    })
    Object.defineProperty(innerHandle, 'getBoundingClientRect', {
      value: () => createRect({ top: 80, right: 220, bottom: 81, left: 101 }),
      configurable: true,
    })

    const { refreshResizableHandleIntersections } = await import('./hook/handle-manager')
    refreshResizableHandleIntersections()
    await Promise.resolve()

    const crossTarget = innerHandle.querySelector('[data-slot="cross-target"]') as HTMLElement
    expect(crossTarget).toBeTruthy()
    expect(
      crossTarget.hasAttribute('data-resizable-handle-start-target') ||
        crossTarget.hasAttribute('data-resizable-handle-end-target'),
    ).toBe(true)
    expect(outerHandle.getAttribute('data-active')).toBeNull()
    expect(innerHandle.getAttribute('data-active')).toBeNull()

    await fireEvent.mouseEnter(crossTarget)
    expect(outerHandle.getAttribute('data-active')).toBe('')
    expect(innerHandle.getAttribute('data-active')).toBe('')

    await fireEvent.mouseLeave(crossTarget)
    expect(outerHandle.getAttribute('data-active')).toBeNull()
    expect(innerHandle.getAttribute('data-active')).toBeNull()
  })

  test('keeps handle index reactive after panels list changes', async () => {
    const onSizesChange = vi.fn()

    const screen = render(() => {
      const [panels, setPanels] = createSignal([
        { content: 'One', minSize: 0.2 },
        { content: 'Two', minSize: 0.2 },
        { content: 'Three', minSize: 0.2 },
      ])
      const [sizes, setSizes] = createSignal([0.34, 0.33, 0.33])

      return (
        <div>
          <button
            type="button"
            data-slot="shrink"
            onClick={() => {
              setPanels((previous) => previous.slice(1))
              setSizes([0.5, 0.5])
            }}
          >
            Shrink
          </button>
          <Resizable
            sizes={sizes()}
            onSizesChange={(nextSizes) => {
              onSizesChange(nextSizes)
              setSizes(nextSizes)
            }}
            panels={panels()}
          />
        </div>
      )
    })

    const shrinkButton = screen.container.querySelector('[data-slot="shrink"]') as HTMLButtonElement
    await fireEvent.click(shrinkButton)

    const handles = screen.container.querySelectorAll('[data-slot="handle"]')
    expect(handles).toHaveLength(1)

    const handle = handles[0] as HTMLElement
    await fireEvent.keyDown(handle, { key: 'ArrowRight' })

    const nextSizes = onSizesChange.mock.calls.at(-1)?.[0] as number[] | undefined
    expect(Array.isArray(nextSizes)).toBe(true)
    expect(nextSizes).toHaveLength(2)
    expect((nextSizes?.[0] ?? 0) > 0.5).toBe(true)
    expect((nextSizes?.[1] ?? 1) < 0.5).toBe(true)
  })

  test('updates data-active and data-dragging through hover and drag states', async () => {
    const screen = render(() => <Resizable panels={[{ content: 'Left' }, { content: 'Right' }]} />)

    const handle = screen.container.querySelector('[data-slot="handle"]') as HTMLElement

    expect(handle.getAttribute('data-active')).toBeNull()
    expect(handle.getAttribute('data-dragging')).toBeNull()

    await fireEvent.mouseEnter(handle)
    expect(handle.getAttribute('data-active')).toBe('')

    await fireEvent.mouseLeave(handle)
    expect(handle.getAttribute('data-active')).toBeNull()

    await fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(handle.getAttribute('data-active')).toBe('')
    expect(handle.getAttribute('data-dragging')).toBe('')

    await fireEvent.pointerUp(window, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(handle.getAttribute('data-dragging')).toBeNull()
  })
})

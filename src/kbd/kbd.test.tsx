import { render } from '@solidjs/testing-library'
import { describe, expect, test } from 'vitest'

import { Kbd } from './kbd'
import type { KbdProps } from './kbd'

describe('Kbd', () => {
  test('renders root container and multiple kbd items in order', () => {
    const screen = render(() => <Kbd value={['Ctrl', 'Shift', 'P']} />)
    const root = screen.container.querySelector('[data-slot="root"]')
    const items = screen.container.querySelectorAll('[data-slot="item"]')

    expect(root?.tagName).toBe('SPAN')
    expect(items.length).toBe(3)
    expect(items.item(0)?.tagName).toBe('KBD')
    expect(items.item(0)?.textContent).toBe('Ctrl')
    expect(items.item(1)?.textContent).toBe('Shift')
    expect(items.item(2)?.textContent).toBe('P')
  })

  test('renders empty root when value is an empty array', () => {
    const screen = render(() => <Kbd value={[]} />)
    const root = screen.container.querySelector('[data-slot="root"]')
    const items = screen.container.querySelectorAll('[data-slot="item"]')

    expect(root).not.toBeNull()
    expect(items.length).toBe(0)
  })

  test('applies size classes on kbd items: xs/sm/md/lg/xl', () => {
    const xs = render(() => <Kbd size="xs" value={['X']} />)
    const sm = render(() => <Kbd size="sm" value={['S']} />)
    const md = render(() => <Kbd size="md" value={['M']} />)
    const lg = render(() => <Kbd size="lg" value={['L']} />)
    const xl = render(() => <Kbd size="xl" value={['XL']} />)

    expect(xs.container.querySelector('[data-slot="item"]')?.className).toContain('h-3')
    expect(sm.container.querySelector('[data-slot="item"]')?.className).toContain('h-4')
    expect(md.container.querySelector('[data-slot="item"]')?.className).toContain('h-4.5')
    expect(lg.container.querySelector('[data-slot="item"]')?.className).toContain('h-5')
    expect(xl.container.querySelector('[data-slot="item"]')?.className).toContain('h-5.5')
  })

  test('supports default/outline/invert variants with outline as default on items', () => {
    const outlineByDefault = render(() => <Kbd value={['K']} />)
    const asDefault = render(() => <Kbd variant="default" value={['K']} />)
    const asOutline = render(() => <Kbd variant="outline" value={['K']} />)
    const asInvert = render(() => <Kbd variant="invert" value={['K']} />)

    expect(outlineByDefault.container.querySelector('[data-slot="item"]')?.className).toContain(
      'border',
    )
    expect(asDefault.container.querySelector('[data-slot="item"]')?.className).toContain(
      'bg-muted/70',
    )
    expect(asOutline.container.querySelector('[data-slot="item"]')?.className).toContain('border')
    expect(asInvert.container.querySelector('[data-slot="item"]')?.className).toContain(
      'bg-muted-foreground',
    )
  })

  test('rejects invalid size in type contract', () => {
    // @ts-expect-error size must be a declared Kbd size
    const props: KbdProps = { size: 'invalid', value: ['K'] }
    expect(props).toBeDefined()
  })

  test('applies classes.root and classes.item overrides', () => {
    const screen = render(() => (
      <Kbd
        value={['K']}
        classes={{
          root: 'root-override',
          item: 'item-override',
        }}
      />
    ))
    const root = screen.container.querySelector('[data-slot="root"]')
    const item = screen.container.querySelector('[data-slot="item"]')

    expect(root?.className).toContain('root-override')
    expect(item?.className).toContain('item-override')
  })

  test('keeps explicit data-slot support for item slot', () => {
    const screen = render(() => <Kbd value={['K', 'S']} data-slot="kbd" />)
    const root = screen.container.querySelector('[data-slot="root"]')
    const defaultItems = screen.container.querySelectorAll('[data-slot="item"]')
    const explicitSlotItems = screen.container.querySelectorAll('[data-slot="kbd"]')

    expect(root?.tagName).toBe('SPAN')
    expect(defaultItems.length).toBe(0)
    expect(explicitSlotItems.length).toBe(2)
    expect(explicitSlotItems.item(0)?.tagName).toBe('KBD')
  })

  test('rejects children in type contract', () => {
    // @ts-expect-error children is no longer supported
    const props: KbdProps = { value: ['K'], children: 'K' }
    expect(props).toBeDefined()
  })

  test('requires value in type contract', () => {
    // @ts-expect-error value is required
    const props: KbdProps = { size: 'md' }
    expect(props).toBeDefined()
  })

  test('rejects non-array value in type contract', () => {
    // @ts-expect-error value must be string[]
    const props: KbdProps = { value: 'K' }
    expect(props).toBeDefined()
  })
})

import { render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, test } from 'vitest'

import { Sidebar } from './sidebar'

describe('Sidebar', () => {
  test('places pages without group at the top', () => {
    const [theme, setTheme] = createSignal<'light' | 'dark'>('light')
    const [activePage, setActivePage] = createSignal('grouped')

    const screen = render(() => (
      <Sidebar
        pages={[
          { key: 'grouped', label: 'Grouped', group: 'Group A' },
          { key: 'ungrouped', label: 'Ungrouped' },
        ]}
        activePage={activePage}
        setActivePage={setActivePage}
        theme={theme}
        setTheme={setTheme}
      />
    ))

    const text = screen.container.textContent ?? ''
    expect(text.indexOf('Ungrouped')).toBeGreaterThanOrEqual(0)
    expect(text.indexOf('Group A')).toBeGreaterThanOrEqual(0)
    expect(text.indexOf('Ungrouped')).toBeLessThan(text.indexOf('Group A'))
  })
})

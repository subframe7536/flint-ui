import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, test, vi } from 'vitest'

import { CommandPalette } from './command-palette'

const GROUPS = [
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { label: 'New File', icon: 'i-lucide-file-plus', kbds: ['⌘', 'N'] },
      { label: 'Open Folder', icon: 'i-lucide-folder-open' },
      { label: 'Disabled Action', disabled: true },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: [{ label: 'Go to Dashboard' }, { label: 'Go to Settings' }],
  },
]

describe('CommandPalette', () => {
  test('renders input and item labels', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeTruthy()
      expect(screen.getByText('New File')).toBeTruthy()
      expect(screen.getByText('Go to Dashboard')).toBeTruthy()
    })
  })

  test('renders group labels', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} />)

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeTruthy()
      expect(screen.getByText('Navigation')).toBeTruthy()
    })
  })

  test('shows empty state when no groups', async () => {
    const screen = render(() => <CommandPalette groups={[]} />)

    await waitFor(() => {
      expect(screen.getByText('No results.')).toBeTruthy()
    })
  })

  test('kbds render in item trailing', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} />)

    await waitFor(() => {
      const kbds = screen.container.querySelectorAll('[data-slot="item-kbd"]')
      expect(kbds.length).toBeGreaterThan(0)
    })
  })

  test('fires onSelect when a leaf item is activated', async () => {
    const onSelect = vi.fn()

    const screen = render(() => (
      <CommandPalette groups={[{ id: 'g', items: [{ label: 'Action', onSelect }] }]} />
    ))

    await waitFor(() => screen.getByText('Action'))

    const item = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(item)

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  test('navigates into children on selection and shows back button', async () => {
    const screen = render(() => (
      <CommandPalette
        groups={[
          {
            id: 'g',
            items: [
              {
                label: 'More',
                children: [{ label: 'Sub Item' }],
              },
            ],
          },
        ]}
      />
    ))

    await waitFor(() => screen.getByText('More'))

    const item = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(item)

    await waitFor(() => {
      expect(screen.getByText('Sub Item')).toBeTruthy()
      expect(screen.container.querySelector('[data-slot="back"]')).not.toBeNull()
    })
  })

  test('navigates back on back button click', async () => {
    const screen = render(() => (
      <CommandPalette
        groups={[
          {
            id: 'g',
            items: [
              {
                label: 'Parent',
                children: [{ label: 'Child' }],
              },
            ],
          },
        ]}
      />
    ))

    await waitFor(() => screen.getByText('Parent'))

    const parentItem = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(parentItem)

    await waitFor(() => screen.getByText('Child'))

    const backButton = screen.container.querySelector('[data-slot="back"]') as HTMLElement
    await fireEvent.click(backButton)

    await waitFor(() => {
      expect(screen.getByText('Parent')).toBeTruthy()
      expect(screen.container.querySelector('[data-slot="back"]')).toBeNull()
    })
  })

  test('navigates back on Backspace with empty input', async () => {
    const screen = render(() => (
      <CommandPalette
        groups={[
          {
            id: 'g',
            items: [
              {
                label: 'Parent',
                children: [{ label: 'Child' }],
              },
            ],
          },
        ]}
      />
    ))

    await waitFor(() => screen.getByText('Parent'))

    const parentItem = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(parentItem)

    await waitFor(() => screen.getByText('Child'))

    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement
    await fireEvent.keyDown(input, { key: 'Backspace' })

    await waitFor(() => {
      expect(screen.getByText('Parent')).toBeTruthy()
    })
  })

  test('close button renders and calls onClose', async () => {
    const onClose = vi.fn()
    const screen = render(() => <CommandPalette groups={GROUPS} close onClose={onClose} />)

    await waitFor(() => {
      const closeBtn = screen.container.querySelector('[data-slot="close"]') as HTMLElement
      expect(closeBtn).not.toBeNull()
      fireEvent.click(closeBtn)
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('disabled item has data-disabled attribute', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} />)

    await waitFor(() => {
      const items = screen.container.querySelectorAll('[data-slot="item"]')
      const disabledItem = [...items].find((el) => el.getAttribute('data-disabled') !== null)
      expect(disabledItem).toBeTruthy()
    })
  })

  test('renders custom placeholder', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} placeholder="Type a command..." />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a command...')).toBeTruthy()
    })
  })
})

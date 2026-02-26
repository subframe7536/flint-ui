import { render } from '@solidjs/testing-library'
import { describe, expect, test } from 'vitest'

import { Button } from '../button'
import { Input } from '../input'
import { InputNumber } from '../input-number'
import { Select } from '../select'
import { Textarea } from '../textarea'

import { FieldGroup } from './field-group'

const SELECT_OPTIONS = [{ label: 'Option A', value: 'a' }]

describe('FieldGroup', () => {
  test('renders root with default horizontal orientation', () => {
    const screen = render(() => (
      <FieldGroup>
        <Input />
      </FieldGroup>
    ))

    const root = screen.container.firstElementChild as HTMLElement

    expect(root.getAttribute('data-slot')).toBe('root')
    expect(root.getAttribute('data-orientation')).toBe('horizontal')
    expect(root.className).toContain('inline-flex')
    expect(root.className).toContain('-space-x-px')
  })

  test('applies vertical orientation classes and data attribute', () => {
    const screen = render(() => (
      <FieldGroup orientation="vertical">
        <Input />
      </FieldGroup>
    ))

    const root = screen.container.firstElementChild as HTMLElement

    expect(root.getAttribute('data-orientation')).toBe('vertical')
    expect(root.className).toContain('flex-col')
    expect(root.className).toContain('-space-y-px')
  })

  test('inherits size for input, textarea, button, select and input-number', () => {
    const screen = render(() => (
      <FieldGroup size="xl">
        <Input />
        <Textarea />
        <Select options={SELECT_OPTIONS} />
        <InputNumber defaultValue={1} />
        <Button>Action</Button>
      </FieldGroup>
    ))

    const input = screen.container.querySelector('input') as HTMLInputElement
    const textarea = screen.container.querySelector('textarea') as HTMLTextAreaElement
    const selectControl = screen.container.querySelector('[data-slot="control"]') as HTMLElement
    const inputNumber = screen.getByRole('spinbutton') as HTMLInputElement
    const button = screen.getByRole('button', { name: 'Action' })

    const inputRoot = input.closest('[data-slot="root"]')

    expect(inputRoot?.className).toContain('h-11')
    expect(textarea.className).toContain('min-h-24')
    expect(selectControl.className).toContain('min-h-11')
    expect(inputNumber.className).toContain('h-11')
    expect(button.className).toContain('h-11')
  })

  test('child explicit size has higher priority than group size', () => {
    const screen = render(() => (
      <FieldGroup size="xl">
        <Input size="sm" />
        <Textarea size="sm" />
        <Select options={SELECT_OPTIONS} size="sm" />
        <InputNumber size="sm" defaultValue={1} />
        <Button size="sm">Action</Button>
      </FieldGroup>
    ))

    const input = screen.container.querySelector('input') as HTMLInputElement
    const textarea = screen.container.querySelector('textarea') as HTMLTextAreaElement
    const selectControl = screen.container.querySelector('[data-slot="control"]') as HTMLElement
    const inputNumber = screen.getByRole('spinbutton') as HTMLInputElement
    const button = screen.getByRole('button', { name: 'Action' })
    const inputRoot = input.closest('[data-slot="root"]')

    expect(inputRoot?.className).toContain('h-8')
    expect(inputRoot?.className).not.toContain('h-11')
    expect(textarea.className).toContain('min-h-18')
    expect(selectControl.className).toContain('min-h-8')
    expect(selectControl.className).not.toContain('min-h-11')
    expect(inputNumber.className).toContain('h-8')
    expect(inputNumber.className).not.toContain('h-11')
    expect(button.className).toContain('h-8')
  })

  test('includes focus stacking classes for ring layering', () => {
    const screen = render(() => (
      <FieldGroup>
        <Input />
        <Button>Action</Button>
      </FieldGroup>
    ))

    const root = screen.container.firstElementChild as HTMLElement
    expect(root.className).toContain('isolate')
    expect(root.className).toContain('focus-within')
  })

  test('applies classes.root', () => {
    const screen = render(() => (
      <FieldGroup
        classes={{
          root: 'root-override',
        }}
      >
        <Input />
      </FieldGroup>
    ))

    const root = screen.container.firstElementChild as HTMLElement

    expect(root.className).toContain('root-override')
  })
})

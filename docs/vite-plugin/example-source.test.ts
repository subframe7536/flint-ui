import { describe, expect, test, vi } from 'vitest'

import { resolveExampleComponentSource, transformExampleSourceModule } from './example-source'

describe('resolveExampleComponentSource', () => {
  test('extracts named arrow component declaration', () => {
    const source = `
export const BasicExample = () => <div>basic</div>
`

    const result = resolveExampleComponentSource(source, 'BasicExample')
    expect(result).toBe('const BasicExample = () => <div>basic</div>')
  })

  test('extracts named function component declaration', () => {
    const source = `
function LoadingExample() {
  return <div>loading</div>
}
`

    const result = resolveExampleComponentSource(source, 'LoadingExample')
    expect(result).toBe(`function LoadingExample() {
  return <div>loading</div>
}`)
  })

  test('returns null for missing component', () => {
    const source = `
export const BasicExample = () => <div>basic</div>
`

    const result = resolveExampleComponentSource(source, 'MissingExample')
    expect(result).toBeNull()
  })
})

describe('transformExampleSourceModule', () => {
  test('transforms ?example-source requests to highlighted html module', () => {
    const source = `
export const BasicExample = () => <div>basic</div>
`
    const toHTML = vi.fn((value: string, lang: 'tsx' | 'bash') => `<pre ${lang}>${value}</pre>`)

    const transformed = transformExampleSourceModule(
      source,
      '/tmp/docs/examples/button/basic.tsx?example-source&name=BasicExample',
      toHTML,
    )

    expect(transformed).toContain('export default ')
    expect(toHTML).toHaveBeenCalledWith('const BasicExample = () => <div>basic</div>', 'tsx')
  })

  test('ignores non source-query modules', () => {
    const source = `export const BasicExample = () => <div>basic</div>`
    const toHTML = vi.fn(() => '<pre>code</pre>')

    const transformed = transformExampleSourceModule(
      source,
      '/tmp/docs/examples/button/basic.tsx',
      toHTML,
    )

    expect(transformed).toBeNull()
    expect(toHTML).not.toHaveBeenCalled()
  })

  test('returns empty html module when component does not exist', () => {
    const source = `export const BasicExample = () => <div>basic</div>`
    const toHTML = vi.fn(() => '<pre>code</pre>')

    const transformed = transformExampleSourceModule(
      source,
      '/tmp/docs/examples/button/basic.tsx?example-source&name=MissingExample',
      toHTML,
    )

    expect(transformed).toBe('export default ""\n')
    expect(toHTML).not.toHaveBeenCalled()
  })
})

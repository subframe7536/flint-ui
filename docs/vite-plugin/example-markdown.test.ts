import { describe, expect, test } from 'vitest'

import { compileMarkdownPage } from './example-markdown'

describe('compileMarkdownPage', () => {
  test('compiles markdown with inferred component key and inferred example source', () => {
    const markdown = `
## Variants

Use button variants.

:::example
name: Variants
:::
`

    const code = compileMarkdownPage(markdown, '/tmp/docs/pages/general/button/button.md', {
      projectRoot: process.cwd(),
    })

    expect(code).toContain("from '../../../components/example-markdown-page'")
    expect(code).toContain('componentKey: "button"')
    expect(code).toContain('ExampleComponent0')
    expect(code).toContain("from './examples/variants.tsx'")
    expect(code).toContain('?example-source&name=Variants')
    expect(code).toContain("type: 'markdown'")
  })

  test('uses explicit source override when provided', () => {
    const markdown = `
:::example
name: Variants
source: ./examples/button-variants.tsx
:::
`

    const code = compileMarkdownPage(markdown, '/tmp/docs/pages/general/button/button.md')

    expect(code).toContain("from './examples/button-variants.tsx'")
  })

  test('supports :::widget directive', () => {
    const markdown = `
:::widget
name: introduction-home
:::
`

    const code = compileMarkdownPage(markdown, '/tmp/docs/pages/introduction.md')
    expect(code).toContain("from '../components/example-markdown-page'")
    expect(code).not.toContain('componentKey:')
    expect(code).toContain('widgetName: "introduction-home"')
  })
})

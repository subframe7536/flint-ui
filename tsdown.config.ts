import { unocss } from 'rolldown-plugin-unocss'
import type { InlineConfig } from 'tsdown'
import { defineConfig } from 'tsdown'
import solid from 'vite-plugin-solid'

const base: InlineConfig = {
  entry: ['./src/index.ts'],
  exports: true,
  inlineOnly: false,
  noExternal: ['valibot'],
}
// export both js and jsx
export default defineConfig([
  {
    ...base,
    // use the solid plugin to handle jsx
    plugins: [
      unocss({
        generateCSS: false,
        filter: { id: ['src/**/*.tsx', 'src/**/*.class.ts'] },
      }),
      solid(),
    ],
    dts: true,
  },
  {
    ...base,
    platform: 'neutral',
    plugins: [
      unocss({
        generateCSS: false,
        filter: { id: ['src/**/*.tsx', 'src/**/*.class.ts'] },
      }),
    ],
    outExtensions: () => ({ js: '.jsx' }),
    dts: false,
  },
])

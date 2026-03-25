import path from 'node:path'
import { fileURLToPath } from 'node:url'

import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

import { componentApiPlugin } from './vite-plugin/api-doc'
import { exampleMarkdownPlugin } from './vite-plugin/example-markdown'
import { examplePagesPlugin } from './vite-plugin/example-pages'
import { exampleSourcePlugin } from './vite-plugin/example-source'

export default defineConfig({
  plugins: [
    componentApiPlugin(),
    examplePagesPlugin(),
    exampleSourcePlugin(),
    exampleMarkdownPlugin(),
    uno({ inspector: false }),
    solid(),
  ],
  resolve: {
    alias: {
      '@src': path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../src'),
    },
    dedupe: ['solid-js', '@solidjs/router'],
  },
})

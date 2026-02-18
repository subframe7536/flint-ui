import path from 'node:path'
import { fileURLToPath } from 'node:url'

import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

import unocssConfig from './unocss.config'

const PLAYGROUND_ROOT = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: PLAYGROUND_ROOT,
  plugins: [uno({ ...unocssConfig, inspector: false }), solid()],
  resolve: {
    alias: {
      '~': path.resolve(PLAYGROUND_ROOT, '../src'),
    },
    dedupe: ['solid-js', '@solidjs/router'],
  },
})

import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

import { componentApiPlugin } from './vite-plugin/api-doc'
import { demoPagesPlugin } from './vite-plugin/demo-pages'
import { demoSourcePlugin } from './vite-plugin/demo-source'

export default defineConfig({
  plugins: [
    componentApiPlugin(),
    demoPagesPlugin(),
    demoSourcePlugin(),
    uno({ inspector: false }),
    solid(),
  ],
  resolve: {
    dedupe: ['solid-js', '@solidjs/router'],
  },
})

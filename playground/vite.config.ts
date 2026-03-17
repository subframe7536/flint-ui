import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

import unocssConfig from './unocss.config'
import { componentMetaPlugin } from './vite-plugin-component-meta'
import { demoSourcePlugin } from './vite-plugin-demo-source'

export default defineConfig({
  plugins: [
    componentMetaPlugin(),
    demoSourcePlugin(),
    uno({ ...unocssConfig, inspector: false }),
    solid(),
  ],
  resolve: {
    dedupe: ['solid-js', '@solidjs/router'],
  },
})

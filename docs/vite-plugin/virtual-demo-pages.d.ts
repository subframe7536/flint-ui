declare module 'virtual:demo-pages' {
  import type { Component } from 'solid-js'

  export interface DemoPageEntry {
    key: string
    group?: string
  }

  export const demoMap: Record<string, Component>
  export const pages: DemoPageEntry[]
}

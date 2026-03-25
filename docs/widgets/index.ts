import type { Component } from 'solid-js'

import { IntroductionHomeWidget } from './introduction-home'
import { ToastHostsWidget } from './toast-hosts'

export const docsWidgetMap: Record<string, Component<Record<string, unknown>>> = {
  'introduction-home': IntroductionHomeWidget as Component<Record<string, unknown>>,
  'toast-hosts': ToastHostsWidget as Component<Record<string, unknown>>,
}

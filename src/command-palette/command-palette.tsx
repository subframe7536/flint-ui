import { Combobox } from '@kobalte/core/combobox'
import type { JSX } from 'solid-js'
import { For, Show, createMemo, createSignal, mergeProps } from 'solid-js'

import { Icon } from '../icon'
import type { IconName } from '../icon'
import { Kbd } from '../kbd'
import { cn } from '../shared/utils'

import type { CommandPaletteSize } from './command-palette.class'
import {
  commandPaletteEmptyVariants,
  commandPaletteGroupLabelVariants,
  commandPaletteInputVariants,
  commandPaletteInputWrapperVariants,
  commandPaletteItemTrailingIconVariants,
  commandPaletteItemVariants,
} from './command-palette.class'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CommandPaletteItem {
  label?: string
  prefix?: string
  suffix?: string
  description?: string
  /** UnoCSS icon class, e.g. `icon-search` or `i-lucide-search` */
  icon?: string
  kbds?: string[]
  /** Force-active (highlighted) state */
  active?: boolean
  /** Show a spinning icon in the leading slot */
  loading?: boolean
  disabled?: boolean
  /** Selecting this item drills into a sub-group */
  children?: CommandPaletteItem[]
  onSelect?: (e: Event) => void
  class?: string
}

export interface CommandPaletteGroup {
  id: string
  label?: string
  items?: CommandPaletteItem[]
}

export interface CommandPaletteProps {
  groups?: CommandPaletteGroup[]
  /** @default 'md' */
  size?: CommandPaletteSize
  /** @default 'Search...' */
  placeholder?: string
  /** Controlled search term */
  searchTerm?: string
  onSearchTermChange?: (term: string) => void
  /** @default true */
  autofocus?: boolean
  /** @default 'icon-search' */
  searchIcon?: IconName
  /** @default 'icon-loading' */
  loadingIcon?: IconName
  /** @default 'icon-chevron-right' */
  childIcon?: IconName
  /** @default 'icon-arrow-left' */
  backIcon?: IconName
  /** @default 'icon-close' */
  closeIcon?: IconName
  /** Show a close button */
  close?: boolean
  onClose?: () => void
  /** Show a loading spinner in the search icon slot */
  loading?: boolean
  /** Custom empty state content. Defaults to "No results." */
  empty?: JSX.Element
}

// ─── Internal normalized types ────────────────────────────────────────────────

interface NormalizedItem {
  _id: string
  label: string
  disabled: boolean
  _raw: CommandPaletteItem
}

interface NormalizedGroup {
  _label: string
  items: NormalizedItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 0

function _nextId(): string {
  return `cp-${++_idCounter}`
}

function _normalizeItem(item: CommandPaletteItem): NormalizedItem {
  return {
    _id: _nextId(),
    label: [item.prefix, item.label, item.suffix].filter(Boolean).join(' '),
    disabled: Boolean(item.disabled),
    _raw: item,
  }
}

function _normalizeGroup(group: CommandPaletteGroup): NormalizedGroup {
  return {
    _label: group.label ?? '',
    items: (group.items ?? []).map(_normalizeItem),
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
// todo)) refactor to reuse `<Select>`
export function CommandPalette(props: CommandPaletteProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as CommandPaletteSize,
      placeholder: 'Search...',
      autofocus: true,
      close: false,
      searchIcon: 'icon-search' as IconName,
      loadingIcon: 'icon-loading' as IconName,
      childIcon: 'icon-chevron-right' as IconName,
      backIcon: 'icon-arrow-left' as IconName,
      closeIcon: 'icon-close' as IconName,
    },
    props,
  )

  // ── History stack for sub-navigation ──────────────────────────────────────
  const [history, setHistory] = createSignal<CommandPaletteGroup[]>([])

  // ── Input ref — cleared visually after navigation ─────────────────────────
  let inputRef: HTMLInputElement | undefined

  // ── Search term ───────────────────────────────────────────────────────────
  const [_internalSearch, _setInternalSearch] = createSignal('')
  const currentSearchTerm = createMemo(() => merged.searchTerm ?? _internalSearch())

  // Absorbs the one `onInputChange` call Kobalte fires after item selection
  // (setting the input to the selected item's label), which would overwrite
  // the '' we just set during navigation.
  let _suppressInputChange = false

  function _updateSearch(value: string): void {
    if (_suppressInputChange) {
      _suppressInputChange = false
      return
    }
    if (merged.searchTerm === undefined) {
      _setInternalSearch(value)
    }
    merged.onSearchTermChange?.(value)
  }

  // ── Custom filter: reads _internalSearch (not Kobalte's inputValue) ────────
  function filter(option: NormalizedItem): boolean {
    const term = _internalSearch()
    return term === '' || option.label.toLowerCase().includes(term.toLowerCase())
  }

  // ── Current groups: last history entry or root ─────────────────────────────
  const currentGroups = createMemo<CommandPaletteGroup[]>(() => {
    const hist = history()
    return hist.length > 0 ? [hist[hist.length - 1]] : (merged.groups ?? [])
  })

  const normalizedGroups = createMemo<NormalizedGroup[]>(() => currentGroups().map(_normalizeGroup))

  const hasItems = createMemo(() => normalizedGroups().some((g) => g.items.length > 0))

  // ── Navigation ────────────────────────────────────────────────────────────
  function navigateBack(): void {
    setHistory((h) => h.slice(0, -1))
    _updateSearch('')
    // Clear the DOM input after Kobalte's sync updates finish
    queueMicrotask(() => {
      if (inputRef) {
        inputRef.value = ''
      }
    })
  }

  function handleChange(item: NormalizedItem | null): void {
    if (!item) {
      return
    }
    const raw = item._raw

    if ((raw.children?.length ?? 0) > 0) {
      setHistory((h) => [
        ...h,
        { id: `history-${h.length}`, label: raw.label, items: raw.children! },
      ])
      _updateSearch('')
      // Suppress the onInputChange('More') Kobalte fires after selection
      _suppressInputChange = true
      queueMicrotask(() => {
        _suppressInputChange = false
        if (inputRef) {
          inputRef.value = ''
        }
      })
      return
    }

    raw.onSelect?.(new Event('select'))
  }

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Backspace' && !currentSearchTerm()) {
      navigateBack()
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Combobox<NormalizedItem, NormalizedGroup>
      options={normalizedGroups()}
      optionValue="_id"
      optionLabel="label"
      optionTextValue="label"
      optionDisabled="disabled"
      optionGroupChildren="items"
      defaultFilter={filter}
      triggerMode="manual"
      open={true}
      onOpenChange={() => {}}
      value={null}
      onChange={handleChange}
      onInputChange={_updateSearch}
      allowsEmptyCollection={true}
      closeOnSelection={false}
      shouldFocusWrap={true}
      itemComponent={(itemProps) => {
        const raw = (): CommandPaletteItem => itemProps.item.rawValue._raw
        const hasChildren = (): boolean => (raw().children?.length ?? 0) > 0

        return (
          <Combobox.Item
            item={itemProps.item}
            data-slot="item"
            class={commandPaletteItemVariants(
              { size: merged.size, hasIcon: !!(raw().icon || raw().loading) },
              raw().class,
            )}
            onPointerDown={(e: PointerEvent) => e.preventDefault()}
          >
            {/* Leading: loading spinner or icon */}
            <Show when={raw().loading}>
              <Icon
                name={merged.loadingIcon}
                data-slot="item-leading-icon"
                size={merged.size}
                class="animate-spin"
              />
            </Show>
            <Show when={!raw().loading && raw().icon}>
              <Icon name={raw().icon!} data-slot="item-leading-icon" size={merged.size} />
            </Show>

            {/* Content wrapper */}
            <span data-slot="item-wrapper" class="text-start flex flex-1 flex-col min-w-0">
              <Show when={raw().prefix || raw().label || raw().suffix}>
                <span data-slot="item-label" class="inline-flex gap-1 truncate items-baseline">
                  <Show when={raw().prefix}>
                    <span data-slot="item-prefix" class="text-muted-foreground shrink-0">
                      {raw().prefix}
                    </span>
                  </Show>
                  <span data-slot="item-label-base" class="truncate">
                    {raw().label}
                  </span>
                  <Show when={raw().suffix}>
                    <span data-slot="item-suffix" class="text-muted-foreground shrink-0">
                      {raw().suffix}
                    </span>
                  </Show>
                </span>
              </Show>
              <Show when={raw().description}>
                <span data-slot="item-description" class="text-xs text-muted-foreground truncate">
                  {raw().description}
                </span>
              </Show>
            </span>

            {/* Trailing: children indicator or kbds */}
            <span
              data-slot="item-trailing"
              class="ms-auto inline-flex shrink-0 gap-1.5 items-center"
            >
              <Show when={hasChildren()}>
                <Icon
                  name={merged.childIcon}
                  size={merged.size}
                  data-slot="item-trailing-icon"
                  class={commandPaletteItemTrailingIconVariants({ size: merged.size })}
                />
              </Show>
              <Show when={!hasChildren() && (raw().kbds?.length ?? 0) > 0}>
                <span
                  data-slot="item-trailing-kbds"
                  class="gap-0.5 hidden items-center lg:inline-flex"
                >
                  <For each={raw().kbds}>
                    {(kbd) => (
                      <Kbd size="sm" data-slot="item-kbd">
                        {kbd}
                      </Kbd>
                    )}
                  </For>
                </span>
              </Show>
            </span>
          </Combobox.Item>
        )
      }}
      sectionComponent={(sectionProps) => (
        <Combobox.Section data-slot="group" class="p-1">
          <Show when={sectionProps.section.rawValue._label}>
            <span
              data-slot="group-label"
              class={commandPaletteGroupLabelVariants({ size: merged.size })}
            >
              {sectionProps.section.rawValue._label}
            </span>
          </Show>
        </Combobox.Section>
      )}
      data-slot="root"
      class={cn('flex flex-col min-h-0 divide-y divide-border')}
    >
      {/* ── Input area ─────────────────────────────────────────────────── */}
      <Combobox.Control<NormalizedItem>
        data-slot="input-wrapper"
        class={commandPaletteInputWrapperVariants({ size: merged.size })}
      >
        <Show
          when={history().length > 0}
          fallback={
            <Icon
              name={merged.loading ? merged.loadingIcon : merged.searchIcon}
              data-slot="search-icon"
              size={merged.size}
              class={cn('text-muted-foreground shrink-0', merged.loading && 'animate-spin')}
            />
          }
        >
          <button
            type="button"
            data-slot="back"
            class="text-muted-foreground outline-none shrink-0 cursor-pointer hover:text-foreground"
            onClick={navigateBack}
            aria-label="Go back"
          >
            <Icon name={merged.backIcon} size={merged.size} aria-label="Go back" />
          </button>
        </Show>

        <Combobox.Input
          ref={(el: any) => (inputRef = el)}
          data-slot="input"
          class={commandPaletteInputVariants({ size: merged.size })}
          placeholder={merged.placeholder}
          autofocus={merged.autofocus}
          onKeyDown={handleKeyDown}
        />

        <Show when={merged.close}>
          <button
            type="button"
            data-slot="close"
            class="text-muted-foreground outline-none shrink-0 cursor-pointer hover:text-foreground"
            onClick={() => merged.onClose?.()}
            aria-label="Close"
          >
            <Icon name={merged.closeIcon} />
          </button>
        </Show>
      </Combobox.Control>

      {/* ── List ───────────────────────────────────────────────────────── */}
      <Show
        when={hasItems()}
        fallback={
          <div data-slot="empty" class={commandPaletteEmptyVariants({ size: merged.size })}>
            {merged.empty ?? 'No results.'}
          </div>
        }
      >
        <Combobox.Listbox
          data-slot="listbox"
          class="p-1 overflow-x-hidden overflow-y-auto focus:outline-none"
        />
      </Show>
    </Combobox>
  )
}

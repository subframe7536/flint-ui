import { createSignal } from 'solid-js'

import { Pagination } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

export const PaginationDemos = () => {
  const [page, setPage] = createSignal(3)

  return (
    <DemoPage
      eyebrow="Rock UI Playground"
      title="Pagination"
      description="Page navigation with controlled/uncontrolled modes, links, and style variants."
    >
      <DemoSection
        title="Controlled"
        description="External page state management with onPageChange callback."
      >
        <div class="space-y-3">
          <Pagination
            page={page()}
            onPageChange={setPage}
            total={120}
            itemsPerPage={10}
            siblingCount={1}
          />
          <p class="text-xs text-zinc-600">Current page: {page()}</p>
        </div>
      </DemoSection>

      <DemoSection
        title="Link Mode"
        description="Render pagination controls as anchors using the to callback."
      >
        <Pagination
          total={60}
          itemsPerPage={10}
          to={(nextPage) => `#pagination&page=${nextPage}`}
          variant="ghost"
          activeVariant="secondary"
        />
      </DemoSection>

      <DemoSection
        title="Minimal"
        description="Hide prev/next controls and show only page buttons."
      >
        <Pagination total={80} itemsPerPage={10} showControls={false} />
      </DemoSection>
    </DemoPage>
  )
}

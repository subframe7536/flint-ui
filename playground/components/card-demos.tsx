import { Button, Card } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

export const CardDemos = () => (
  <DemoPage
    eyebrow="Rock UI Playground"
    title="Card"
    description="Container surface variants with optional header, body, and footer slots."
  >
    <DemoSection title="Variants" description="Visual card styles in the current design system.">
      <div class="gap-4 grid lg:grid-cols-2">
        <Card
          header={
            <>
              <h3 class="text-sm font-semibold">Card header</h3>
              <p class="text-xs opacity-70">Reusable section shell</p>
            </>
          }
          footer={<Button size="sm">Action</Button>}
        >
          <p class="text-sm opacity-85">This card previews.</p>
        </Card>
      </div>
    </DemoSection>

    <DemoSection
      title="Body Only"
      description="Cards can render as body-only containers with no header or footer."
    >
      <Card>
        <p class="text-sm opacity-85">Body-only content for compact layouts.</p>
      </Card>
    </DemoSection>
  </DemoPage>
)

import { Button, FieldGroup, Input, Textarea } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

export const FieldGroupDemos = () => (
  <DemoPage
    eyebrow="Rock UI Playground"
    title="Field Group"
    description="Group adjacent form controls with shared sizing and orientation context."
  >
    <DemoSection
      title="Horizontal"
      description="Typical input + action composition with shared field group sizing."
    >
      <div class="max-w-xl space-y-3">
        <FieldGroup>
          <Input placeholder="Search projects..." />
          <Button variant="outline" leading={<span class="i-lucide-search" />}>
            Search
          </Button>
        </FieldGroup>

        <FieldGroup size="lg">
          <Input placeholder="Email" />
          <Button>Subscribe</Button>
        </FieldGroup>
      </div>
    </DemoSection>

    <DemoSection
      title="Vertical"
      description="Stacked controls with shared spacing and border treatment."
    >
      <div class="max-w-md">
        <FieldGroup orientation="vertical">
          <Input placeholder="Title" />
          <Textarea rows={3} placeholder="Description" />
          <Button variant="secondary">Save Draft</Button>
        </FieldGroup>
      </div>
    </DemoSection>
  </DemoPage>
)

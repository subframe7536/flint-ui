import { Button } from '../../../src/elements/button/button'
import { Card } from '../../../src/elements/card/card'
import { Icon } from '../../../src/elements/icon/icon'

export default () => {
  return (
    <div class="mx-auto mb-12 p-6 max-w-4xl space-y-12">
      {/* Hero Section */}
      <div class="my-12 space-y-4">
        <h1 class="text-4xl text-foreground font-bold">Introduction</h1>
        <p class="text-xl text-muted-foreground max-w-2xl">
          A comprehensive component library for SolidJS, inspired by Nuxt UI and Shadcn.
        </p>
      </div>

      {/* What is Rock UI */}
      <div class="space-y-4">
        <h2 class="text-2xl text-foreground font-semibold">What is Rock UI?</h2>
        <div class="space-y-4">
          <p class="text-muted-foreground">
            Rock UI provides a collection of high-quality, accessible components built with SolidJS.
            Designed for modern web applications, it offers a consistent design system and developer
            experience.
          </p>
          <p class="text-muted-foreground">
            If you're building a SolidJS project with UnoCSS, Rock UI is a great default choice. It
            provides high-level, ready-to-use components while still allowing advanced customization
            when needed.
          </p>
        </div>
      </div>

      {/* Features */}
      <div class="space-y-4">
        <h2 class="text-2xl text-foreground font-semibold">Key Features</h2>
        <div class="gap-4 grid md:grid-cols-2">
          <Card
            title={
              <div class="flex gap-2 items-center">
                <Icon name="i-lucide-zap" />
                SolidJS First
              </div>
            }
            compact
          >
            <p class="text-sm text-muted-foreground">
              Built specifically for SolidJS with reactive primitives and optimized performance.
            </p>
          </Card>
          <Card
            title={
              <div class="flex gap-2 items-center">
                <Icon name="i-lucide-code" />
                TypeScript Support
              </div>
            }
            compact
          >
            <p class="text-sm text-muted-foreground">
              Full TypeScript support with comprehensive type definitions and IntelliSense.
            </p>
          </Card>
          <Card
            title={
              <div class="flex gap-2 items-center">
                <Icon name="i-lucide-palette" />
                Atomic Styled Class
              </div>
            }
            compact
          >
            <p class="text-sm text-muted-foreground">
              Works with UnoCSS and Tailwind CSS. Copy-paste shadcn theme CSS variables
            </p>
          </Card>
          <Card
            title={
              <div class="flex gap-2 items-center">
                <Icon name="i-lucide-shield-check" />
                Accessible by Default
              </div>
            }
            compact
          >
            <p class="text-sm text-muted-foreground">
              Components follow accessibility best practices with proper ARIA support.
            </p>
          </Card>
        </div>
      </div>

      {/* Getting Started */}
      <div class="space-y-4">
        <h2 class="text-2xl text-foreground font-semibold">Getting Started</h2>
        <div class="space-y-4">
          <p class="text-muted-foreground">
            Explore the components in the sidebar to see examples and usage patterns. Each component
            page includes interactive demos, API documentation, and code examples.
          </p>
          <div class="space-y-4">
            <div>
              <h3 class="text-foreground font-semibold mb-2">Installation</h3>
              <pre class="text-sm p-3 rounded-lg bg-muted overflow-x-auto">
                <code>npm install @subf/rock-ui</code>
              </pre>
            </div>
            <p class="text-sm text-muted-foreground">
              For more detailed setup instructions, check the main README in the project root.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div class="mt-12 flex justify-around">
        <Button variant="link" as="a" href="#button">
          View Components →
        </Button>
        <Button variant="link" as="a" href="https://github.com/solidjs/solid" target="_blank">
          SolidJS Docs →
        </Button>
        <Button variant="link" as="a" href="https://unocss.dev/" target="_blank">
          UnoCSS Docs →
        </Button>
      </div>
    </div>
  )
}

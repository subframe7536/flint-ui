// work in progress

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'

import ts from 'typescript'
import type { Logger, Plugin } from 'vite'

// ── Types ──────────────────────────────────────────────────────────────

interface PropMeta {
  name: string
  type: string
  optional: boolean
  description: string
  default?: string
  inherited: boolean
  inheritedFrom?: string
}

interface VariantMeta {
  name: string
  options: string[]
  default?: string
}

interface ComponentMeta {
  name: string
  key: string
  sourcePath: string
  category: string
  description: string
  props: PropMeta[]
  variants: VariantMeta[]
  slots: string[]
  polymorphic: boolean
}

interface RegistryEntry {
  key: string
  name: string
  category: string
}

// ── Constants ──────────────────────────────────────────────────────────

const DIR_CATEGORY: Record<string, string> = {
  elements: 'General',
  forms: 'Form',
  navigation: 'Navigation',
  overlays: 'Overlay',
}

const CATEGORY_ORDER = ['General', 'Navigation', 'Overlay', 'Form']

// ── Helpers ────────────────────────────────────────────────────────────

function resolveDisplayType(typeText: string): string {
  const classesMatch = typeText.match(/^(\w+)Classes$/)
  if (classesMatch) {
    return `SlotClasses<${classesMatch[1]}Slots, ClassValue>`
  }
  const stylesMatch = typeText.match(/^(\w+)Styles$/)
  if (stylesMatch) {
    return `SlotStyles<${stylesMatch[1]}Slots, JSX.CSSProperties>`
  }
  return typeText
}

function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

// ── TypeScript AST Utilities ───────────────────────────────────────────

/** Recursively visit every node in the subtree */
function visit(node: ts.Node, cb: (n: ts.Node) => void): void {
  cb(node)
  ts.forEachChild(node, (child) => visit(child, cb))
}

/** Safely get the string key from any PropertyName node */
function getPropertyKeyName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name)) {
    return name.text
  }
  if (ts.isStringLiteral(name)) {
    return name.text
  }
  return undefined
}

/** Find a named PropertyAssignment in an ObjectLiteralExpression */
function findObjectProp(
  obj: ts.ObjectLiteralExpression,
  name: string,
): ts.PropertyAssignment | undefined {
  return obj.properties.find(
    (p): p is ts.PropertyAssignment =>
      ts.isPropertyAssignment(p) && getPropertyKeyName(p.name) === name,
  )
}

// ── JSDoc Utilities (TypeScript API) ──────────────────────────────────

function jsDocCommentToString(comment: string | ts.NodeArray<ts.JSDocComment> | undefined): string {
  if (!comment) {
    return ''
  }
  if (typeof comment === 'string') {
    return comment
  }
  return comment.map((c) => c.text).join('')
}

/** Extract the description text from JSDoc attached to a node */
function getJSDocDescription(node: ts.Node): string {
  return ts
    .getJSDocCommentsAndTags(node)
    .filter((d): d is ts.JSDoc => ts.isJSDoc(d))
    .map((doc) => jsDocCommentToString(doc.comment))
    .join(' ')
    .trim()
}

/** Extract the @default tag value from JSDoc attached to a node */
function getJSDocDefault(node: ts.Node): string | undefined {
  const tag = ts.getJSDocTags(node).find((t) => t.tagName.text === 'default')
  if (!tag) {
    return undefined
  }
  return (
    jsDocCommentToString(tag.comment)
      .trim()
      .replace(/^['"]|['"]$/g, '') || undefined
  )
}

// ── TS Program ─────────────────────────────────────────────────────────

/**
 * Create a single TS program for all source files.
 * Reads tsconfig.json from the project root when available.
 */
function createTsProgram(rootFiles: string[], projectRoot: string): ts.Program {
  let compilerOptions: ts.CompilerOptions = {
    jsx: ts.JsxEmit.Preserve,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    strict: false,
  }

  const tsconfigPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, 'tsconfig.json')
  if (tsconfigPath) {
    const { config, error } = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
    if (!error) {
      const parsed = ts.parseJsonConfigFileContent(config, ts.sys, dirname(tsconfigPath))
      compilerOptions = { ...parsed.options, noEmit: true }
    }
  }

  return ts.createProgram(rootFiles, compilerOptions)
}

// ── Variant Extraction (.class.ts) ────────────────────────────────────

function extractVariants(sourceFile: ts.SourceFile): VariantMeta[] {
  const variants: VariantMeta[] = []

  // Collect names bound via VariantProps<typeof X>
  const variantPropRefs = new Set<string>()
  visit(sourceFile, (node) => {
    if (ts.isTypeQueryNode(node) && ts.isIdentifier(node.exprName)) {
      variantPropRefs.add(node.exprName.text)
    }
  })

  visit(sourceFile, (node) => {
    if (!ts.isVariableDeclaration(node)) {
      return
    }
    if (!ts.isIdentifier(node.name)) {
      return
    }
    if (variantPropRefs.size > 0 && !variantPropRefs.has(node.name.text)) {
      return
    }
    if (!node.initializer || !ts.isCallExpression(node.initializer)) {
      return
    }

    const { expression, arguments: args } = node.initializer
    if (!ts.isIdentifier(expression) || expression.text !== 'cva') {
      return
    }

    const config = args[1]
    if (!config || !ts.isObjectLiteralExpression(config)) {
      return
    }

    // Extract defaultVariants
    const defaults: Record<string, string> = {}
    const defaultsProp = findObjectProp(config, 'defaultVariants')
    if (defaultsProp && ts.isObjectLiteralExpression(defaultsProp.initializer)) {
      for (const dp of defaultsProp.initializer.properties) {
        if (!ts.isPropertyAssignment(dp)) {
          continue
        }
        const key = getPropertyKeyName(dp.name)
        if (key && ts.isStringLiteral(dp.initializer)) {
          defaults[key] = dp.initializer.text
        }
      }
    }

    // Extract variants
    const variantsProp = findObjectProp(config, 'variants')
    if (!variantsProp || !ts.isObjectLiteralExpression(variantsProp.initializer)) {
      return
    }

    for (const vp of variantsProp.initializer.properties) {
      if (!ts.isPropertyAssignment(vp)) {
        continue
      }
      const variantName = getPropertyKeyName(vp.name)
      if (!variantName) {
        continue
      }

      const options: string[] = []
      if (ts.isObjectLiteralExpression(vp.initializer)) {
        for (const op of vp.initializer.properties) {
          if (ts.isPropertyAssignment(op)) {
            const opt = getPropertyKeyName(op.name)
            if (opt) {
              options.push(opt)
            }
          }
        }
      } else if (
        ts.isIdentifier(vp.initializer) &&
        vp.initializer.text === 'INPUT_VARIANT_CLASSES'
      ) {
        options.push('outline', 'subtle', 'ghost', 'none')
      }

      variants.push({ name: variantName, options, default: defaults[variantName] })
    }
  })

  return variants
}

// ── Shared Form Options Parsing ───────────────────────────────────────

function parseFormOptions(
  sourceFile: ts.SourceFile | undefined,
  checker: ts.TypeChecker,
): Map<string, PropMeta[]> {
  const map = new Map<string, PropMeta[]>()
  if (!sourceFile) {
    return map
  }

  visit(sourceFile, (node) => {
    if (!ts.isInterfaceDeclaration(node)) {
      return
    }

    const ifaceName = node.name.text
    const props: PropMeta[] = []

    for (const member of node.members) {
      if (!ts.isPropertySignature(member) || !member.name) {
        continue
      }
      const propName = getPropertyKeyName(member.name as ts.PropertyName)
      if (!propName) {
        continue
      }

      const typeText = member.type
        ? checker.typeToString(checker.getTypeFromTypeNode(member.type))
        : 'unknown'

      props.push({
        name: propName,
        type: typeText,
        optional: !!member.questionToken,
        description: getJSDocDescription(member),
        default: getJSDocDefault(member),
        inherited: true,
        inheritedFrom: ifaceName,
      })
    }

    map.set(ifaceName, props)
  })

  return map
}

// ── Component TSX Parsing ─────────────────────────────────────────────

interface TsxParseResult {
  props: PropMeta[]
  slots: string[]
  description: string
  polymorphic: boolean
  extendsInterfaces: string[]
}

function parseTsx(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  formOptions: Map<string, PropMeta[]>,
): TsxParseResult {
  const props: PropMeta[] = []
  const slots: string[] = []
  let description = ''
  let polymorphic = false
  const extendsInterfaces: string[] = []

  visit(sourceFile, (node) => {
    // ── Slots: type XxxSlots = 'a' | 'b' ──────────────────────────
    if (ts.isTypeAliasDeclaration(node) && node.name.text.endsWith('Slots')) {
      if (ts.isUnionTypeNode(node.type)) {
        for (const member of node.type.types) {
          if (ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal)) {
            slots.push(member.literal.text)
          }
        }
      }
    }

    // ── XxxBaseProps interface ─────────────────────────────────────
    if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('BaseProps')) {
      // Resolve extends clauses, injecting inherited form option props
      for (const clause of node.heritageClauses ?? []) {
        for (const type of clause.types) {
          if (!ts.isIdentifier(type.expression)) {
            continue
          }
          const extName = type.expression.text
          extendsInterfaces.push(extName)
          const inherited = formOptions.get(extName)
          if (inherited) {
            props.push(...inherited)
          }
        }
      }

      // Own members
      for (const member of node.members) {
        if (!ts.isPropertySignature(member) || !member.name) {
          continue
        }
        const propName = getPropertyKeyName(member.name as ts.PropertyName)
        if (!propName) {
          continue
        }

        // checker.typeToString gives the canonical, fully-normalized type string
        const typeText = member.type
          ? checker.typeToString(checker.getTypeFromTypeNode(member.type))
          : 'unknown'

        props.push({
          name: propName,
          type: typeText,
          optional: !!member.questionToken,
          description: getJSDocDescription(member),
          default: getJSDocDefault(member),
          inherited: false,
        })
      }
    }

    // ── Component description: export function Xxx() ───────────────
    if (ts.isFunctionDeclaration(node) && !description) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      if (isExported) {
        description = getJSDocDescription(node)
      }
    }

    // ── Polymorphic: PolymorphicProps<...> ─────────────────────────
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      if (node.typeName.text === 'PolymorphicProps') {
        polymorphic = true
      }
    }
  })

  return { props, slots, description, polymorphic, extendsInterfaces }
}

// ── Discovery (unchanged) ─────────────────────────────────────────────

function discoverComponents(srcDir: string) {
  const components: { tsxPath: string; classPath?: string; key: string; relDir: string }[] = []

  for (const category of ['elements', 'forms', 'navigation', 'overlays']) {
    const dir = join(srcDir, category)
    if (!existsSync(dir)) {
      continue
    }

    const files = readdirSync(dir, { recursive: true, encoding: 'utf-8' }) as string[]

    for (const match of files) {
      const normalized = match.replace(/\\/g, '/')
      if (!normalized.endsWith('.tsx')) {
        continue
      }
      if (normalized.endsWith('.test.tsx')) {
        continue
      }
      if (normalized.includes('shared-overlay-menu')) {
        continue
      }

      const fullPath = join(dir, match)
      const relDir = `${category}/${dirname(normalized)}`
      const key = basename(dirname(normalized))
      const classPath = fullPath.replace(/\.tsx$/, '.class.ts')
      const fileName = basename(normalized, '.tsx')
      if (fileName !== key) {
        continue
      }

      components.push({
        tsxPath: fullPath,
        classPath: existsSync(classPath) ? classPath : undefined,
        key,
        relDir,
      })
    }
  }

  return components
}

// ── Extraction ────────────────────────────────────────────────────────

function extractAll(srcDir: string, outDir: string): RegistryEntry[] {
  mkdirSync(outDir, { recursive: true })

  const discovered = discoverComponents(srcDir)
  const formOptionsFile = join(srcDir, 'forms/form-field/form-options.ts')

  // ── Single shared program for all files ───────────────────────────
  // This avoids redundant parsing and enables cross-file type resolution.
  const rootFiles = [
    ...(existsSync(formOptionsFile) ? [formOptionsFile] : []),
    ...discovered.map((c) => c.tsxPath),
    ...discovered.flatMap((c) => (c.classPath ? [c.classPath] : [])),
  ]
  const program = createTsProgram(rootFiles, srcDir)
  const checker = program.getTypeChecker()

  // Parse shared form options once
  const formOptions = parseFormOptions(program.getSourceFile(formOptionsFile), checker)

  const registry: RegistryEntry[] = []

  for (const comp of discovered) {
    const parentDir = comp.relDir.split('/')[0]
    const category = DIR_CATEGORY[parentDir]
    if (!category) {
      continue
    }

    const name = kebabToPascal(comp.key)

    const classSF = comp.classPath ? program.getSourceFile(comp.classPath) : undefined
    const variants = classSF ? extractVariants(classSF) : []

    const tsxSF = program.getSourceFile(comp.tsxPath)
    if (!tsxSF) {
      continue
    }

    const { props, slots, description, polymorphic, extendsInterfaces } = parseTsx(
      tsxSF,
      checker,
      formOptions,
    )

    // Inject variant props not already declared in the interface
    if (extendsInterfaces.some((e) => e.endsWith('VariantProps')) && variants.length > 0) {
      for (const v of variants) {
        if (['hasLeading', 'hasTrailing', 'type'].includes(v.name)) {
          continue
        }
        if (props.some((p) => p.name === v.name)) {
          continue
        }
        props.push({
          name: v.name,
          type: v.options.map((o) => `'${o}'`).join(' | '),
          optional: true,
          description: `Visual ${v.name} of the component.`,
          default: v.default,
          inherited: false,
        })
      }
    }

    // Normalize display types (XxxClasses → SlotClasses<...>, etc.)
    for (const prop of props) {
      prop.type = resolveDisplayType(prop.type)
    }

    const meta: ComponentMeta = {
      name,
      key: comp.key,
      sourcePath: relative(srcDir, comp.tsxPath).replaceAll('\\', '/'),
      category,
      description,
      props,
      variants,
      slots,
      polymorphic,
    }

    writeFileSync(join(outDir, `${comp.key}.json`), JSON.stringify(meta, null, 2))
    registry.push({ key: comp.key, name, category })
  }

  registry.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category)
    const bi = CATEGORY_ORDER.indexOf(b.category)
    return ai !== bi ? ai - bi : a.name.localeCompare(b.name)
  })

  writeFileSync(join(outDir, 'index.json'), JSON.stringify(registry, null, 2))
  return registry
}

// ── Plugin (unchanged) ────────────────────────────────────────────────

export function componentMetaPlugin(): Plugin {
  let srcDir: string
  let outDir: string
  let logger: Logger

  return {
    name: 'rock-ui-component-meta',
    configResolved(config) {
      const projectRoot = resolve(config.root, '..')
      srcDir = join(projectRoot, 'src')
      outDir = join(config.root, '.meta')
      logger = config.logger
    },
    buildStart() {
      const registry = extractAll(srcDir, outDir)
      const grouped = Map.groupBy(registry, (e) => e.category)
      const lines = [`extracted metadata for ${registry.length} components`]
      for (const [category, entries] of grouped) {
        lines.push(`  ${category.padEnd(12)} ${entries.map((e) => e.name).join(', ')}`)
      }
      logger.info(lines.join('\n'), { timestamp: true })
    },
    configureServer(server) {
      server.watcher.add(srcDir)
      let timer: ReturnType<typeof setTimeout> | null = null

      server.watcher.on('change', (changed) => {
        const norm = changed.replace(/\\/g, '/')
        const srcNorm = srcDir.replace(/\\/g, '/')
        if (!norm.startsWith(srcNorm)) {
          return
        }
        if (!norm.endsWith('.ts') && !norm.endsWith('.tsx')) {
          return
        }
        if (norm.endsWith('.test.tsx') || norm.endsWith('.test.ts')) {
          return
        }

        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          const registry = extractAll(srcDir, outDir)
          logger.info(`re-extracted metadata for ${registry.length} components`, {
            timestamp: true,
          })
          timer = null
        }, 200)
      })
    },
  }
}

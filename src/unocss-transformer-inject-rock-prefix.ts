import * as ts from 'typescript'
import type { SourceCodeTransformer } from 'unocss'

import { ROCK_PREFIX } from './unocss-preset-theme'

interface Replacement {
  start: number
  end: number
  value: string
}

type ClassStringLiteral = ts.StringLiteral | ts.NoSubstitutionTemplateLiteral

const TSX_SUFFIX = '.tsx'
const CLASS_TS_SUFFIX = '.class.ts'

function isClassFile(id: string): boolean {
  return id.endsWith(CLASS_TS_SUFFIX)
}

function isTsxFile(id: string): boolean {
  return id.endsWith(TSX_SUFFIX)
}

function isClassStringLiteral(node: ts.Node | undefined): node is ClassStringLiteral {
  return Boolean(node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)))
}

function getPropertyNameText(name: ts.PropertyName): string | undefined {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNoSubstitutionTemplateLiteral(name)
  ) {
    return name.text
  }

  return undefined
}

function getObjectProperty(
  objectLiteral: ts.ObjectLiteralExpression,
  name: string,
): ts.PropertyAssignment | undefined {
  return objectLiteral.properties.find((property): property is ts.PropertyAssignment => {
    return ts.isPropertyAssignment(property) && getPropertyNameText(property.name) === name
  })
}

function getCallName(expression: ts.LeftHandSideExpression): string | undefined {
  if (ts.isIdentifier(expression)) {
    return expression.text
  }

  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.text
  }

  return undefined
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression

  while (true) {
    if (ts.isParenthesizedExpression(current)) {
      current = current.expression
      continue
    }

    if (ts.isAsExpression(current)) {
      current = current.expression
      continue
    }

    if (ts.isSatisfiesExpression(current)) {
      current = current.expression
      continue
    }

    if (ts.isTypeAssertionExpression(current)) {
      current = current.expression
      continue
    }

    if (ts.isNonNullExpression(current)) {
      current = current.expression
      continue
    }

    break
  }

  return current
}

function queueReplacement(
  replacements: Map<string, Replacement>,
  literal: ClassStringLiteral,
  source: string,
  prefix: string,
): void {
  const start = literal.getStart() + 1
  const end = literal.end - 1
  const key = `${start}:${end}`
  const originalValue = source.slice(start, end)
  const nextValue = prefixClassList(originalValue, prefix)

  if (nextValue === originalValue) {
    return
  }

  replacements.set(key, { start, end, value: nextValue })
}

function collectVariantLeafClassLiterals(
  objectLiteral: ts.ObjectLiteralExpression,
  source: string,
  prefix: string,
  replacements: Map<string, Replacement>,
): void {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue
    }

    const { initializer } = property

    if (isClassStringLiteral(initializer)) {
      queueReplacement(replacements, initializer, source, prefix)
      continue
    }

    if (ts.isObjectLiteralExpression(initializer)) {
      collectVariantLeafClassLiterals(initializer, source, prefix, replacements)
    }
  }
}

function collectCvaClassReplacements(
  call: ts.CallExpression,
  source: string,
  prefix: string,
  replacements: Map<string, Replacement>,
): void {
  const base = call.arguments[0]
  if (isClassStringLiteral(base)) {
    queueReplacement(replacements, base, source, prefix)
  }

  const config = call.arguments[1]
  if (!ts.isObjectLiteralExpression(config)) {
    return
  }

  const variantsProperty = getObjectProperty(config, 'variants')
  if (variantsProperty && ts.isObjectLiteralExpression(variantsProperty.initializer)) {
    collectVariantLeafClassLiterals(variantsProperty.initializer, source, prefix, replacements)
  }

  const compoundVariantsProperty = getObjectProperty(config, 'compoundVariants')
  if (
    !compoundVariantsProperty ||
    !ts.isArrayLiteralExpression(compoundVariantsProperty.initializer)
  ) {
    return
  }

  for (const element of compoundVariantsProperty.initializer.elements) {
    if (!ts.isObjectLiteralExpression(element)) {
      continue
    }

    const classProperty = getObjectProperty(element, 'class')
    if (!classProperty || !isClassStringLiteral(classProperty.initializer)) {
      continue
    }

    queueReplacement(replacements, classProperty.initializer, source, prefix)
  }
}

function collectClassFileReplacements(
  sourceFile: ts.SourceFile,
  source: string,
  prefix: string,
  replacements: Map<string, Replacement>,
): void {
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && getCallName(node.expression) === 'cva') {
      collectCvaClassReplacements(node, source, prefix, replacements)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

function collectClassOperandReplacements(
  expression: ts.Expression | undefined,
  source: string,
  prefix: string,
  replacements: Map<string, Replacement>,
  insideClassesArg = false,
): void {
  if (!expression) {
    return
  }

  const current = unwrapExpression(expression)

  if (isClassStringLiteral(current)) {
    queueReplacement(replacements, current, source, prefix)
    return
  }

  if (ts.isConditionalExpression(current)) {
    collectClassOperandReplacements(
      current.whenTrue,
      source,
      prefix,
      replacements,
      insideClassesArg,
    )
    collectClassOperandReplacements(
      current.whenFalse,
      source,
      prefix,
      replacements,
      insideClassesArg,
    )
    return
  }

  if (ts.isBinaryExpression(current)) {
    const operator = current.operatorToken.kind
    if (
      operator === ts.SyntaxKind.AmpersandAmpersandToken ||
      operator === ts.SyntaxKind.BarBarToken ||
      operator === ts.SyntaxKind.QuestionQuestionToken
    ) {
      collectClassOperandReplacements(current.right, source, prefix, replacements, insideClassesArg)
    }

    return
  }

  if (ts.isArrayLiteralExpression(current)) {
    for (const element of current.elements) {
      if (ts.isExpression(element)) {
        collectClassOperandReplacements(element, source, prefix, replacements, insideClassesArg)
      }
    }

    return
  }

  if (!ts.isCallExpression(current)) {
    return
  }

  const callName = getCallName(current.expression)
  if (callName === 'cn') {
    if (insideClassesArg) {
      return
    }

    for (const argument of current.arguments) {
      collectClassOperandReplacements(argument, source, prefix, replacements, insideClassesArg)
    }

    return
  }

  if (callName?.endsWith('Variants')) {
    for (const argument of current.arguments.slice(1)) {
      collectClassOperandReplacements(argument, source, prefix, replacements, true)
    }
  }
}

function collectTsxReplacements(
  sourceFile: ts.SourceFile,
  source: string,
  prefix: string,
  replacements: Map<string, Replacement>,
): void {
  const visit = (node: ts.Node): void => {
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'class' &&
      node.initializer
    ) {
      if (ts.isStringLiteral(node.initializer)) {
        queueReplacement(replacements, node.initializer, source, prefix)
      } else if (ts.isJsxExpression(node.initializer)) {
        collectClassOperandReplacements(node.initializer.expression, source, prefix, replacements)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

export function prefixClassList(value: string, prefix = ROCK_PREFIX): string {
  const tokens = value.match(/\S+/g)

  if (!tokens) {
    return value
  }

  return tokens.map((token) => (token.startsWith(prefix) ? token : `${prefix}${token}`)).join(' ')
}

export function createInjectRockPrefixTransformer(prefix = ROCK_PREFIX): SourceCodeTransformer {
  return {
    name: 'transformer-inject-rock-prefix',
    enforce: 'pre',
    idFilter: (id) => isClassFile(id) || isTsxFile(id),
    transform(code, id) {
      const source = code.toString()
      const sourceFile = ts.createSourceFile(
        id,
        source,
        ts.ScriptTarget.Latest,
        true,
        isTsxFile(id) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      )
      const replacements = new Map<string, Replacement>()

      if (isClassFile(id)) {
        collectClassFileReplacements(sourceFile, source, prefix, replacements)
      } else {
        collectTsxReplacements(sourceFile, source, prefix, replacements)
      }

      const sorted = Array.from(replacements.values()).sort((a, b) => b.start - a.start)
      if (sorted.length === 0) {
        return
      }

      let nextSource = source
      for (const replacement of sorted) {
        nextSource =
          nextSource.slice(0, replacement.start) +
          replacement.value +
          nextSource.slice(replacement.end)
      }

      if (nextSource !== source) {
        code.overwrite(0, code.original.length, nextSource)
      }
    },
  }
}

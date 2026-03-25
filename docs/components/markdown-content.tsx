export interface MarkdownContentProps {
  html: string
}

export const MarkdownContent = (props: MarkdownContentProps) => {
  return (
    // oxlint-disable-next-line solid/no-innerhtml
    <section
      class="max-w-none prose prose-slate prose-headings:(text-foreground font-semibold mb-3 mt-8) prose-p:(text-muted-foreground leading-7) prose-pre:(border border-border rounded-xl bg-muted) dark:(prose-invert)"
      // oxlint-disable-next-line solid/no-innerhtml
      innerHTML={props.html}
    />
  )
}

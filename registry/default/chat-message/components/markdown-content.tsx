import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { isValidElement, memo, useMemo } from "react"

import type { Highlighter } from "shiki"

export type MarkdownContentProps = {
  /** The raw markdown string to render. */
  content: string
  className?: string
  /**
   * Shiki highlighter instance for syntax-highlighted code blocks.
   * When omitted, code blocks render as plain monospace text.
   */
  highlighter?: Highlighter
  /**
   * Shiki theme to use for code highlighting.
   * @default "github-dark-dimmed"
   */
  theme?: string
}

const CODE_BLOCK_TRANSFORMERS = [
  {
    pre(node: { properties: Record<string, unknown> }) {
      const existing = String(node.properties.style ?? "")
      node.properties.style =
        `${existing};padding:0.75rem 1rem;margin:0;overflow-x:auto;border-radius:0.5rem;`
    },
  },
]

export const MarkdownContent = memo(function MarkdownContent({
  content,
  className,
  highlighter,
  theme = "github-dark-dimmed",
}: MarkdownContentProps) {
  const components = useMemo(
    () => buildComponents(highlighter, theme),
    [highlighter, theme],
  )

  return (
    <div className={`flex flex-col gap-2 min-w-0 overflow-hidden ${className ?? ""}`}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  )
})

// ---------------------------------------------------------------------------
// Component overrides
// ---------------------------------------------------------------------------

function buildComponents(highlighter: Highlighter | undefined, theme: string) {
  return {
    pre({ children }: { children?: React.ReactNode }) {
      if (isValidElement(children) && highlighter) {
        const props = children.props as Record<string, unknown>
        const match = /language-(\w+)/.exec(String(props.className ?? ""))
        if (match) {
          const code = extractText(props.children).replace(/\n$/, "")
          try {
            const html = highlighter.codeToHtml(code, {
              lang: match[1],
              theme,
              transformers: CODE_BLOCK_TRANSFORMERS,
            })
            return <div dangerouslySetInnerHTML={{ __html: html }} />
          } catch {
            /* language not loaded — fall through to plain */
          }
        }
      }
      return (
        <pre className="bg-foreground/8 rounded-lg px-4 py-3 overflow-x-auto m-0 text-[13px] leading-relaxed font-mono">
          {children}
        </pre>
      )
    },

    code({
      className,
      children,
      ...rest
    }: React.ComponentPropsWithoutRef<"code">) {
      if (className?.startsWith("language-")) {
        return (
          <code className="font-mono" {...rest}>
            {children}
          </code>
        )
      }
      return (
        <code
          className="bg-foreground/8 px-1.5 py-0.5 rounded text-[0.9em] font-mono"
          {...rest}
        >
          {children}
        </code>
      )
    },

    p({ children }: { children?: React.ReactNode }) {
      return <p className="m-0 leading-relaxed">{children}</p>
    },

    ol({ children }: { children?: React.ReactNode }) {
      return <ol className="m-0 pl-6 leading-relaxed">{children}</ol>
    },

    ul({ children }: { children?: React.ReactNode }) {
      return <ul className="m-0 pl-6 leading-relaxed">{children}</ul>
    },

    li({ children }: { children?: React.ReactNode }) {
      return <li className="my-1">{children}</li>
    },

    a({
      href,
      children,
      ...rest
    }: React.ComponentPropsWithoutRef<"a">) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...rest}
        >
          {children}
        </a>
      )
    },

    blockquote({ children }: { children?: React.ReactNode }) {
      return (
        <blockquote className="border-l-[3px] border-border m-0 py-1 pl-4 text-muted-foreground">
          {children}
        </blockquote>
      )
    },

    hr() {
      return <hr className="border-none border-t border-border my-2" />
    },

    h1({ children }: { children?: React.ReactNode }) {
      return <h1 className="font-semibold m-0 leading-tight text-[1.5em]">{children}</h1>
    },

    h2({ children }: { children?: React.ReactNode }) {
      return <h2 className="font-semibold m-0 leading-tight text-[1.3em]">{children}</h2>
    },

    h3({ children }: { children?: React.ReactNode }) {
      return <h3 className="font-semibold m-0 leading-tight text-[1.15em]">{children}</h3>
    },

    table({ children }: { children?: React.ReactNode }) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm leading-normal">{children}</table>
        </div>
      )
    },

    th({ children }: { children?: React.ReactNode }) {
      return (
        <th className="text-left font-semibold px-3 py-1.5 border-b border-border whitespace-nowrap">
          {children}
        </th>
      )
    },

    td({ children }: { children?: React.ReactNode }) {
      return (
        <td className="px-3 py-1.5 border-b border-border">{children}</td>
      )
    },
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively extract plain text from React children. */
function extractText(node: unknown): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  return ""
}

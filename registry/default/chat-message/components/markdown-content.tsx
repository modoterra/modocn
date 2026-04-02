import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { isValidElement, memo, useMemo, type CSSProperties } from "react"

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
    <div className={className} style={styles.root}>
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
      return <pre style={styles.codeBlock}>{children}</pre>
    },

    code({
      className,
      children,
      ...rest
    }: React.ComponentPropsWithoutRef<"code">) {
      if (className?.startsWith("language-")) {
        return (
          <code style={styles.codeInner} {...rest}>
            {children}
          </code>
        )
      }
      return (
        <code style={styles.inlineCode} {...rest}>
          {children}
        </code>
      )
    },

    p({ children }: { children?: React.ReactNode }) {
      return <p style={styles.paragraph}>{children}</p>
    },

    ol({ children }: { children?: React.ReactNode }) {
      return <ol style={styles.ol}>{children}</ol>
    },

    ul({ children }: { children?: React.ReactNode }) {
      return <ul style={styles.ul}>{children}</ul>
    },

    li({ children }: { children?: React.ReactNode }) {
      return <li style={styles.li}>{children}</li>
    },

    a({
      href,
      children,
      ...rest
    }: React.ComponentPropsWithoutRef<"a">) {
      return (
        <a
          href={href}
          style={styles.link}
          target="_blank"
          rel="noopener noreferrer"
          {...rest}
        >
          {children}
        </a>
      )
    },

    blockquote({ children }: { children?: React.ReactNode }) {
      return <blockquote style={styles.blockquote}>{children}</blockquote>
    },

    hr() {
      return <hr style={styles.hr} />
    },

    h1({ children }: { children?: React.ReactNode }) {
      return (
        <h1 style={{ ...styles.heading, fontSize: "1.5em" }}>{children}</h1>
      )
    },

    h2({ children }: { children?: React.ReactNode }) {
      return (
        <h2 style={{ ...styles.heading, fontSize: "1.3em" }}>{children}</h2>
      )
    },

    h3({ children }: { children?: React.ReactNode }) {
      return (
        <h3 style={{ ...styles.heading, fontSize: "1.15em" }}>{children}</h3>
      )
    },

    table({ children }: { children?: React.ReactNode }) {
      return (
        <div style={styles.tableScroll}>
          <table style={styles.table}>{children}</table>
        </div>
      )
    },

    th({ children }: { children?: React.ReactNode }) {
      return <th style={styles.th}>{children}</th>
    },

    td({ children }: { children?: React.ReactNode }) {
      return <td style={styles.td}>{children}</td>
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const MONO_FONT =
  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace"

const styles: Record<string, CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5em",
    minWidth: 0,
    overflow: "hidden",
  },
  paragraph: {
    margin: 0,
    lineHeight: 1.6,
  },
  codeBlock: {
    background: "color-mix(in srgb, var(--foreground) 8%, transparent)",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    overflowX: "auto",
    margin: 0,
    fontSize: "13px",
    lineHeight: "1.5",
    fontFamily: MONO_FONT,
  },
  codeInner: {
    fontFamily: MONO_FONT,
  },
  inlineCode: {
    background: "color-mix(in srgb, var(--foreground) 8%, transparent)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "0.9em",
    fontFamily: MONO_FONT,
  },
  ol: {
    margin: 0,
    paddingLeft: "1.5em",
    lineHeight: 1.6,
  },
  ul: {
    margin: 0,
    paddingLeft: "1.5em",
    lineHeight: 1.6,
  },
  li: {
    margin: "0.25em 0",
  },
  link: {
    color: "oklch(0.7 0.1 220)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  blockquote: {
    borderLeft: "3px solid var(--border)",
    margin: 0,
    padding: "0.25em 0 0.25em 1em",
    color: "var(--muted-foreground)",
  },
  hr: {
    border: "none",
    borderTop: "1px solid var(--border)",
    margin: "0.5em 0",
  },
  heading: {
    fontWeight: 600,
    margin: 0,
    lineHeight: 1.3,
    color: "inherit",
  },
  tableScroll: {
    overflowX: "auto" as const,
    WebkitOverflowScrolling: "touch" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "0.875em",
    lineHeight: 1.5,
  },
  th: {
    textAlign: "left" as const,
    fontWeight: 600,
    padding: "0.375em 0.75em",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "0.375em 0.75em",
    borderBottom: "1px solid var(--border)",
  },
}

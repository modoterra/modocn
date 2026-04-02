import { memo, useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "@/src/components/theme-provider"
import { getSingletonHighlighter } from "shiki"

import type { CSSProperties, ReactNode } from "react"
import type { Highlighter } from "shiki"

type PlaygroundProps = {
  children: ReactNode
  code: string
}

type Tab = "preview" | "code"

const DARK_THEME = "github-dark-dimmed"
const LIGHT_THEME = "github-light"

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({
      themes: [DARK_THEME, LIGHT_THEME],
      langs: ["tsx"],
    })
  }
  return highlighterPromise
}

function useHighlightedCode(code: string, theme: string): string {
  const [html, setHtml] = useState("")

  useEffect(() => {
    let cancelled = false
    getHighlighter().then((highlighter) => {
      if (cancelled) return
      const result = highlighter.codeToHtml(code, {
        lang: "tsx",
        theme,
      })
      setHtml(result)
    })
    return () => {
      cancelled = true
    }
  }, [code, theme])

  return html
}

export const Playground = memo(function Playground({
  children,
  code,
}: PlaygroundProps) {
  const [tab, setTab] = useState<Tab>("preview")
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()
  const shikiTheme = theme === "dark" ? DARK_THEME : LIGHT_THEME
  const highlightedHtml = useHighlightedCode(code, shikiTheme)
  const timerRef = useRef(0)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div>
      <div style={styles.tabBar}>
        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => setTab("preview")}
            style={{
              ...styles.tab,
              ...(tab === "preview" ? styles.tabActive : undefined),
            }}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setTab("code")}
            style={{
              ...styles.tab,
              ...(tab === "code" ? styles.tabActive : undefined),
            }}
          >
            Code
          </button>
        </div>
        {tab === "code" && (
          <button
            type="button"
            onClick={handleCopy}
            style={styles.copyButton}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {tab === "preview" ? (
        children
      ) : (
        <div style={styles.codeWrapper}>
          {highlightedHtml ? (
            <div
              style={styles.codeInner}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre style={styles.codeFallback}>
              <code>{code}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  )
})

const styles: Record<string, CSSProperties> = {
  tabBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
    marginBottom: "1rem",
    borderBottom: "1px solid var(--border)",
  },
  tabs: {
    display: "flex",
    gap: "0",
  },
  tab: {
    background: "none",
    border: "none",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid" as const,
    borderBottomColor: "transparent",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "var(--muted-foreground)",
    padding: "0.5rem 0.75rem",
    marginBottom: "-1px",
    transition: "color 0.15s, border-color 0.15s",
  },
  tabActive: {
    color: "var(--foreground)",
    borderBottomColor: "var(--foreground)",
  },
  copyButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.625rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "var(--muted-foreground)",
    padding: "0.25rem 0",
  },
  codeWrapper: {
    border: "1px solid var(--border)",
    background: "var(--card)",
    maxHeight: "32rem",
    overflowY: "auto" as const,
  },
  codeInner: {
    padding: "1rem",
    fontSize: "0.8125rem",
    lineHeight: 1.6,
    overflowX: "auto" as const,
  },
  codeFallback: {
    padding: "1rem",
    fontSize: "0.8125rem",
    lineHeight: 1.6,
    overflowX: "auto" as const,
    margin: 0,
    whiteSpace: "pre" as const,
  },
}

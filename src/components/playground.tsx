import { memo, useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "@/src/components/theme-provider"
import { getSingletonHighlighter } from "shiki"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { ReactNode } from "react"
import type { Highlighter } from "shiki"

type PlaygroundProps = {
  children: ReactNode
  code: string
}

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
    <Tabs defaultValue="preview">
      <div className="flex items-center justify-between gap-5 mb-14">
        <TabsList className="h-12">
          <TabsTrigger value="preview" className="px-5 py-3.5">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="px-5 py-3.5">
            Code
          </TabsTrigger>
        </TabsList>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-auto px-0 py-2"
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <TabsContent value="preview" className="mt-0">
        {children}
      </TabsContent>

      <TabsContent value="code" className="mt-0">
        <div className="max-h-[32rem] overflow-y-auto">
          {highlightedHtml ? (
            <div
              className="overflow-x-auto p-9"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre className="m-0 overflow-x-auto whitespace-pre p-9">
              <code>{code}</code>
            </pre>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
})

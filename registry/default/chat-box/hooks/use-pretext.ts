import { useMemo, useRef } from "react"

import { layout, prepare } from "@chenglou/pretext"

import type { PretextMeasureResult } from "@/registry/default/chat-box/lib/types"

type CacheEntry = {
  text: string
  font: string
  whiteSpace: "normal" | "pre-wrap"
  prepared: ReturnType<typeof prepare>
}

/**
 * React hook that wraps pretext's `prepare()` + `layout()` cycle.
 *
 * `prepare()` is the expensive one-time pass (text segmentation, measurement).
 * `layout()` is the cheap hot path (pure arithmetic over cached widths).
 *
 * This hook memoizes `prepare()` and only re-runs it when the text, font,
 * or whiteSpace mode changes. `layout()` re-runs whenever maxWidth or
 * lineHeight changes, which is very cheap.
 *
 * @example
 * ```tsx
 * const { height, lineCount } = usePretextMeasure({
 *   text: "Hello world, this is a long message",
 *   font: "16px Inter",
 *   maxWidth: 320,
 *   lineHeight: 24,
 * })
 * ```
 */
export function usePretextMeasure(options: {
  text: string
  font: string
  maxWidth: number
  lineHeight: number
  whiteSpace?: "normal" | "pre-wrap"
}): PretextMeasureResult {
  const { text, font, maxWidth, lineHeight, whiteSpace = "normal" } = options

  // Cache the prepared result. Only re-prepare when text/font/whiteSpace change.
  const cacheRef = useRef<CacheEntry | null>(null)

  const prepared = useMemo(() => {
    const cached = cacheRef.current
    if (
      cached &&
      cached.text === text &&
      cached.font === font &&
      cached.whiteSpace === whiteSpace
    ) {
      return cached.prepared
    }

    const opts = whiteSpace === "pre-wrap" ? { whiteSpace } : undefined
    const result = prepare(text, font, opts)

    cacheRef.current = { text, font, whiteSpace, prepared: result }
    return result
  }, [text, font, whiteSpace])

  // layout() is pure arithmetic — very cheap to call on every render
  return useMemo(() => {
    if (!text) {
      return { height: lineHeight, lineCount: 1 }
    }
    return layout(prepared, maxWidth, lineHeight)
  }, [prepared, maxWidth, lineHeight, text])
}

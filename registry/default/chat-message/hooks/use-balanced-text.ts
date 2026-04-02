import { useMemo, useRef } from "react"

import { prepareWithSegments, walkLineRanges } from "@chenglou/pretext"
import type { PreparedTextWithSegments } from "@chenglou/pretext"

type CacheEntry = {
  text: string
  font: string
  whiteSpace: "normal" | "pre-wrap"
  prepared: PreparedTextWithSegments
}

/**
 * React hook that computes the tightest container width
 * for balanced, shrink-wrapped text layout.
 *
 * Uses pretext's `prepareWithSegments` + `walkLineRanges` with
 * a binary search to find the narrowest width that doesn't
 * increase the line count. This produces visually balanced
 * lines — something CSS cannot do.
 *
 * @example
 * ```tsx
 * const { width, height, lineCount } = useBalancedText({
 *   text: message.content,
 *   font: "16px Inter",
 *   maxWidth: 400,
 *   lineHeight: 24,
 * })
 *
 * <div style={{ width }}>{message.content}</div>
 * ```
 */
export function useBalancedText(options: {
  text: string
  font: string
  maxWidth: number
  lineHeight: number
  whiteSpace?: "normal" | "pre-wrap"
}): { width: number; height: number; lineCount: number } {
  const { text, font, maxWidth, lineHeight, whiteSpace = "normal" } = options

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

    const opts =
      whiteSpace === "pre-wrap" ? { whiteSpace } : undefined
    const result = prepareWithSegments(text, font, opts)

    cacheRef.current = { text, font, whiteSpace, prepared: result }
    return result
  }, [text, font, whiteSpace])

  return useMemo(() => {
    if (!text) {
      return { width: 0, height: lineHeight, lineCount: 1 }
    }

    // Measure at maxWidth to get baseline line count and widest line
    let baseLineCount = 0
    let maxLineWidth = 0
    walkLineRanges(prepared, maxWidth, (line) => {
      baseLineCount++
      if (line.width > maxLineWidth) maxLineWidth = line.width
    })

    // Single line — just use the actual width
    if (baseLineCount <= 1) {
      return {
        width: Math.ceil(maxLineWidth),
        height: lineHeight,
        lineCount: 1,
      }
    }

    // Binary search for the tightest width where line count stays the same.
    // 15 iterations gives sub-pixel precision over typical ranges.
    let lo = 0
    let hi = maxLineWidth

    for (let i = 0; i < 15; i++) {
      const mid = (lo + hi) / 2
      let count = 0
      walkLineRanges(prepared, mid, () => {
        count++
      })
      if (count <= baseLineCount) {
        hi = mid
      } else {
        lo = mid
      }
    }

    // Get actual line metrics at the found width
    let finalLineCount = 0
    walkLineRanges(prepared, hi, () => {
      finalLineCount++
    })

    return {
      width: Math.ceil(hi),
      height: finalLineCount * lineHeight,
      lineCount: finalLineCount,
    }
  }, [prepared, maxWidth, lineHeight, text])
}

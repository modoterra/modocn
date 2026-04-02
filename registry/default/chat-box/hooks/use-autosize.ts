import type { AutosizeOptions, AutosizeResult } from "@/registry/default/chat-box/lib/types"
import { usePretextMeasure } from "@/registry/default/chat-box/hooks/use-pretext"

/**
 * React hook for auto-sizing a textarea using pretext measurements.
 *
 * Uses pretext to calculate the exact height the text needs without
 * touching the DOM or triggering layout reflow. Pass `pre-wrap` as
 * whiteSpace to preserve hard line breaks (like a textarea does).
 *
 * Returns a `height` value (in px) you can apply directly to your
 * textarea's style. The height is clamped between `minHeight` and
 * `maxHeight` if provided.
 *
 * @example
 * ```tsx
 * const [input, setInput] = useState("")
 * const { height } = useAutosize({
 *   text: input,
 *   font: "16px Inter",
 *   maxWidth: 600,
 *   lineHeight: 24,
 *   minHeight: 48,
 *   maxHeight: 200,
 *   whiteSpace: "pre-wrap",
 * })
 *
 * <textarea
 *   value={input}
 *   onChange={e => setInput(e.target.value)}
 *   style={{ height, overflowY: height >= 200 ? "auto" : "hidden" }}
 * />
 * ```
 */
export function useAutosize(options: AutosizeOptions): AutosizeResult {
  const { minHeight, maxHeight, ...measureOptions } = options

  const { height: measuredHeight, lineCount } = usePretextMeasure({
    ...measureOptions,
    // Textareas preserve whitespace and hard breaks
    whiteSpace: measureOptions.whiteSpace ?? "pre-wrap",
  })

  let height = measuredHeight
  if (minHeight !== undefined && height < minHeight) height = minHeight
  if (maxHeight !== undefined && height > maxHeight) height = maxHeight

  return { height, lineCount }
}

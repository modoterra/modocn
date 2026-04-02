import { useCallback, useEffect, useRef, useState } from "react"

export type ChatScrollState = {
  /** Current scroll position from top. */
  scrollTop: number
  /** Whether the user is scrolled to the bottom. */
  isAtBottom: boolean
  /** Ref to attach to the scrollable container element. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Call this to scroll to the bottom programmatically. */
  scrollToBottom: (behavior?: ScrollBehavior) => void
  /** Call this on every scroll event (attach to onScroll). */
  onScroll: () => void
}

/**
 * Manages scroll position for a chat message list.
 *
 * Automatically sticks to the bottom when new messages arrive
 * (streaming tokens). Detaches when the user scrolls up.
 */
export function useChatScroll(options: {
  /** Total scrollable height of the virtualized list. */
  totalHeight: number
  /** Threshold in px to consider "at bottom". Default 40. */
  threshold?: number
}): ChatScrollState {
  const { totalHeight, threshold = 40 } = options

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const prevTotalHeightRef = useRef(totalHeight)

  const checkIsAtBottom = useCallback(() => {
    const el = containerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
  }, [threshold])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
    setScrollTop(el.scrollTop)
    setIsAtBottom(true)
  }, [])

  const onScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setScrollTop(el.scrollTop)
    setIsAtBottom(checkIsAtBottom())
  }, [checkIsAtBottom])

  // Auto-scroll when totalHeight grows and we were at bottom
  useEffect(() => {
    if (totalHeight > prevTotalHeightRef.current && isAtBottom) {
      scrollToBottom("instant")
    }
    prevTotalHeightRef.current = totalHeight
  }, [totalHeight, isAtBottom, scrollToBottom])

  return {
    scrollTop,
    isAtBottom,
    containerRef,
    scrollToBottom,
    onScroll,
  }
}

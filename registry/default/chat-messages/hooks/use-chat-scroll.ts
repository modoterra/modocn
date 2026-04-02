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
 *
 * Uses a continuous rAF polling loop while scrolling is active.
 * scrollTop is read fresh from the DOM during every render to
 * eliminate the lag between state updates and paint.
 */
export function useChatScroll(options: {
  /** Total scrollable height of the virtualized list. */
  totalHeight: number
  /** Threshold in px to consider "at bottom". Default 40. */
  threshold?: number
}): ChatScrollState {
  const { totalHeight, threshold = 40 } = options

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const prevTotalHeightRef = useRef(totalHeight)

  // Trigger counter — only purpose is to force a re-render.
  // The actual scrollTop value is read fresh from the DOM below.
  const [, setScrollTick] = useState(0)

  // Read scrollTop fresh from the DOM every render — no stale state lag.
  const scrollTop = containerRef.current?.scrollTop ?? 0

  const checkIsAtBottom = useCallback(() => {
    const el = containerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
  }, [threshold])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
    setScrollTick((t) => t + 1)
    setIsAtBottom(true)
  }, [])

  const rafRef = useRef(0)
  const idleTimerRef = useRef(0)
  const lastScrollTopRef = useRef(0)

  // Continuous rAF loop — polls scrollTop every frame while active
  const tick = useCallback(() => {
    const el = containerRef.current
    if (!el) {
      rafRef.current = 0
      return
    }
    const top = el.scrollTop
    if (top !== lastScrollTopRef.current) {
      lastScrollTopRef.current = top
      setScrollTick((t) => t + 1)
      setIsAtBottom(checkIsAtBottom())
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [checkIsAtBottom])

  const stopPolling = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    // Final re-render to catch the resting position
    setScrollTick((t) => t + 1)
    setIsAtBottom(checkIsAtBottom())
  }, [checkIsAtBottom])

  const onScroll = useCallback(() => {
    // Start the rAF polling loop if not already running
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tick)
    }
    // Reset the idle timer — stop polling after scrolling settles
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = window.setTimeout(stopPolling, 150)
  }, [tick, stopPolling])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

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

import { useMemo } from "react"

import type { MessageHeight } from "@/registry/default/chat-messages/hooks/use-message-heights"

export type VirtualMessage = {
  index: number
  id: string
  offsetTop: number
  height: number
}

export type VirtualResult = {
  /** Messages visible in the viewport (plus overscan). */
  virtualMessages: VirtualMessage[]
  /** Total scrollable height of all messages combined. */
  totalHeight: number
  /** All message offsets (useful for scrolling to a specific message). */
  offsets: number[]
}

export type VirtualMetrics = {
  totalHeight: number
  offsets: number[]
}

export function useVirtualMetrics(options: {
  heights: MessageHeight[]
  gap?: number
}): VirtualMetrics {
  const { heights, gap = 0 } = options

  return useMemo(() => {
    if (heights.length === 0) {
      return { totalHeight: 0, offsets: [] }
    }

    const offsets: number[] = []
    let offset = 0

    for (let i = 0; i < heights.length; i++) {
      offsets.push(offset)
      offset += heights[i].height + (i < heights.length - 1 ? gap : 0)
    }

    return { totalHeight: offset, offsets }
  }, [heights, gap])
}

/**
 * Given the full list of message heights and a scroll viewport,
 * returns only the messages that should be rendered.
 *
 * `gap` adds spacing between messages (like CSS gap).
 * `overscan` renders extra messages above/below the viewport for smooth scrolling.
 */
export function useVirtualMessages(options: {
  heights: MessageHeight[]
  scrollTop: number
  viewportHeight: number
  gap?: number
  overscan?: number
}): VirtualResult {
  const {
    heights,
    scrollTop,
    viewportHeight,
    gap = 0,
    overscan = 3,
  } = options

  const { offsets, totalHeight } = useVirtualMetrics({ heights, gap })

  return useMemo(() => {
    if (heights.length === 0) {
      return { virtualMessages: [], totalHeight: 0, offsets: [] }
    }

    // Find visible range via binary search
    const viewTop = scrollTop
    const viewBottom = scrollTop + viewportHeight

    let startIndex = binarySearchOffset(offsets, heights, viewTop)
    let endIndex = binarySearchOffset(offsets, heights, viewBottom)

    // Apply overscan
    startIndex = Math.max(0, startIndex - overscan)
    endIndex = Math.min(heights.length - 1, endIndex + overscan)

    const virtualMessages: VirtualMessage[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      virtualMessages.push({
        index: i,
        id: heights[i].id,
        offsetTop: offsets[i],
        height: heights[i].height,
      })
    }

    return { virtualMessages, totalHeight, offsets }
  }, [heights, offsets, overscan, scrollTop, totalHeight, viewportHeight])
}

/** Find the index of the message that contains the given scroll position. */
function binarySearchOffset(
  offsets: number[],
  heights: MessageHeight[],
  target: number
): number {
  let lo = 0
  let hi = offsets.length - 1

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    const top = offsets[mid]
    const bottom = top + heights[mid].height

    if (bottom < target) {
      lo = mid + 1
    } else if (top > target) {
      hi = mid - 1
    } else {
      return mid
    }
  }

  return Math.max(0, Math.min(lo, offsets.length - 1))
}

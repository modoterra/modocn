import { useLayoutEffect, useRef, useState } from "react"

import type { Message } from "@/registry/default/chat-box/lib/types"
import type { MessageHeight } from "@/registry/default/chat-messages/hooks/use-message-heights"

type CachedEntry = {
  content: string
  measureKey: string
  height: number
}

/**
 * Measures message content heights from a hidden DOM container.
 *
 * Unlike `useMessageHeights` (which uses pretext for plain-text
 * measurement), this hook reads actual rendered heights from the DOM.
 * This is necessary when message content is rendered as rich/markdown
 * content where pretext cannot predict the height.
 *
 * The caller must render a hidden container with one child per message
 * and pass its ref here. The hook reads `offsetHeight` from each child
 * inside `useLayoutEffect` so positions are correct before the first
 * paint.
 *
 * Heights are cached per message id + content so only changed messages
 * (typically the last streaming message) trigger a re-measure.
 */
export function useDOMHeights(options: {
  /** Ref to the hidden measurement container element. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Current message list. */
  messages: Message[]
  /** Extra cache key for render-affecting changes like width/theme. */
  measureKey?: string
}): MessageHeight[] {
  const { containerRef, messages, measureKey = "" } = options

  const cacheRef = useRef<Map<string, CachedEntry>>(new Map())
  const prevRef = useRef<MessageHeight[]>([])
  const [heights, setHeights] = useState<MessageHeight[]>([])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || messages.length === 0) {
      if (prevRef.current.length !== 0) {
        prevRef.current = []
        setHeights([])
      }
      return
    }

    const children = el.children
    const nextCache = new Map<string, CachedEntry>()
    const measured: MessageHeight[] = []
    let changed = false

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      const cached = cacheRef.current.get(msg.id)

      if (
        cached &&
        cached.content === msg.content &&
        cached.measureKey === measureKey
      ) {
        measured.push({ id: msg.id, height: cached.height, lineCount: 0 })
        nextCache.set(msg.id, cached)
      } else if (i < children.length) {
        const height = (children[i] as HTMLElement).offsetHeight
        measured.push({ id: msg.id, height, lineCount: 0 })
        nextCache.set(msg.id, { content: msg.content, measureKey, height })
        changed = true
      } else {
        measured.push({ id: msg.id, height: 0, lineCount: 0 })
        changed = true
      }
    }

    cacheRef.current = nextCache

    const prev = prevRef.current
    const needsUpdate =
      changed ||
      measured.length !== prev.length ||
      measured.some((m, i) => m.height !== prev[i]?.height)

    if (needsUpdate) {
      prevRef.current = measured
      setHeights(measured)
    }
  }, [containerRef, messages, measureKey])

  return heights
}

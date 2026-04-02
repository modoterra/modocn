import { useMemo, useRef } from "react"

import { layout, prepare } from "@chenglou/pretext"

import type { Message } from "@/registry/default/chat-box/lib/types"

export type MessageHeight = {
  id: string
  height: number
  lineCount: number
}

type CachedPrepare = {
  content: string
  prepareKey: string
  prepared: ReturnType<typeof prepare>
}

/**
 * Computes the height of every message using pretext.
 * Caches `prepare()` results per message ID so only changed messages
 * (typically the last streaming message) trigger re-preparation.
 */
export function useMessageHeights(options: {
  messages: Message[]
  font: string
  maxWidth: number
  lineHeight: number
  whiteSpace?: "normal" | "pre-wrap"
}): MessageHeight[] {
  const { messages, font, maxWidth, lineHeight, whiteSpace = "normal" } = options

  const cacheRef = useRef<Map<string, CachedPrepare>>(new Map())

  return useMemo(() => {
    const nextCache = new Map<string, CachedPrepare>()
    const opts = whiteSpace === "pre-wrap" ? { whiteSpace } : undefined
    const prepareKey = `${font}::${whiteSpace}`

    const heights = messages.map((msg) => {
      if (!msg.content) {
        return { id: msg.id, height: lineHeight, lineCount: 1 }
      }

      const cached = cacheRef.current.get(msg.id)
      let prepared: ReturnType<typeof prepare>

      if (cached && cached.content === msg.content && cached.prepareKey === prepareKey) {
        prepared = cached.prepared
      } else {
        prepared = prepare(msg.content, font, opts)
      }

      nextCache.set(msg.id, {
        content: msg.content,
        prepareKey,
        prepared,
      })

      const result = layout(prepared, maxWidth, lineHeight)
      return {
        id: msg.id,
        height: result.height,
        lineCount: result.lineCount,
      }
    })

    cacheRef.current = nextCache
    return heights
  }, [messages, font, maxWidth, lineHeight, whiteSpace])
}

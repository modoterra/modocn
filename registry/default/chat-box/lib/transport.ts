import type { ChatTransportOptions } from "@/registry/default/chat-box/lib/types"

/**
 * A transport defines how messages are sent to an AI backend
 * and how the streaming response is consumed.
 *
 * Implement this interface to support any AI provider.
 * The `send` method returns an `AsyncIterable<string>` that
 * yields text chunks as they arrive.
 *
 * @example
 * ```ts
 * const myTransport: ChatTransport = {
 *   async *send(messages, signal) {
 *     const res = await fetch("/api/chat", {
 *       method: "POST",
 *       body: JSON.stringify({ messages }),
 *       signal,
 *     })
 *     const reader = res.body!.getReader()
 *     const decoder = new TextDecoder()
 *     while (true) {
 *       const { done, value } = await reader.read()
 *       if (done) break
 *       yield decoder.decode(value, { stream: true })
 *     }
 *   },
 * }
 * ```
 */
export type ChatTransport = {
  send(
    messages: { role: string; content: string }[],
    signal: AbortSignal
  ): AsyncIterable<string>
}

/**
 * Creates a transport that sends messages as JSON and reads
 * the response as a plain text stream.
 *
 * This is the default transport used by `useChat` when you
 * pass an `api` URL instead of a custom transport.
 */
export function textTransport(options: ChatTransportOptions): ChatTransport {
  const {
    api,
    headers,
    body,
    fetch: fetchFn = globalThis.fetch,
  } = options

  return {
    async *send(messages, signal) {
      const response = await fetchFn(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...((headers as Record<string, string>) ?? {}),
        },
        body: JSON.stringify({ messages, ...body }),
        signal,
      })

      if (!response.ok) {
        throw new Error(
          `Chat request failed: ${response.status} ${response.statusText}`
        )
      }

      if (!response.body) {
        throw new Error("Response body is empty")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        yield decoder.decode(value, { stream: true })
      }
    },
  }
}

import type { ChatTransport } from "@/registry/default/chat-box/lib/transport"

/**
 * Creates a transport for OpenAI-compatible chat completion APIs.
 *
 * Handles the SSE streaming format used by OpenAI, Azure OpenAI,
 * and any compatible API (Groq, Together, Anyscale, etc.).
 *
 * @example
 * ```tsx
 * import { openaiTransport } from "@/registry/default/transport-openai/lib/transport-openai"
 *
 * const chat = useChat({
 *   transport: openaiTransport({
 *     apiKey: process.env.OPENAI_API_KEY!,
 *     model: "gpt-4o",
 *   }),
 * })
 * ```
 */
export function openaiTransport(options: {
  /** OpenAI API key. */
  apiKey: string
  /** Model ID. Defaults to `"gpt-4o"`. */
  model?: string
  /** Base URL for the API. Defaults to `"https://api.openai.com/v1"`. */
  baseUrl?: string
  /** Custom fetch implementation. */
  fetch?: typeof globalThis.fetch
}): ChatTransport {
  const {
    apiKey,
    model = "gpt-4o",
    baseUrl = "https://api.openai.com/v1",
    fetch: fetchFn = globalThis.fetch,
  } = options

  return {
    async *send(messages, signal) {
      const response = await fetchFn(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
        signal,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`OpenAI request failed: ${response.status} ${text}`)
      }

      if (!response.body) {
        throw new Error("Response body is empty")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === "data: [DONE]") continue
          if (!trimmed.startsWith("data: ")) continue

          try {
            const json = JSON.parse(trimmed.slice(6))
            const content = json.choices?.[0]?.delta?.content
            if (content) yield content
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    },
  }
}

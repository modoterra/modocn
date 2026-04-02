const MOCK_RESPONSES = [
  "That's an interesting question! Let me think about it for a moment.\n\nThe key insight here is that text measurement in the browser typically requires triggering layout reflow — one of the most expensive operations. Pretext sidesteps this entirely by implementing its own measurement logic using canvas as ground truth.\n\nThis means we can know the exact height of any text block *before* it hits the DOM.",
  "Here's a quick example of how you might use pretext for auto-sizing a textarea:\n\n```tsx\nconst { height } = useAutosize({\n  text: input,\n  font: '16px Inter',\n  maxWidth: 600,\n  lineHeight: 24,\n})\n```\n\nThe height updates on every keystroke without any DOM measurement. Pure arithmetic over cached widths.",
  "Great question! The streaming works by reading a ReadableStream from the API response. Each chunk of text is accumulated and the assistant message updates in real-time.\n\nThe combination of streaming + pretext measurement means you can have smooth auto-scrolling and proper layout even while tokens are still arriving. No layout thrashing.",
  "I support all the languages you can imagine — including emojis 🚀, mixed bidirectional text like \"AGI 春天到了. بدأت الرحلة\", and complex scripts. Pretext handles the segmentation and line breaking correctly across all of them.",
  "Let me break that down:\n\n1. **prepare()** — One-time text analysis pass. Segments the text, applies line-break rules, measures segments via canvas. ~19ms for 500 texts.\n\n2. **layout()** — The hot path. Pure arithmetic over the cached widths. ~0.09ms for that same batch.\n\nYou run prepare() once per text change, then layout() on every resize. That's the trick.",
]

/**
 * Creates a mock fetch function that simulates streaming AI responses.
 *
 * Returns a Response with a ReadableStream body that emits text
 * token-by-token with a configurable delay between tokens.
 */
export function createMockStreamFetch(options?: {
  /** Delay between tokens in ms. Default: 25 */
  tokenDelay?: number
}): typeof globalThis.fetch {
  const { tokenDelay = 25 } = options ?? {}
  let responseIndex = 0

  return async (_input: RequestInfo | URL, _init?: RequestInit) => {
    const text = MOCK_RESPONSES[responseIndex % MOCK_RESPONSES.length]
    responseIndex++

    // Split into token-sized chunks (roughly word-level)
    const tokens = text.match(/\S+\s*|\s+/g) ?? [text]

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for (const token of tokens) {
          controller.enqueue(encoder.encode(token))
          await new Promise((r) => setTimeout(r, tokenDelay))
        }
        controller.close()
      },
    })

    return new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}

/**
 * Creates a mock fetch that simulates OpenAI's SSE chat completions format.
 *
 * Each chunk is a `data: {...}\n\n` line containing a delta with content,
 * ending with `data: [DONE]\n\n`. This exercises the `openaiTransport`
 * SSE parser without needing a real API key.
 */
export function createMockSSEFetch(options?: {
  /** Delay between tokens in ms. Default: 25 */
  tokenDelay?: number
  /** Model name in the response. Default: "mock-gpt-4o" */
  model?: string
}): typeof globalThis.fetch {
  const { tokenDelay = 25, model = "mock-gpt-4o" } = options ?? {}
  let responseIndex = 0

  return async (_input: RequestInfo | URL, _init?: RequestInit) => {
    const text = MOCK_RESPONSES[responseIndex % MOCK_RESPONSES.length]
    responseIndex++

    const tokens = text.match(/\S+\s*|\s+/g) ?? [text]
    const chatId = `chatcmpl-mock-${Date.now()}`

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for (const token of tokens) {
          const chunk = {
            id: chatId,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [
              {
                index: 0,
                delta: { content: token },
                finish_reason: null,
              },
            ],
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
          )
          await new Promise((r) => setTimeout(r, tokenDelay))
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })

    return new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    })
  }
}

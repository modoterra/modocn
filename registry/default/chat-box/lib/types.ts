import type { ChatTransport } from "@/registry/default/chat-box/lib/transport"

export type MessageRole = "user" | "assistant" | "system"

export type Message = {
  id: string
  role: MessageRole
  content: string
  createdAt: Date
}

export type ChatTransportOptions = {
  /** The API endpoint to send chat messages to. */
  api: string

  /** Custom headers to send with the request. */
  headers?: HeadersInit

  /** Custom body fields to merge into the request. */
  body?: Record<string, unknown>

  /** Custom fetch implementation. Defaults to `globalThis.fetch`. */
  fetch?: typeof globalThis.fetch
}

export type ChatOptions = {
  /**
   * A custom transport for sending and receiving messages.
   * Takes priority over `api` if both are provided.
   */
  transport?: ChatTransport

  /**
   * The API endpoint to send chat messages to.
   * Should return a streaming text response.
   * Used to create a default `textTransport` when no
   * custom `transport` is provided.
   */
  api?: string

  /**
   * Initial messages to populate the chat.
   */
  initialMessages?: Message[]

  /**
   * Custom headers to send with the request.
   * Only used with the default text transport (i.e. when `api` is set).
   */
  headers?: HeadersInit

  /**
   * Custom body fields to merge into the request.
   * Only used with the default text transport (i.e. when `api` is set).
   */
  body?: Record<string, unknown>

  /**
   * Called when a new assistant message starts streaming.
   */
  onStart?: () => void

  /**
   * Called when the assistant message finishes streaming.
   */
  onFinish?: (message: Message) => void

  /**
   * Called when an error occurs.
   */
  onError?: (error: Error) => void

  /**
   * Custom fetch implementation. Defaults to `globalThis.fetch`.
   * Only used with the default text transport (i.e. when `api` is set).
   */
  fetch?: typeof globalThis.fetch

  /**
   * Generate a unique ID for each message.
   * Defaults to `crypto.randomUUID()`.
   */
  generateId?: () => string
}

export type ChatState = {
  /** All messages in the conversation. */
  messages: Message[]

  /** The current input text. */
  input: string

  /** Whether the assistant is currently generating a response. */
  isLoading: boolean

  /** The most recent error, if any. */
  error: Error | null
}

export type ChatActions = {
  /** Set the input text. */
  setInput: (input: string) => void

  /** Submit the current input as a user message and get a response. */
  submit: () => void

  /** Append a message to the conversation without triggering a response. */
  append: (message: Message) => void

  /** Stop the current streaming response. */
  stop: () => void

  /** Clear all messages. */
  clear: () => void

  /** Regenerate the last assistant response. */
  reload: () => void

  /** Set messages directly. */
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
}

export type ChatHandler = ChatState & ChatActions

export type PretextMeasureOptions = {
  /** The text to measure. */
  text: string

  /**
   * CSS font shorthand, e.g. `"16px Inter"`.
   * Must match the font used in your CSS.
   */
  font: string

  /** Maximum width for line wrapping, in pixels. */
  maxWidth: number

  /** Line height in pixels. Must match your CSS `line-height`. */
  lineHeight: number

  /** White space handling mode. Defaults to `"normal"`. */
  whiteSpace?: "normal" | "pre-wrap"
}

export type PretextMeasureResult = {
  /** Total height of the text block in pixels. */
  height: number

  /** Number of lines. */
  lineCount: number
}

export type AutosizeOptions = PretextMeasureOptions & {
  /** Minimum height in pixels. */
  minHeight?: number

  /** Maximum height in pixels. */
  maxHeight?: number
}

export type AutosizeResult = {
  /** The computed height, clamped between minHeight and maxHeight. */
  height: number

  /** Number of lines in the text. */
  lineCount: number
}

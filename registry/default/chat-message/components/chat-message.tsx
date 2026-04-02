import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"

import { useBalancedText } from "@/registry/default/chat-message/hooks/use-balanced-text"
import type { Message } from "@/registry/default/chat-box/lib/types"

export type ChatMessageContext = {
  message: Message
  /** Balanced width in px — the tightest container that preserves the line count. */
  width: number
  /** Total height in px based on line count * lineHeight. */
  height: number
  /** Number of text lines. */
  lineCount: number
  /** Whether the message text has been copied. Resets after `copyResetMs`. */
  copied: boolean
  /** Copy the message content to clipboard. */
  copy: () => void
}

const Context = createContext<ChatMessageContext | null>(null)

export function useChatMessage(): ChatMessageContext {
  const ctx = useContext(Context)
  if (!ctx) {
    throw new Error("useChatMessage must be used within a <ChatMessage>")
  }
  return ctx
}

export type ChatMessageProps = {
  message: Message
  /**
   * Font shorthand for balanced-text measurement.
   * When omitted (along with `maxWidth` and `lineHeight`), balanced-text
   * metrics default to zero — useful when rendering rich/markdown content
   * where balanced text does not apply.
   */
  font?: string
  /** Max width for balanced-text measurement. */
  maxWidth?: number
  /** Line height for balanced-text measurement. */
  lineHeight?: number
  /** Time in ms before `copied` resets to false. Default 2000. */
  copyResetMs?: number
  children: ReactNode | ((ctx: ChatMessageContext) => ReactNode)
}

export function ChatMessage({
  message,
  font,
  maxWidth,
  lineHeight,
  copyResetMs = 2000,
  children,
}: ChatMessageProps) {
  const hasTextMetrics = !!(font && maxWidth && lineHeight)

  const balanced = useBalancedText({
    text: hasTextMetrics ? message.content : "",
    font: font ?? "16px sans-serif",
    maxWidth: maxWidth ?? 400,
    lineHeight: lineHeight ?? 22,
  })

  const width = hasTextMetrics ? balanced.width : 0
  const height = hasTextMetrics ? balanced.height : 0
  const lineCount = hasTextMetrics ? balanced.lineCount : 0

  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), copyResetMs)
    })
  }, [message.content, copyResetMs])

  const ctx: ChatMessageContext = {
    message,
    width,
    height,
    lineCount,
    copied,
    copy,
  }

  return (
    <Context.Provider value={ctx}>
      {typeof children === "function" ? children(ctx) : children}
    </Context.Provider>
  )
}

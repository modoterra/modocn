import {
  useCallback,
  useState,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react"

import { ChatBox, useChatBox } from "@/registry/default/chat-box/components/chat-box"
import { ChatInput } from "@/registry/default/chat-input/components/chat-input"
import { ChatMessage } from "@/registry/default/chat-message/components/chat-message"
import { useMessageHeights } from "@/registry/default/chat-messages/hooks/use-message-heights"
import { useVirtualMessages } from "@/registry/default/chat-messages/hooks/use-virtual-messages"
import { useChatScroll } from "@/registry/default/chat-messages/hooks/use-chat-scroll"
import type { ChatOptions, Message } from "@/registry/default/chat-box/lib/types"

const FONT = '15px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
const LINE_HEIGHT = 22
const MAX_BUBBLE_WIDTH = 520
const GAP = 8
// User bubble:      padding (8+8) = 16
// Assistant bubble: padding (8+8) + roleLabel (~14) + actions (~24) + border (2) = 56
const USER_PADDING = 16
const ASSISTANT_PADDING = 56

export type ChatFullProps = ChatOptions & {
  /** Optional header element. */
  header?: ReactNode
  /** Placeholder when no messages. */
  placeholder?: string
}

export function ChatFull({
  header,
  placeholder = "Send a message to start the conversation.",
  ...chatOptions
}: ChatFullProps) {
  return (
    <ChatBox {...chatOptions}>
      <div style={fullStyles.shell}>
        {header && <div style={fullStyles.header}>{header}</div>}
        <MessageArea placeholder={placeholder} />
        <InputBar />
      </div>
    </ChatBox>
  )
}

function MessageArea({ placeholder }: { placeholder: string }) {
  const { messages } = useChatBox()
  const [viewportHeight, setViewportHeight] = useState(0)

  const rawHeights = useMessageHeights({
    messages,
    font: FONT,
    maxWidth: MAX_BUBBLE_WIDTH,
    lineHeight: LINE_HEIGHT,
  })

  const heights = rawHeights.map((h, i) => ({
    ...h,
    height:
      h.height +
      (messages[i].role === "user" ? USER_PADDING : ASSISTANT_PADDING),
  }))

  const totalContentHeight = heights.reduce(
    (sum, h, i) => sum + h.height + (i > 0 ? GAP : 0),
    0
  )

  const scroll = useChatScroll({ totalHeight: totalContentHeight })

  const { virtualMessages, totalHeight } = useVirtualMessages({
    heights,
    scrollTop: scroll.scrollTop,
    viewportHeight,
    gap: GAP,
    overscan: 5,
  })

  const containerRefCallback = useCallback(
    (el: HTMLDivElement | null) => {
      scroll.containerRef.current = el
      if (el) {
        setViewportHeight(el.clientHeight)
      }
    },
    [scroll.containerRef]
  )

  useEffect(() => {
    const el = scroll.containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [scroll.containerRef])

  return (
    <div
      ref={containerRefCallback}
      onScroll={scroll.onScroll}
      style={fullStyles.messageArea}
    >
      {messages.length === 0 ? (
        <div style={fullStyles.placeholder}>{placeholder}</div>
      ) : (
        <div style={{ height: totalHeight, position: "relative" }}>
          {virtualMessages.map((vm) => {
            const msg = messages[vm.index]
            return (
              <div
                key={vm.id}
                style={{
                  position: "absolute",
                  top: vm.offsetTop,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  padding: "0 16px",
                }}
              >
                <MessageBubble message={msg} />
              </div>
            )
          })}
        </div>
      )}

      {!scroll.isAtBottom && messages.length > 0 && (
        <button
          onClick={() => scroll.scrollToBottom()}
          style={fullStyles.scrollBtn}
        >
          &darr;
        </button>
      )}
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div style={{ ...fullStyles.bubble, ...fullStyles.userBubble }}>
        <div style={fullStyles.text}>{message.content}</div>
      </div>
    )
  }

  return (
    <ChatMessage
      message={message}
      font={FONT}
      maxWidth={MAX_BUBBLE_WIDTH}
      lineHeight={LINE_HEIGHT}
    >
      {({ width, copied, copy }) => (
        <div
          style={{
            ...fullStyles.bubble,
            ...fullStyles.assistantBubble,
            width: width > 0 ? width + 28 : undefined,
            maxWidth: MAX_BUBBLE_WIDTH + 28,
          }}
        >
          <div style={fullStyles.roleLabel}>Assistant</div>
          <div style={fullStyles.text}>{message.content}</div>
          <div style={fullStyles.actions}>
            <button
              onClick={copy}
              style={{
                ...fullStyles.actionBtn,
                color: copied ? "#6c9" : "#555",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </ChatMessage>
  )
}

function InputBar() {
  const { input } = useChatBox()

  return (
    <ChatInput
      font={FONT}
      maxWidth={640}
      lineHeight={LINE_HEIGHT}
      minHeight={44}
      maxHeight={150}
    >
      {({ setInput, submit, stop, isLoading, height, onKeyDown }) => (
        <div style={fullStyles.inputBar}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message..."
            disabled={isLoading}
            style={{
              ...fullStyles.textarea,
              height,
              overflowY: height >= 150 ? "auto" : "hidden",
            }}
          />
          <button
            onClick={isLoading ? stop : submit}
            disabled={!isLoading && !input.trim()}
            style={{
              ...fullStyles.sendBtn,
              opacity: isLoading || input.trim() ? 1 : 0.3,
              background: isLoading ? "#c44" : "#2a6",
            }}
          >
            {isLoading ? "Stop" : "Send"}
          </button>
        </div>
      )}
    </ChatInput>
  )
}

const fullStyles: Record<string, CSSProperties> = {
  shell: {
    border: "1px solid #262626",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: 560,
    background: "#0d0d0d",
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid #1a1a1a",
    fontSize: 13,
    fontWeight: 600,
    color: "#888",
    letterSpacing: "0.02em",
  },
  messageArea: {
    flex: 1,
    overflowY: "auto",
    position: "relative",
  },
  placeholder: {
    color: "#444",
    textAlign: "center",
    padding: "80px 32px",
    fontSize: 14,
    lineHeight: "1.6",
  },
  bubble: {
    padding: "8px 14px",
    borderRadius: 10,
    maxWidth: "85%",
    fontSize: 15,
    lineHeight: "22px",
  },
  userBubble: {
    background: "#1a3a5c",
    color: "#dde8f4",
  },
  assistantBubble: {
    background: "#151515",
    border: "1px solid #222",
    color: "#d4d4d4",
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "#555",
    marginBottom: 2,
  },
  text: {
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
  actions: {
    marginTop: 4,
    display: "flex",
    gap: 8,
  },
  actionBtn: {
    background: "none",
    border: "none",
    fontSize: 10,
    cursor: "pointer",
    padding: 0,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    fontWeight: 600,
  },
  scrollBtn: {
    position: "absolute" as const,
    bottom: 8,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#222",
    border: "1px solid #333",
    borderRadius: 20,
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa",
    fontSize: 16,
    cursor: "pointer",
    zIndex: 10,
  },
  inputBar: {
    borderTop: "1px solid #1a1a1a",
    padding: "10px 12px",
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    background: "#0a0a0a",
    border: "1px solid #262626",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#ededed",
    fontSize: 15,
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: "22px",
    resize: "none" as const,
    outline: "none",
  },
  sendBtn: {
    border: "none",
    borderRadius: 10,
    padding: "10px 18px",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    transition: "background 0.15s",
  },
}

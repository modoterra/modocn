import {
  ChatBox,
  useChatBox,
} from "@/registry/default/chat-box/components/chat-box"
import { ChatInput } from "@/registry/default/chat-input/components/chat-input"
import { ChatMessage } from "@/registry/default/chat-message/components/chat-message"
import { MarkdownContent } from "@/registry/default/chat-message/components/markdown-content"
import { ChatMessages } from "@/registry/default/chat-messages/components/chat-messages"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createMockStreamFetch } from "../lib/mock-stream"

import type { CSSProperties } from "react"
import type { Message } from "@/registry/default/chat-box/lib/types"

const mockFetch = createMockStreamFetch({ tokenDelay: 20 })

const MAX_MESSAGE_WIDTH = 520
const ASSISTANT_BUBBLE_WIDTH = MAX_MESSAGE_WIDTH + 34
const BUBBLE_H_CHROME = 34
const CONVERSATION_H_PAD = 32
const MESSAGE_GAP = 16
const USER_CHROME_HEIGHT = 46
const ASSISTANT_CHROME_HEIGHT = 82

const COMPOSER_FONT =
  '15px "JetBrains Mono", "Fira Code", "SF Mono", monospace'
const COMPOSER_LINE_HEIGHT = 22

const styles: Record<string, CSSProperties> = {
  shell: {
    border: "1px solid var(--border)",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "0.5rem",
    padding: "1rem",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.75rem",
  },
  headerTitle: {
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  headerMeta: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem 1.5rem",
    color: "var(--muted-foreground)",
  },
  conversation: {
    position: "relative" as const,
    height: 420,
    overflowY: "auto" as const,
    padding: "1rem",
  },
  empty: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center" as const,
  },
  emptyTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
  },
  emptyDesc: {
    marginTop: "0.5rem",
    fontSize: "0.8125rem",
    color: "var(--muted-foreground)",
    maxWidth: "20rem",
    lineHeight: 1.6,
  },
  userBubble: {
    maxWidth: `min(${ASSISTANT_BUBBLE_WIDTH}px, 100%)`,
    padding: "0.75rem 1rem",
    border: "1px solid var(--border)",
    background: "var(--card)",
  },
  assistantBubble: {
    maxWidth: `min(${ASSISTANT_BUBBLE_WIDTH}px, 100%)`,
    padding: "0.75rem 1rem",
    border: "1px solid var(--border)",
  },
  bubbleRole: {
    fontSize: "0.625rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "var(--muted-foreground)",
    marginBottom: "0.375rem",
  },
  bubbleText: {
    fontSize: "0.875rem",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
  copyBtn: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "0.5rem",
  },
  copyButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.625rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "var(--muted-foreground)",
    padding: "0.25rem 0",
  },
  scrollBtn: {
    position: "absolute" as const,
    bottom: 12,
    left: "50%",
    transform: "translateX(-50%)",
    background: "var(--background)",
    border: "1px solid var(--border)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.6875rem",
    color: "var(--foreground)",
    padding: "0.25rem 0.75rem",
  },
  composer: {
    display: "flex",
    gap: "0.5rem",
    padding: "1rem",
    borderTop: "1px solid var(--border)",
  },
  textarea: {
    flex: 1,
    resize: "none" as const,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--foreground)",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    lineHeight: "22px",
    padding: "0.625rem 0.75rem",
    outline: "none",
  },
  sendBtn: {
    alignSelf: "flex-end" as const,
    background: "var(--foreground)",
    color: "var(--background)",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    padding: "0.625rem 1rem",
    height: 42,
  },
  hint: {
    padding: "0 1rem 0.75rem",
    fontSize: "0.625rem",
    color: "var(--muted-foreground)",
    letterSpacing: "0.02em",
  },
}

export function ChatCompositionDemo() {
  return (
    <ChatBox api="/api/chat" fetch={mockFetch}>
      <div className="demo-shell" style={styles.shell}>
        <ShellHeader />
        <Conversation />
        <Composer />
        <div style={styles.hint}>
          Press Enter to send, Shift + Enter for a new line
        </div>
      </div>
    </ChatBox>
  )
}

function ShellHeader() {
  const { messages, isLoading } = useChatBox()
  const assistantCount = messages.filter(
    (m) => m.role === "assistant",
  ).length

  return (
    <div className="demo-header" style={styles.header}>
      <span style={styles.headerTitle}>Chat Composition</span>
      <div className="demo-header-meta" style={styles.headerMeta}>
        <span>messages: {messages.length}</span>
        <span>assistant: {assistantCount}</span>
        <span>status: {isLoading ? "streaming" : "idle"}</span>
      </div>
    </div>
  )
}

function Conversation() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const update = () => setContainerWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const effectiveMaxWidth = containerWidth > 0
    ? Math.min(
        containerWidth - CONVERSATION_H_PAD - BUBBLE_H_CHROME,
        MAX_MESSAGE_WIDTH,
      )
    : MAX_MESSAGE_WIDTH

  const renderContent = useCallback((message: Message) => {
    if (message.role === "user") {
      return <div style={styles.bubbleText}>{message.content}</div>
    }
    return (
      <MarkdownContent
        content={message.content}
        className="text-[14px] leading-[1.65]"
      />
    )
  }, [])

  const paddingPerMessage = useCallback(
    (message: Message) =>
      message.role === "assistant"
        ? ASSISTANT_CHROME_HEIGHT
        : USER_CHROME_HEIGHT,
    [],
  )

  const measureKey = useMemo(() => "chat-composition", [])

  return (
    <div ref={wrapperRef}>
      <ChatMessages
        maxWidth={effectiveMaxWidth}
        gap={MESSAGE_GAP}
        overscan={5}
        paddingPerMessage={paddingPerMessage}
        renderContent={renderContent}
        measureKey={measureKey}
      >
        {({ messages, virtualMessages, totalHeight, scroll }) => (
          <div style={{ position: "relative" }}>
            <div
              ref={scroll.containerRef}
              onScroll={scroll.onScroll}
              style={styles.conversation}
            >
              {messages.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyTitle}>Start a conversation</div>
                  <p style={styles.emptyDesc}>
                    Type a message below to see streaming responses,
                    virtualized layout, and auto-scrolling.
                  </p>
                </div>
              ) : (
                <div style={{ height: totalHeight, position: "relative" }}>
                  {virtualMessages.map((vm) => {
                    const message = messages[vm.index]
                    const isUser = message.role === "user"

                    return (
                      <div
                        key={vm.id}
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: vm.offsetTop,
                          display: "flex",
                          justifyContent: isUser ? "flex-end" : "flex-start",
                        }}
                      >
                        {isUser ? (
                          <UserBubble content={message.content} />
                        ) : (
                          <AssistantBubble message={message} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {!scroll.isAtBottom && messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => scroll.scrollToBottom()}
                  style={styles.scrollBtn}
                >
                  Jump to latest
                </button>
              )}
            </div>
          </div>
        )}
      </ChatMessages>
    </div>
  )
}

function UserBubble({ content }: { content: string }) {
  return (
    <div style={styles.userBubble}>
      <div style={styles.bubbleRole}>You</div>
      <div style={styles.bubbleText}>{content}</div>
    </div>
  )
}

function AssistantBubble({ message }: { message: Message }) {
  return (
    <ChatMessage message={message}>
      {({ copied, copy }) => (
        <div style={styles.assistantBubble}>
          <div style={styles.bubbleRole}>Assistant</div>
          <MarkdownContent
            content={message.content}
            className="text-[14px] leading-[1.65]"
          />
          <div style={styles.copyBtn}>
            <button type="button" onClick={copy} style={styles.copyButton}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </ChatMessage>
  )
}

function Composer() {
  return (
    <ChatInput
      font={COMPOSER_FONT}
      maxWidth={640}
      lineHeight={COMPOSER_LINE_HEIGHT}
      minHeight={42}
      maxHeight={150}
    >
      {({ input, setInput, submit, stop, isLoading, height, onKeyDown }) => (
        <div style={styles.composer}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about pretext, streaming, virtualization..."
            disabled={isLoading}
            style={{
              ...styles.textarea,
              height,
              overflowY: height >= 150 ? "auto" : "hidden",
            }}
          />
          {isLoading ? (
            <button type="button" onClick={stop} style={styles.sendBtn}>
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!input.trim()}
              style={{
                ...styles.sendBtn,
                opacity: input.trim() ? 1 : 0.4,
              }}
            >
              Send
            </button>
          )}
        </div>
      )}
    </ChatInput>
  )
}

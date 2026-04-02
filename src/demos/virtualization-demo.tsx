import {
  ChatBox,
  useChatBox,
} from "@/registry/default/chat-box/components/chat-box"
import { ChatMessage } from "@/registry/default/chat-message/components/chat-message"
import { MarkdownContent } from "@/registry/default/chat-message/components/markdown-content"
import { ChatMessages } from "@/registry/default/chat-messages/components/chat-messages"
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createMockStreamFetch } from "../lib/mock-stream"

import type { CSSProperties } from "react"
import type { Message, MessageRole } from "@/registry/default/chat-box/lib/types"

const mockFetch = createMockStreamFetch({ tokenDelay: 20 })

const MAX_MESSAGE_WIDTH = 520
const ASSISTANT_BUBBLE_WIDTH = MAX_MESSAGE_WIDTH + 34
const BUBBLE_H_CHROME = 34
const CONVERSATION_H_PAD = 32
const MESSAGE_GAP = 16
const USER_CHROME_HEIGHT = 46
const ASSISTANT_CHROME_HEIGHT = 82

const QUESTIONS = [
  "How does pretext measure text without the DOM?",
  "What is the purpose of the prepare() step?",
  "How fast is layout() compared to DOM measurement?",
  "Can pretext handle emoji and bidirectional text?",
  "How does virtualization reduce DOM cost?",
  "What does balanced text wrapping achieve?",
  "How does streaming interact with height calculation?",
  "What role does canvas play in measurement?",
  "How is line breaking handled across scripts?",
  "Why is layout reflow expensive?",
]

const ANSWERS = [
  "Pretext keeps layout work off the DOM:\n\n- **Segment** text with `Intl.Segmenter`\n- **Measure** widths with `CanvasRenderingContext2D.measureText()`\n- **Layout** using cached segment widths\n\nThat split is why the same message can be laid out again and again without a reflow.",
  "The `prepare()` step is the one-time analysis pass. A simplified flow looks like this:\n\n```tsx\nconst prepared = prepare(text, { font })\nconst box = layout(prepared, {\n  maxWidth: 520,\n  lineHeight: 22,\n})\n```\n\n`prepare()` does the expensive measuring once, then `layout()` just reuses the cached widths.",
  "A rough comparison looks like this:\n\n| Operation | Typical cost | Why |\n| --- | --- | --- |\n| `prepare()` | ~19ms / 500 texts | segmentation + measurement |\n| `layout()` | ~0.09ms / 500 texts | cached arithmetic only |\n| DOM measurement | 15-50ms | synchronous reflow |\n\nThe important part is that only the hot path stays in the critical rendering loop.",
  "Yes. Pretext uses `Intl.Segmenter`, so it can handle mixed scripts like **emoji** \u{1F680}, **CJK** `\u{6625}\u{5929}\u{5230}\u{4E86}`, and **Arabic** `\u{628}\u{62F}\u{623}\u{62A} \u{627}\u{644}\u{631}\u{62D}\u{644}\u{629}`.\n\n> The measurement stays font-accurate because canvas still uses the browser's glyph metrics.",
  "Virtualization reduces DOM cost by keeping the render set tiny:\n\n1. Compute every message height\n2. Derive absolute offsets\n3. Render only the visible window plus overscan\n4. Swap nodes as you scroll\n\nThat means a 500-message transcript can still behave like a much smaller tree.",
  "Balanced text wrapping finds the narrowest container width that preserves the line count. In practice that gives you:\n\n- tighter bubbles\n- less dead horizontal space\n- a cleaner left/right rhythm in chat UIs",
  "During streaming, message content grows token by token. The update loop is basically:\n\n- append chunk\n- recompute the last message height\n- update offsets\n- auto-scroll if the user is pinned to bottom\n\nBecause `layout()` is cheap, you can do that on every token without visible jank.",
  "Canvas provides the low-level width primitive:\n\n```ts\nconst metrics = ctx.measureText(segment)\nconst width = metrics.width\n```\n\nFrom there, pretext can build a reusable width cache instead of asking the DOM to lay out live elements.",
  "Line breaking follows the Unicode Line Breaking Algorithm. Pretext looks for valid break opportunities such as spaces, hyphens, and script-specific boundaries, then wraps against `maxWidth` using cached widths.\n\nThat makes the output much more reliable than naive `split(\" \")` wrapping.",
  "Layout reflow is expensive because the browser has to synchronize style and geometry work. A good mental model is:\n\n- **style recalculation**\n- **layout**\n- **paint**\n- **compositing**\n\nIf you can answer the sizing question before touching the DOM, you skip a lot of that pipeline.",
]

function generateMessages(pairCount: number): Message[] {
  const messages: Message[] = []
  for (let i = 0; i < pairCount; i++) {
    const qIdx = i % QUESTIONS.length
    messages.push(
      {
        id: `seed-u-${i}`,
        role: "user",
        content: `#${i + 1}: ${QUESTIONS[qIdx]}`,
        createdAt: new Date(Date.now() - (pairCount - i) * 120000),
      },
      {
        id: `seed-a-${i}`,
        role: "assistant",
        content: `#${i + 1}: ${ANSWERS[qIdx]}`,
        createdAt: new Date(Date.now() - (pairCount - i) * 120000 + 60000),
      },
    )
  }
  return messages
}

const INITIAL_MESSAGES = generateMessages(250)

type LogEntry = {
  time: string
  rendered: number
  total: number
  windowStart: number
  windowEnd: number
  scrollTop: number
  totalHeight: number
}

const styles: Record<string, CSSProperties> = {
  shell: {
    border: "1px solid var(--border)",
  },
  header: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    padding: "1rem",
    borderBottom: "1px solid var(--border)",
  },
  headerTop: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
  headerTitle: {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  headerDesc: {
    fontSize: "0.8125rem",
    color: "var(--muted-foreground)",
    lineHeight: 1.6,
  },
  stats: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.25rem 1.5rem",
    fontSize: "0.75rem",
    color: "var(--muted-foreground)",
  },
  statHighlight: {
    color: "var(--foreground)",
    fontWeight: 500,
  },
  conversation: {
    position: "relative" as const,
    height: 420,
    overflowY: "auto" as const,
    padding: "1rem",
  },
  userBubble: {
    maxWidth: `min(${ASSISTANT_BUBBLE_WIDTH}px, 100%)`,
    padding: "0.625rem 0.875rem",
    border: "1px solid var(--border)",
    background: "var(--card)",
  },
  assistantBubble: {
    maxWidth: `min(${ASSISTANT_BUBBLE_WIDTH}px, 100%)`,
    padding: "0.625rem 0.875rem",
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
    marginTop: "0.375rem",
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
  logSection: {
    borderTop: "1px solid var(--border)",
  },
  logBody: {
    padding: "0.75rem 1rem",
    fontSize: "0.6875rem",
    lineHeight: 1.7,
    color: "var(--muted-foreground)",
    background: "var(--card)",
  },
  logHighlight: {
    color: "var(--foreground)",
    fontWeight: 500,
  },
  placeholderBubble: {
    maxWidth: `min(${ASSISTANT_BUBBLE_WIDTH}px, 100%)`,
    padding: "0.625rem 0.875rem",
    border: "1px solid var(--border)",
    overflow: "hidden",
    opacity: 0.5,
  },
  placeholderUser: {
    background: "var(--card)",
  },
  placeholderAssistant: {
    background: "transparent",
  },
  placeholderText: {
    fontSize: "0.875rem",
    lineHeight: 1.65,
    color: "var(--muted-foreground)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
}

export function VirtualizationDemo() {
  const [latestLog, setLatestLog] = useState<LogEntry | null>(null)

  const updateLog = useCallback((entry: LogEntry) => {
    setLatestLog(entry)
  }, [])

  return (
    <ChatBox
      api="/api/chat"
      fetch={mockFetch}
      initialMessages={INITIAL_MESSAGES}
    >
      <div className="demo-shell" style={styles.shell}>
        <VirtHeader latestLog={latestLog} />
        <MemoVirtConversation onVirtualChange={updateLog} />
        <VirtLog entry={latestLog} />
      </div>
    </ChatBox>
  )
}

function VirtHeader({ latestLog }: { latestLog: LogEntry | null }) {
  const { messages } = useChatBox()

  return (
    <div style={styles.header}>
      <div className="demo-header" style={styles.headerTop}>
        <span style={styles.headerTitle}>Virtualization</span>
        <div className="demo-header-meta" style={styles.stats}>
          <span>
            total: <strong style={styles.statHighlight}>{messages.length}</strong>
          </span>
          <span>
            rendered:{" "}
            <strong style={styles.statHighlight}>
              {latestLog ? latestLog.rendered : "-"}
            </strong>
          </span>
          <span>
            window: {latestLog ? `[${latestLog.windowStart}-${latestLog.windowEnd}]` : "-"}
          </span>
          <span>
            height: {latestLog ? `${latestLog.totalHeight.toLocaleString()}px` : "-"}
          </span>
        </div>
      </div>
      <p style={styles.headerDesc}>
        {messages.length} messages pre-loaded with markdown tables, code
        blocks, and lists. Scroll to see only a handful rendered at once.
      </p>
    </div>
  )
}

function VirtConversation({
  onVirtualChange,
}: {
  onVirtualChange: (entry: LogEntry) => void
}) {
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

  const measureKey = useMemo(() => "virtualization-markdown", [])

  return (
    <div ref={wrapperRef}>
      <ChatMessages
        maxWidth={effectiveMaxWidth}
        gap={MESSAGE_GAP}
        overscan={10}
        paddingPerMessage={paddingPerMessage}
        renderContent={renderContent}
        measureKey={measureKey}
      >
        {({ messages, virtualMessages, totalHeight, scroll }) => (
          <div style={{ position: "relative" }}>
            <VirtualWindowLogger
              virtualMessages={virtualMessages}
              messages={messages}
              scrollTop={scroll.scrollTop}
              totalHeight={totalHeight}
              onLog={onVirtualChange}
            />

            <div
              ref={scroll.containerRef}
              onScroll={scroll.onScroll}
              style={styles.conversation}
            >
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
                      {scroll.isFastScrolling ? (
                        <PlaceholderBubble
                          role={message.role}
                          height={vm.height}
                          content={message.content}
                        />
                      ) : isUser ? (
                        <UserBubble content={message.content} />
                      ) : (
                        <AssistantBubble message={message} />
                      )}
                    </div>
                  )
                })}
              </div>

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

const MemoVirtConversation = memo(VirtConversation)

function VirtualWindowLogger({
  virtualMessages,
  messages,
  scrollTop,
  totalHeight,
  onLog,
}: {
  virtualMessages: { index: number }[]
  messages: Message[]
  scrollTop: number
  totalHeight: number
  onLog: (entry: LogEntry) => void
}) {
  const rendered = virtualMessages.length
  const total = messages.length
  const windowStart = rendered > 0 ? virtualMessages[0].index : -1
  const windowEnd =
    rendered > 0 ? virtualMessages[rendered - 1].index : -1
  const windowKey = `${windowStart}-${windowEnd}`

  const prevKeyRef = useRef("")

  useEffect(() => {
    if (rendered === 0) return
    if (windowKey === prevKeyRef.current) return
    prevKeyRef.current = windowKey

    onLog({
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      rendered,
      total,
      windowStart,
      windowEnd,
      scrollTop: Math.round(scrollTop),
      totalHeight: Math.round(totalHeight),
    })
  }, [
    windowKey,
    rendered,
    total,
    windowStart,
    windowEnd,
    scrollTop,
    totalHeight,
    onLog,
  ])

  return null
}

const UserBubble = memo(function UserBubble({ content }: { content: string }) {
  return (
    <div style={styles.userBubble}>
      <div style={styles.bubbleRole}>You</div>
      <div style={styles.bubbleText}>{content}</div>
    </div>
  )
})

const AssistantBubble = memo(function AssistantBubble({ message }: { message: Message }) {
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
})

const PlaceholderBubble = memo(function PlaceholderBubble({
  role,
  height,
  content,
}: {
  role: MessageRole
  height: number
  content: string
}) {
  const isUser = role === "user"
  const firstLine = content.split("\n", 1)[0].slice(0, 80)

  return (
    <div
      style={{
        ...styles.placeholderBubble,
        ...(isUser ? styles.placeholderUser : styles.placeholderAssistant),
        height,
      }}
    >
      <div style={styles.bubbleRole}>{isUser ? "You" : "Assistant"}</div>
      <div style={styles.placeholderText}>{firstLine}</div>
    </div>
  )
})

function VirtLog({ entry }: { entry: LogEntry | null }) {
  return (
    <div style={styles.logSection}>
      <div style={styles.logBody}>
        {entry === null ? (
          <span style={{ opacity: 0.5 }}>
            Scroll the chat above to see virtualization in action...
          </span>
        ) : (
          <span>
            Rendered{" "}
            <strong style={styles.logHighlight}>{entry.rendered}</strong>
            {" of "}
            <strong style={styles.logHighlight}>{entry.total}</strong>
            {" messages — window ["}
            {entry.windowStart}-{entry.windowEnd}
            {"] — scroll "}
            {entry.scrollTop.toLocaleString()}px /{" "}
            {entry.totalHeight.toLocaleString()}px
          </span>
        )}
      </div>
    </div>
  )
}

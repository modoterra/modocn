import {
  ChatBox,
  useChatBox,
} from "@/registry/default/chat-box/components/chat-box"
import { ChatMessage } from "@/registry/default/chat-message/components/chat-message"
import { MarkdownContent } from "@/registry/default/chat-message/components/markdown-content"
import { ChatMessages } from "@/registry/default/chat-messages/components/chat-messages"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createMockStreamFetch } from "../lib/mock-stream"

import type { Message } from "@/registry/default/chat-box/lib/types"

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
      <Card className="min-w-0 max-w-full overflow-x-hidden">
        <VirtHeader latestLog={latestLog} />
        <CardContent className="p-0">
          <MemoVirtConversation onVirtualChange={updateLog} />
        </CardContent>
        <VirtLog entry={latestLog} />
      </Card>
    </ChatBox>
  )
}

function VirtHeader({ latestLog }: { latestLog: LogEntry | null }) {
  const { messages } = useChatBox()

  return (
    <CardHeader className="flex flex-col gap-5 px-5 py-6 border-b">
      <div className="flex items-baseline justify-between gap-3 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3">
        <span className="text-xs font-semibold tracking-wide uppercase">Virtualization</span>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground max-[480px]:hidden">
          <span>
            total: <strong className="text-foreground font-medium">{messages.length}</strong>
          </span>
          <span>
            rendered:{" "}
            <strong className="text-foreground font-medium">
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
      <p className="text-[0.8125rem] text-muted-foreground leading-relaxed m-0">
        {messages.length} messages pre-loaded with markdown tables, code
        blocks, and lists. Scroll to see only a handful rendered at once.
      </p>
    </CardHeader>
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
      return <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</div>
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
          <div className="relative">
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
              className="relative h-[420px] overflow-y-auto p-4"
            >
              <div className="relative" style={{ height: totalHeight }}>
                {virtualMessages.map((vm) => {
                  const message = messages[vm.index]
                  const isUser = message.role === "user"

                  return (
                    <div
                      key={vm.id}
                      className={`absolute left-0 right-0 flex ${isUser ? "justify-end" : "justify-start"}`}
                      style={{ top: vm.offsetTop }}
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

              {!scroll.isAtBottom && messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scroll.scrollToBottom()}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs"
                >
                  Jump to latest
                </Button>
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
    <div
      className="border border-border bg-card px-3.5 py-2.5"
      style={{ maxWidth: `min(${ASSISTANT_BUBBLE_WIDTH}px, 100%)` }}
    >
      <div className="text-[0.625rem] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">You</div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</div>
    </div>
  )
})

const AssistantBubble = memo(function AssistantBubble({ message }: { message: Message }) {
  return (
    <ChatMessage message={message}>
      {({ copied, copy }) => (
        <div
          className="border border-border px-3.5 py-2.5"
          style={{ maxWidth: `min(${ASSISTANT_BUBBLE_WIDTH}px, 100%)` }}
        >
          <div className="text-[0.625rem] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Assistant</div>
          <MarkdownContent
            content={message.content}
            className="text-[14px] leading-[1.65]"
          />
          <div className="flex justify-end mt-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={copy}
              className="text-[0.625rem] font-semibold tracking-widest uppercase text-muted-foreground p-0 h-auto"
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}
    </ChatMessage>
  )
})

function VirtLog({ entry }: { entry: LogEntry | null }) {
  return (
      <div className="border-t border-border">
      <div className="px-5 py-5 text-[0.6875rem] leading-relaxed text-muted-foreground bg-card">
        {entry === null ? (
          <span className="opacity-50">
            Scroll the chat above to see virtualization in action...
          </span>
        ) : (
          <span>
            Rendered{" "}
            <strong className="text-foreground font-medium">{entry.rendered}</strong>
            {" of "}
            <strong className="text-foreground font-medium">{entry.total}</strong>
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

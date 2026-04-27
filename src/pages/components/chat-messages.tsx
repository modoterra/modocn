import { ComponentPage } from "@/src/components/component-page"

export function ChatMessagesPage() {
  return (
    <ComponentPage
      name="ChatMessages"
      registry="chat-messages"
      description="Virtualized message list with scroll management. Only renders messages visible in the viewport plus configurable overscan. Supports two measurement modes: pretext for plain text, DOM-based for rich content like markdown. Automatically sticks to bottom during streaming."
      features={[
        "Virtualized rendering — only visible messages are in the DOM",
        "Binary search for efficient visible range detection",
        "Two measurement modes: pretext (no DOM) and DOM-based (for rich content)",
        "Automatic stick-to-bottom during streaming with manual scroll detach",
        "Configurable gap, overscan, and per-message padding",
        "ResizeObserver-based viewport tracking",
        "Scroll-to-bottom with configurable threshold",
      ]}
      props={[
        { name: "font", type: "string", description: "CSS font shorthand for pretext measurement mode." },
        { name: "maxWidth", type: "number", description: "Maximum text width in pixels for measurement." },
        { name: "lineHeight", type: "number", description: "Line height in pixels for pretext measurement." },
        { name: "whiteSpace", type: '"normal" | "pre-wrap"', description: "White space mode for measurement." },
        { name: "gap", type: "number", default: "12", description: "Gap between messages in pixels." },
        { name: "overscan", type: "number", default: "3", description: "Extra messages rendered outside the visible viewport." },
        { name: "paddingPerMessage", type: "number | (message: Message) => number", default: "0", description: "Extra vertical padding per message. Use a function for role-specific values." },
        { name: "renderContent", type: "(message: Message) => ReactNode", description: "Enables DOM measurement mode. Provide a render function for rich content." },
        { name: "measureKey", type: "string", description: "Cache key for DOM measurements. Change to force re-measurement." },
        { name: "children", type: "(props: ChatMessagesRenderProps) => ReactNode", description: "Render prop receiving virtual messages, heights, scroll state, and totals." },
      ]}
      exports={[
        { name: "ChatMessages", kind: "component", description: "Virtualized message list. Must be used inside a ChatBox provider." },
        { name: "useChatMessagesContainerRef", kind: "hook", description: "Returns a ref callback for wiring scroll tracking and viewport measurement to a container element." },
        { name: "useMessageHeights", kind: "hook", description: "Pretext-based message height computation. Caches prepare() results per message ID." },
        { name: "useDOMHeights", kind: "hook", description: "DOM-based message height measurement from a hidden container. For rich/markdown content." },
        { name: "useVirtualMessages", kind: "hook", description: "Core virtualization hook. Returns only messages that should be rendered given scroll position and viewport." },
        { name: "useVirtualMetrics", kind: "hook", description: "Computes total height and per-message offsets from heights and gap." },
        { name: "useChatScroll", kind: "hook", description: "Scroll management with stick-to-bottom. Uses requestAnimationFrame polling for smooth tracking." },
        { name: "ChatScrollState", kind: "type", description: "Scroll state: { scrollTop, isAtBottom, containerRef, scrollToBottom, onScroll }" },
        { name: "VirtualMessage", kind: "type", description: "Virtual message: { index, id, offsetTop, height }" },
        { name: "MessageHeight", kind: "type", description: "Message height result: { id, height, lineCount }" },
      ]}
      examples={[
        {
          title: "Pretext measurement mode",
          description: "For plain text messages, pretext computes heights without touching the DOM.",
          code: `<ChatMessages
  font='15px "Segoe UI", sans-serif'
  maxWidth={520}
  lineHeight={22}
  gap={12}
  overscan={5}
>
  {({ virtualMessages, totalHeight, scroll }) => (
    <div
      ref={scroll.containerRef}
      onScroll={scroll.onScroll}
      style={{ height: 400, overflow: "auto" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {virtualMessages.map((vm) => (
          <div
            key={vm.id}
            style={{ position: "absolute", top: vm.offsetTop }}
          >
            {messages[vm.index].content}
          </div>
        ))}
      </div>
    </div>
  )}
</ChatMessages>`,
        },
        {
          title: "DOM measurement mode",
          description: "For rich content like markdown, use renderContent to enable DOM-based measurement.",
          code: `<ChatMessages
  maxWidth={520}
  gap={16}
  overscan={5}
  paddingPerMessage={(msg) =>
    msg.role === "assistant" ? 82 : 46
  }
  renderContent={(msg) => (
    <MarkdownContent content={msg.content} />
  )}
>
  {({ virtualMessages, totalHeight, scroll, messages }) => (
    <div
      ref={scroll.containerRef}
      onScroll={scroll.onScroll}
      className="h-[420px] overflow-y-auto"
    >
      <div style={{ height: totalHeight }} className="relative">
        {virtualMessages.map((vm) => (
          <div
            key={vm.id}
            className="absolute left-0 right-0"
            style={{ top: vm.offsetTop }}
          >
            <MessageBubble message={messages[vm.index]} />
          </div>
        ))}
      </div>
    </div>
  )}
</ChatMessages>`,
        },
        {
          title: "Scroll-to-bottom button",
          description: "Use scroll.isAtBottom to conditionally show a jump-to-bottom button.",
          code: `{!scroll.isAtBottom && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => scroll.scrollToBottom()}
    className="absolute bottom-3 left-1/2 -translate-x-1/2"
  >
    Jump to latest
  </Button>
)}`,
        },
      ]}
      prev={{ label: "ChatMessage", href: "/docs/components/chat-message" }}
      next={{ label: "StreamingText", href: "/docs/components/streaming-text" }}
    />
  )
}

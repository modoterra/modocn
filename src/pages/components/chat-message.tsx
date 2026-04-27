import { ComponentPage } from "@/src/components/component-page"

export function ChatMessagePage() {
  return (
    <ComponentPage
      name="ChatMessage"
      registry="chat-message"
      description="Headless per-message component with pretext-powered balanced text wrapping and copy-to-clipboard. Finds the tightest container width that preserves line count, eliminating awkward short last lines in chat bubbles."
      features={[
        "Balanced text wrapping — binary search finds the narrowest width preserving line count",
        "Copy-to-clipboard with auto-resetting copied state",
        "Render prop and context API for full layout control",
        "Includes MarkdownContent component for rich message rendering",
        "Shiki-powered syntax highlighting for code blocks",
        "Works with or without pretext measurement (graceful fallback for rich content)",
      ]}
      props={[
        { name: "message", type: "Message", description: "The message object to render." },
        { name: "font", type: "string", description: "CSS font shorthand for balanced-text measurement. Omit for rich/markdown content." },
        { name: "maxWidth", type: "number", description: "Maximum container width in pixels for measurement." },
        { name: "lineHeight", type: "number", description: "Line height in pixels for measurement." },
        { name: "copyResetMs", type: "number", default: "2000", description: "Milliseconds before the copied state resets to false." },
        { name: "children", type: "ReactNode | (ctx: ChatMessageContext) => ReactNode", description: "Content or render prop receiving message context." },
      ]}
      exports={[
        { name: "ChatMessage", kind: "component", description: "Headless per-message component with balanced text and copy support." },
        { name: "useChatMessage", kind: "hook", description: "Access the message context from any descendant. Returns { message, width, height, lineCount, copied, copy }." },
        { name: "useBalancedText", kind: "hook", description: "Standalone balanced-text hook. Binary search for tightest width preserving line count." },
        { name: "MarkdownContent", kind: "component", description: "Memoized markdown renderer with react-markdown, remark-gfm, and optional Shiki highlighting." },
        { name: "ChatMessageContext", kind: "type", description: "Context type: { message, width, height, lineCount, copied, copy }" },
      ]}
      examples={[
        {
          title: "Balanced text bubble",
          description: "Render a message with balanced text wrapping and copy support.",
          code: `<ChatMessage
  message={message}
  font='15px "Segoe UI", sans-serif'
  maxWidth={520}
  lineHeight={22}
>
  {({ width, copied, copy }) => (
    <div style={{ width }}>
      <p>{message.content}</p>
      <button onClick={copy}>{copied ? "Copied" : "Copy"}</button>
    </div>
  )}
</ChatMessage>`,
        },
        {
          title: "Markdown message",
          description: "Use MarkdownContent for rich message rendering with syntax highlighting.",
          code: `<ChatMessage message={message}>
  {({ copied, copy }) => (
    <div>
      <MarkdownContent
        content={message.content}
        highlighter={highlighter}
        theme="github-dark-dimmed"
      />
      <button onClick={copy}>{copied ? "Copied" : "Copy"}</button>
    </div>
  )}
</ChatMessage>`,
        },
        {
          title: "MarkdownContent standalone",
          description: "MarkdownContent can be used independently for any markdown rendering.",
          code: `import { MarkdownContent } from "@/components/chat-message"

<MarkdownContent
  content="# Hello\\n\\nSome **bold** text and \`inline code\`."
  className="text-sm leading-relaxed"
/>`,
        },
      ]}
      prev={{ label: "ChatInput", href: "/docs/components/chat-input" }}
      next={{ label: "ChatMessages", href: "/docs/components/chat-messages" }}
    />
  )
}

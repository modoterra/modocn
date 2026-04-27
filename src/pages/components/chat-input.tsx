import { ComponentPage } from "@/src/components/component-page"

export function ChatInputPage() {
  return (
    <ComponentPage
      name="ChatInput"
      registry="chat-input"
      description="Headless auto-sizing textarea with pretext-powered measurement. Grows with content up to a configurable maximum, then scrolls. Provides height, line count, and keyboard handling via render props. Must be used inside a ChatBox provider."
      features={[
        "Auto-sizing textarea that grows with content using pretext measurement",
        "Configurable min/max height with overflow scrolling",
        "Submit-on-Enter with Shift+Enter for newlines",
        "IME composition-aware keyboard handling",
        "Render prop API for full control over the textarea UI",
        "No DOM reflow — height is computed from font metrics alone",
      ]}
      props={[
        { name: "font", type: "string", description: "CSS font shorthand for pretext measurement (e.g. '15px sans-serif')." },
        { name: "maxWidth", type: "number", description: "Maximum text width in pixels for line wrapping calculation." },
        { name: "lineHeight", type: "number", description: "Line height in pixels for height calculation." },
        { name: "minHeight", type: "number", description: "Minimum textarea height in pixels." },
        { name: "maxHeight", type: "number", description: "Maximum textarea height in pixels. Content scrolls beyond this." },
        { name: "children", type: "(props: ChatInputRenderProps) => ReactNode", description: "Render prop receiving input state, sizing, and handlers." },
      ]}
      exports={[
        { name: "ChatInput", kind: "component", description: "Headless auto-sizing input. Must be used inside a ChatBox provider." },
        { name: "ChatInputRenderProps", kind: "type", description: "Render prop type: { input, setInput, submit, stop, isLoading, height, lineCount, onKeyDown }" },
        { name: "ChatInputProps", kind: "type", description: "Props type for ChatInput component." },
      ]}
      examples={[
        {
          title: "Basic textarea with send button",
          description: "Wire up a standard textarea with auto-sizing and send/stop controls.",
          code: `<ChatInput
  font='15px "JetBrains Mono", monospace'
  maxWidth={640}
  lineHeight={22}
  minHeight={42}
  maxHeight={150}
>
  {({ input, setInput, submit, stop, isLoading, height, onKeyDown }) => (
    <div className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        style={{ height, overflowY: height >= 150 ? "auto" : "hidden" }}
        className="flex-1 resize-none"
      />
      {isLoading ? (
        <Button onClick={stop}>Stop</Button>
      ) : (
        <Button onClick={submit} disabled={!input.trim()}>Send</Button>
      )}
    </div>
  )}
</ChatInput>`,
        },
        {
          title: "Inside a ChatBox",
          description: "ChatInput reads input state from ChatBox context automatically.",
          code: `<ChatBox api="/api/chat">
  <ChatInput font="15px sans-serif" maxWidth={600} lineHeight={22}>
    {({ input, setInput, submit, height, onKeyDown }) => (
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        style={{ height }}
      />
    )}
  </ChatInput>
</ChatBox>`,
        },
      ]}
      prev={{ label: "ChatBox", href: "/docs/components/chat-box" }}
      next={{ label: "ChatMessage", href: "/docs/components/chat-message" }}
    />
  )
}

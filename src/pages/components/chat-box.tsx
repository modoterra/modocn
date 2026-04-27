import { ComponentPage } from "@/src/components/component-page"

export function ChatBoxPage() {
  return (
    <ComponentPage
      name="ChatBox"
      registry="chat-box"
      description="Headless chat state provider. Manages the message list, user input, streaming lifecycle, error handling, and transport. All other chat components read from its context. Renders no DOM elements — bring your own UI."
      features={[
        "Message state management with add, clear, reload, and set operations",
        "Streaming lifecycle with start, finish, and error callbacks",
        "Pluggable transport system — use the built-in text transport or bring your own",
        "Abort/stop support for in-flight requests",
        "Render prop and context-based API for maximum flexibility",
        "Submit-on-Enter keyboard handler with Shift+Enter for newlines",
        "Pretext-powered text measurement hooks (useAutosize, usePretextMeasure)",
      ]}
      props={[
        { name: "api", type: "string", description: "API endpoint for the built-in text transport." },
        { name: "transport", type: "ChatTransport", description: "Custom transport implementation. Takes priority over api." },
        { name: "initialMessages", type: "Message[]", description: "Pre-populate the conversation with existing messages." },
        { name: "headers", type: "HeadersInit", description: "Custom headers for the built-in text transport." },
        { name: "body", type: "Record<string, unknown>", description: "Extra body fields merged into the transport request." },
        { name: "onStart", type: "() => void", description: "Called when streaming begins." },
        { name: "onFinish", type: "(message: Message) => void", description: "Called when streaming completes with the full assistant message." },
        { name: "onError", type: "(error: Error) => void", description: "Called on transport error." },
        { name: "fetch", type: "typeof fetch", description: "Custom fetch implementation for the built-in transport." },
        { name: "generateId", type: "() => string", description: "Custom ID generator for new messages." },
        { name: "children", type: "ReactNode | (chat: ChatHandler) => ReactNode", description: "Content or render prop receiving the full chat state and actions." },
      ]}
      exports={[
        { name: "ChatBox", kind: "component", description: "Root provider component. Wraps children with chat context." },
        { name: "useChatBox", kind: "hook", description: "Access the chat context from any descendant. Throws if used outside a ChatBox." },
        { name: "useChatBoxSubmitOnEnter", kind: "hook", description: "Returns an onKeyDown handler that submits on Enter, newline on Shift+Enter. Respects IME composition." },
        { name: "useChat", kind: "hook", description: "Standalone chat state hook. Use this if you don't need the context provider pattern." },
        { name: "useAutosize", kind: "hook", description: "Auto-sizing hook using pretext measurement. Returns { height, lineCount }." },
        { name: "usePretextMeasure", kind: "hook", description: "Low-level pretext measurement hook. Returns { height, lineCount } for given text and font params." },
        { name: "textTransport", kind: "function", description: "Creates the default plain-text streaming transport." },
        { name: "ChatBoxContext", kind: "context", description: "Raw React context for advanced use cases." },
        { name: "ChatTransport", kind: "type", description: "Interface for transport implementations: { send(messages, signal): AsyncIterable<string> }" },
        { name: "ChatHandler", kind: "type", description: "Combined state and actions type returned by useChat and useChatBox." },
        { name: "Message", kind: "type", description: 'Message object: { id, role, content, createdAt }. Role is "user" | "assistant" | "system".' },
        { name: "ChatOptions", kind: "type", description: "Options accepted by ChatBox and useChat." },
      ]}
      examples={[
        {
          title: "Basic usage with render prop",
          description: "Access chat state directly via the render prop pattern.",
          code: `<ChatBox api="/api/chat">
  {({ messages, input, setInput, submit, isLoading }) => (
    <div>
      {messages.map((m) => (
        <p key={m.id}>{m.content}</p>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={submit} disabled={isLoading}>
        Send
      </button>
    </div>
  )}
</ChatBox>`,
        },
        {
          title: "Context-based composition",
          description: "Use useChatBox in child components to access chat state from context.",
          code: `<ChatBox api="/api/chat" onFinish={(msg) => save(msg)}>
  <ChatMessages maxWidth={520}>
    {(props) => <MessageList {...props} />}
  </ChatMessages>
  <ChatInput font="15px sans-serif" maxWidth={640} lineHeight={22}>
    {(props) => <InputArea {...props} />}
  </ChatInput>
</ChatBox>`,
        },
        {
          title: "Custom transport",
          description: "Provide a custom transport for any streaming backend.",
          code: `const myTransport: ChatTransport = {
  async *send(messages, signal) {
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
      signal,
    })
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield decoder.decode(value)
    }
  }
}

<ChatBox transport={myTransport}>
  {/* ... */}
</ChatBox>`,
        },
      ]}
      prev={{ label: "Components", href: "/docs/components" }}
      next={{ label: "ChatInput", href: "/docs/components/chat-input" }}
    />
  )
}

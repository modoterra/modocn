import { ComponentPage } from "@/src/components/component-page"

export function ChatFullPage() {
  return (
    <ComponentPage
      name="ChatFull"
      registry="chat-full"
      description="Complete styled chat interface that composes all the primitives into a working chat with streaming, virtualization, balanced text, auto-sizing input, and scroll management. Drop it in with an API endpoint and you have a working chat. Use it as-is or as a reference for building your own composition."
      features={[
        "Composes ChatBox, ChatInput, ChatMessage, and ChatMessages hooks",
        "Built with shadcn Card, Button, and Textarea components",
        "User messages in right-aligned primary-colored bubbles",
        "Assistant messages with balanced text width and copy-to-clipboard",
        "Virtualized rendering with binary-search viewport detection",
        "Auto-sizing textarea input with enter-to-submit",
        "Scroll-to-bottom button when scrolled away from the latest message",
        "Responsive effectiveMaxWidth computed from container width",
        "Configurable placeholder for empty state",
        "Accepts className for custom styling via cn()",
      ]}
      props={[
        { name: "api", type: "string", description: "API endpoint for the built-in text transport." },
        { name: "transport", type: "ChatTransport", description: "Custom transport implementation." },
        { name: "initialMessages", type: "Message[]", description: "Pre-populate the conversation." },
        { name: "header", type: "ReactNode", description: "Optional header element rendered at the top of the card." },
        { name: "placeholder", type: "string", default: '"Send a message to start the conversation."', description: "Text shown when there are no messages." },
        { name: "className", type: "string", description: "Additional CSS classes merged via cn()." },
        { name: "onStart", type: "() => void", description: "Called when streaming begins." },
        { name: "onFinish", type: "(message: Message) => void", description: "Called when streaming completes." },
        { name: "onError", type: "(error: Error) => void", description: "Called on transport error." },
      ]}
      exports={[
        { name: "ChatFull", kind: "component", description: "Complete styled chat interface." },
        { name: "ChatFullProps", kind: "type", description: "Props type extending ChatOptions with header, placeholder, and className." },
      ]}
      examples={[
        {
          title: "Quick start",
          description: "Minimal setup with just an API endpoint.",
          code: `import { ChatFull } from "@/components/chat-full"

<ChatFull api="/api/chat" />`,
        },
        {
          title: "With header and placeholder",
          description: "Customize the header and empty-state message.",
          code: `<ChatFull
  api="/api/chat"
  header={<h2 className="text-sm font-semibold">Support</h2>}
  placeholder="Ask a question..."
/>`,
        },
        {
          title: "With OpenAI transport",
          description: "Use the transport-openai adapter for OpenAI-compatible APIs.",
          code: `import { openaiTransport } from "@/lib/transport-openai"
import { ChatFull } from "@/components/chat-full"

<ChatFull
  transport={openaiTransport({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",
  })}
  header={<h2>AI Assistant</h2>}
/>`,
        },
        {
          title: "With lifecycle callbacks",
          description: "Track streaming lifecycle for analytics or persistence.",
          code: `<ChatFull
  api="/api/chat"
  onStart={() => console.log("Streaming started")}
  onFinish={(msg) => saveToDatabase(msg)}
  onError={(err) => reportError(err)}
/>`,
        },
      ]}
      prev={{ label: "StreamingText", href: "/docs/components/streaming-text" }}
      next={{ label: "Transport OpenAI", href: "/docs/components/transport-openai" }}
    />
  )
}

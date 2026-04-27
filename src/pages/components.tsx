import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const COMPONENTS = [
  {
    name: "ChatBox",
    registry: "chat-box",
    href: "/docs/components/chat-box",
    description: "Context provider and state machine for chat. Manages messages, input, streaming lifecycle, and error handling.",
    kind: "headless",
  },
  {
    name: "ChatInput",
    registry: "chat-input",
    href: "/docs/components/chat-input",
    description: "Auto-sizing textarea with pretext-powered measurement. Grows with content, clamps to min/max height, and provides keyboard handling.",
    kind: "headless",
  },
  {
    name: "ChatMessage",
    registry: "chat-message",
    href: "/docs/components/chat-message",
    description: "Per-message component with balanced text and copy-to-clipboard. Includes a memoized markdown renderer with Shiki highlighting.",
    kind: "headless",
  },
  {
    name: "ChatMessages",
    registry: "chat-messages",
    href: "/docs/components/chat-messages",
    description: "Virtualized message list with scroll management. Only renders visible messages. Supports pretext and DOM-based measurement modes.",
    kind: "headless",
  },
  {
    name: "StreamingText",
    registry: "streaming-text",
    href: "/docs/components/streaming-text",
    description: "Animated streaming text with word-level motion. Ships with five presets: fade-blur, fade, slide-up, scale, and none.",
    kind: "visual",
  },
  {
    name: "ChatFull",
    registry: "chat-full",
    href: "/docs/components/chat-full",
    description: "Complete styled chat interface. Composes all the primitives into a working chat with streaming, virtualization, and auto-sizing input.",
    kind: "visual",
  },
  {
    name: "openaiTransport",
    registry: "transport-openai",
    href: "/docs/components/transport-openai",
    description: "Transport adapter for OpenAI-compatible SSE APIs. Works with OpenAI, Azure OpenAI, Groq, Together, and any compatible endpoint.",
    kind: "library",
  },
]

export function ComponentsPage() {
  return (
    <div>
      <h1 className="m-0">Components</h1>
      <p className="mt-4 max-w-3xl">
        Every component in the modocn registry. Install individually or
        use{" "}
        <Link to="/docs/getting-started">the CLI</Link> to pull in what
        you need.
      </p>

      <section className="mt-8">
        <p className="mb-3">Install everything</p>
        <pre className="overflow-x-auto p-4">
          <code className="whitespace-pre">npx shadcn add https://modocn.mdtrr.com/r/chat-full.json</code>
        </pre>
        <p className="mt-4">
          The CLI resolves dependencies automatically.{" "}
          <code>chat-full</code>{" "}
          pulls in all the conversational UI primitives.
        </p>
      </section>

      <section className="mt-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {COMPONENTS.map((c) => (
            <Link key={c.name} to={c.href} className="h-full">
              <Card className="h-full p-6">
                <div className="flex items-center gap-3">
                  <span>{c.name}</span>
                  <Badge variant="outline">
                    {c.kind}
                  </Badge>
                </div>
                <p className="mt-2">
                  {c.registry}
                </p>
                <p className="mt-4 flex-1">
                  {c.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Separator className="mt-12" />

      <nav className="flex flex-wrap justify-between gap-4 py-8">
        <Link to="/docs/conversational-ui">
          &larr; Conversational UI
        </Link>
        <Link to="/docs/components/chat-box">
          ChatBox &rarr;
        </Link>
      </nav>
    </div>
  )
}

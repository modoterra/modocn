import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const COMPONENTS = [
  { title: "ChatBox", href: "/docs/components/chat-box", description: "Chat state, transport, and context provider." },
  { title: "ChatInput", href: "/docs/components/chat-input", description: "Auto-sizing textarea with keyboard handling." },
  { title: "ChatMessage", href: "/docs/components/chat-message", description: "Per-message rendering with balanced text and copy." },
  { title: "ChatMessages", href: "/docs/components/chat-messages", description: "Virtualized message list with scroll management." },
  { title: "StreamingText", href: "/docs/components/streaming-text", description: "Word-level streaming animation with presets." },
  { title: "ChatFull", href: "/docs/components/chat-full", description: "Complete styled chat interface, ready to use." },
  { title: "openaiTransport", href: "/docs/components/transport-openai", description: "Transport adapter for OpenAI-compatible APIs." },
]

const BOTTOM_LINKS = [
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    description: "Install and configure components in your project.",
  },
  {
    title: "Components",
    href: "/docs/components",
    description: "Full API reference for every registry component.",
  },
  {
    title: "Demos",
    href: "/demos",
    description: "Live demonstrations with mock streaming.",
  },
]

export function HomePage() {
  return (
    <>
      <section className="py-10 sm:py-14">
        <div className="space-y-6">
          <Badge variant="outline" className="px-3 py-1">
            shadcn registry for React
          </Badge>
          <div className="space-y-4">
            <h1 className="m-0 max-w-3xl">
              Conversational UI blocks that install cleanly into your app.
            </h1>
            <p className="max-w-3xl">
              modocn publishes chat components, streaming text, message lists, and
              transport helpers as a shadcn-compatible registry. Start from a
              Tailwind 4 project, choose the luma preset in shadcn, then install
              blocks with a single command.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/docs/getting-started">
                Get started
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/docs/components">
                Browse components
              </Link>
            </Button>
          </div>
        </div>

        <Card className="mt-8 p-6 sm:p-8">
          <p className="mb-3">Install the full chat stack</p>
          <pre className="overflow-x-auto p-4">
            <code className="whitespace-pre">npx shadcn add https://modocn.mdtrr.com/r/chat-full.json</code>
          </pre>
        </Card>
      </section>

      <Separator className="my-10" />

      <section className="py-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COMPONENTS.map((c) => (
            <Link key={c.title} to={c.href} className="h-full">
              <Card className="h-full p-6">
                <span>{c.title}</span>
                <p className="mt-3 flex-1">{c.description}</p>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="ghost">
              <Link to="/docs/conversational-ui">
              Read the architecture guide
            </Link>
          </Button>
        </div>
      </section>

      <Separator className="my-10" />

      <section className="py-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {BOTTOM_LINKS.map((link) => (
            <Link key={link.title} to={link.href} className="h-full">
              <Card className="h-full p-6">
                <span>{link.title}</span>
                <p className="mt-3">
                  {link.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

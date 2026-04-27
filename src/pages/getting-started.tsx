import { Card } from "@/components/ui/card"
import { Link } from "react-router"
import { Separator } from "@/components/ui/separator"

export function GettingStartedPage() {
  return (
    <div>
      <h1 className="m-0">Getting Started</h1>
      <p className="mt-4 max-w-3xl">
        modocn is distributed as a shadcn registry. Start from a React project
        using Tailwind CSS v4, initialize shadcn with the luma preset, then add
        any block directly from the registry.
      </p>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2>Project setup</h2>
          <p className="mt-3">
            Use a React project with Tailwind CSS v4. Run the shadcn initializer,
            choose the <code>luma</code> preset,
            and keep the default CSS variable setup.
          </p>
          <pre className="mt-4 overflow-x-auto p-4">
            <code className="whitespace-pre">npx shadcn init</code>
          </pre>
        </Card>

        <Card className="p-6">
          <h2>What modocn expects</h2>
          <p className="mt-3">
            The registry targets the standard shadcn workflow: Tailwind 4,
            neutral tokens, and installable source files that you own after
            adding them to your app.
          </p>
        </Card>
      </section>

      <section className="mt-12">
        <h2>Install a component</h2>
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <p className="mb-3">Install the full chat stack</p>
            <pre className="overflow-x-auto p-4">
              <code className="whitespace-pre">npx shadcn add https://modocn.mdtrr.com/r/chat-full.json</code>
            </pre>
          </div>
          <div>
            <p className="mb-3">Or install individual primitives</p>
            <pre className="overflow-x-auto p-4">
              <code className="whitespace-pre">{`npx shadcn add https://modocn.mdtrr.com/r/chat-box.json
npx shadcn add https://modocn.mdtrr.com/r/chat-input.json
npx shadcn add https://modocn.mdtrr.com/r/chat-messages.json
npx shadcn add https://modocn.mdtrr.com/r/streaming-text.json`}</code>
            </pre>
          </div>
        </div>
        <p className="mt-4 max-w-3xl">
          <code>chat-full</code> pulls in the full conversational UI
          stack automatically. Install individual blocks only when you want to
          compose your own interface.
        </p>
      </section>

      <section className="mt-12">
        <h2>Basic usage</h2>
        <pre className="mt-4 overflow-x-auto p-4">
          <code className="whitespace-pre">{`import { ChatFull } from "@/components/chat-full"

export function App() {
  return (
    <ChatFull api="/api/chat" />
  )
}`}</code>
        </pre>
        <p className="mt-4 max-w-3xl">
          That gives you a complete chat interface with streaming, auto-sizing
          input, virtualized messages, and scroll management. Every component
          can be styled and composed however you need.
        </p>
      </section>

      <section className="mt-12">
        <h2>Available components</h2>
        <p className="mt-4 max-w-3xl">
          See the full list on the{" "}
          <Link to="/docs/components">Components</Link> page, or read about
          the system design on the{" "}
          <Link to="/docs/conversational-ui">Conversational UI</Link> page.
        </p>
      </section>

      <Separator className="mt-12" />

      <nav className="py-8">
        <Link to="/docs/conversational-ui">
          Conversational UI &rarr;
        </Link>
      </nav>
    </div>
  )
}

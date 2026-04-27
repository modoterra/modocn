import { Link } from "react-router"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

const ARCH_ROWS = [
  { name: "ChatBox", indent: 0, desc: "State, transport, context provider" },
  { name: "ChatInput", indent: 1, desc: "Auto-sizing textarea, keyboard handling" },
  { name: "ChatMessages", indent: 1, desc: "Virtualized message list, scroll management" },
  { name: "ChatMessage", indent: 2, desc: "Per-message rendering, balanced text, copy" },
  { name: "StreamingText", indent: 0, desc: "Word-level animation (independent)" },
  { name: "ChatFull", indent: 0, desc: "Reference implementation using all of the above" },
]

export function ConversationalUIPage() {
  return (
    <div>
      <h1 className="m-0">Conversational UI</h1>
      <p className="mt-14 max-w-[48rem]">
        A set of composable React components for building chat interfaces.
        Each component handles one concern — state, input, messages,
        streaming, transport — and they compose together naturally. Easy to
        style and adapt to your application.
      </p>

      <section className="mt-28">
        <h2 className="mb-12">Architecture</h2>
        <p className="max-w-[48rem]">
          The system is built in layers. At the base,{" "}
          <code>ChatBox</code> manages
          conversation state and streaming transport. Above that, specialized
          components handle input, message rendering, and virtualization. All
          components can be styled and extended to match your application.
        </p>
        <div className="mt-14">
          <Table>
            <TableBody>
              {ARCH_ROWS.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="py-5 whitespace-nowrap">
                    {row.indent > 0 && (
                    <span>
                        {"  ".repeat(row.indent)}
                      </span>
                    )}
                    {row.name}
                  </TableCell>
                  <TableCell className="w-full py-5">{row.desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-28">
        <h2 className="mb-12">Components</h2>

        <div className="flex flex-col gap-24 mt-16">
          <div>
            <h3 className="mb-7">ChatBox</h3>
            <p className="max-w-[48rem]">
              The root provider. Manages the message list, input state, streaming
              lifecycle, and error handling. Accepts a transport or API endpoint.
              All other chat components read from its context.
            </p>
            <code className="mt-6 block overflow-x-auto p-4 whitespace-pre">
{`<ChatBox api="/api/chat" onFinish={(msg) => save(msg)}>
  <ChatMessages>
    {(props) => <MessageList {...props} />}
  </ChatMessages>
  <ChatInput />
</ChatBox>`}
            </code>
          </div>

          <div>
            <h3 className="mb-7">ChatInput</h3>
            <p className="max-w-[48rem]">
              Auto-sizing textarea powered by{" "}
              <code>@chenglou/pretext</code>{" "}
              measurement. Grows with content up to a configurable maximum,
              then scrolls. Handles submit-on-Enter and shift-for-newline
              keyboard behavior.
            </p>
          </div>

          <div>
            <h3 className="mb-7">ChatMessages</h3>
            <p className="max-w-[48rem]">
              Virtualized message list. Only renders messages visible in the
              viewport plus a configurable overscan. Handles scroll management
              with automatic stick-to-bottom during streaming. Supports two
              measurement modes: pretext for plain text, DOM-based for rich
              content like markdown.
            </p>
          </div>

          <div>
            <h3 className="mb-7">ChatMessage</h3>
            <p className="max-w-[48rem]">
              Per-message rendering with balanced text — automatically finds the
              tightest container width that preserves line count, eliminating
              awkward short last lines. Includes built-in copy-to-clipboard.
            </p>
          </div>

          <div>
            <h3 className="mb-7">StreamingText</h3>
            <p className="max-w-[48rem]">
              Animated text that reveals words as they stream in. Ships with five
              presets:{" "}
              <code>fade-blur</code>,{" "}
              <code>fade</code>,{" "}
              <code>slide-up</code>,{" "}
              <code>scale</code>, and{" "}
              <code>none</code>. Accepts custom
              animation configs for full control. Independent of the chat
              components — usable anywhere you stream text.
            </p>
          </div>

          <div>
            <h3 className="mb-7">ChatFull</h3>
            <p className="max-w-[48rem]">
              A complete, styled chat interface that composes all the components.
              Drop it in with an API endpoint and you have a working chat. Use it
              as-is or as a reference for building your own composition.
            </p>
            <code className="mt-6 block overflow-x-auto p-4 whitespace-pre">
{`<ChatFull
  api="/api/chat"
  header={<h2>Support</h2>}
  placeholder="Ask a question..."
/>`}
            </code>
          </div>
        </div>
      </section>

      <section className="mt-28">
        <h2 className="mb-12">Transport</h2>
        <p className="max-w-[48rem]">
          The default transport streams plain text over a standard fetch
          response. For OpenAI-compatible APIs, use{" "}
          <code>transport-openai</code>,
          which parses SSE event streams. You can also write a custom
          transport — any object with a{" "}
          <code>
            send(messages, signal): AsyncIterable&lt;string&gt;
          </code>{" "}
          method works.
        </p>
        <code className="mt-6 block overflow-x-auto p-4 whitespace-pre">
{`import { openaiTransport } from "@/lib/transport-openai"

<ChatBox transport={openaiTransport({
  apiKey: "...",
  model: "gpt-4o",
})}>
  ...
</ChatBox>`}
        </code>
      </section>

      <Separator className="mt-32" />

      <nav className="flex flex-wrap justify-between gap-4 py-16">
        <Link to="/docs/getting-started">
          &larr; Getting Started
        </Link>
        <Link to="/docs/components">
          Components &rarr;
        </Link>
      </nav>
    </div>
  )
}

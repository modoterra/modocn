import { Link } from "react-router"
import type { CSSProperties } from "react"

const ARCH_ROWS = [
  { name: "ChatBox", indent: 0, desc: "State, transport, context provider" },
  { name: "ChatInput", indent: 1, desc: "Auto-sizing textarea, keyboard handling" },
  { name: "ChatMessages", indent: 1, desc: "Virtualized message list, scroll management" },
  { name: "ChatMessage", indent: 2, desc: "Per-message rendering, balanced text, copy" },
  { name: "StreamingText", indent: 0, desc: "Word-level animation (independent)" },
  { name: "ChatFull", indent: 0, desc: "Reference implementation using all of the above" },
]

const styles: Record<string, CSSProperties> = {
  page: {
    padding: "2rem 0",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
  },
  intro: {
    marginTop: "1rem",
    fontSize: "1rem",
    lineHeight: 1.7,
    color: "var(--muted-foreground)",
    maxWidth: "42rem",
  },
  section: {
    marginTop: "3rem",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
  },
  p: {
    fontSize: "0.9375rem",
    lineHeight: 1.7,
    color: "var(--muted-foreground)",
    maxWidth: "42rem",
  },
  archTable: {
    marginTop: "1.5rem",
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "0.8125rem",
    lineHeight: 1.6,
  },
  archName: {
    padding: "0.375rem 1rem 0.375rem 0",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap" as const,
    fontWeight: 500,
    color: "var(--foreground)",
  },
  archDesc: {
    padding: "0.375rem 0",
    borderBottom: "1px solid var(--border)",
    color: "var(--muted-foreground)",
    width: "100%",
  },
  componentBlock: {
    marginTop: "2.5rem",
  },
  componentTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  componentDesc: {
    fontSize: "0.9375rem",
    lineHeight: 1.7,
    color: "var(--muted-foreground)",
    maxWidth: "42rem",
  },
  code: {
    display: "block",
    marginTop: "1rem",
    padding: "1rem",
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: "0.8125rem",
    lineHeight: 1.7,
    overflowX: "auto" as const,
    whiteSpace: "pre" as const,
  },
  inlineCode: {
    padding: "0.125rem 0.375rem",
    background: "var(--card)",
    border: "1px solid var(--border)",
    fontSize: "0.8125rem",
  },
  nav: {
    marginTop: "3rem",
    paddingTop: "2rem",
    borderTop: "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "1rem",
  },
}

export function ConversationalUIPage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Conversational UI</h1>
      <p style={styles.intro}>
        A set of composable React components for building chat interfaces.
        Each component handles one concern — state, input, messages,
        streaming, transport — and they compose together naturally. Easy to
        style and adapt to your application.
      </p>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Architecture</h2>
        <p style={styles.p}>
          The system is built in layers. At the base,{" "}
          <span style={styles.inlineCode}>ChatBox</span> manages
          conversation state and streaming transport. Above that, specialized
          components handle input, message rendering, and virtualization. All
          components can be styled and extended to match your application.
        </p>
        <table style={styles.archTable}>
          <tbody>
            {ARCH_ROWS.map((row) => (
              <tr key={row.name}>
                <td style={styles.archName}>
                  {row.indent > 0 && (
                    <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>
                      {"  ".repeat(row.indent)}
                    </span>
                  )}
                  {row.name}
                </td>
                <td style={styles.archDesc}>{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Components</h2>

        <div style={styles.componentBlock}>
          <h3 style={styles.componentTitle}>ChatBox</h3>
          <p style={styles.componentDesc}>
            The root provider. Manages the message list, input state, streaming
            lifecycle, and error handling. Accepts a transport or API endpoint.
            All other chat components read from its context.
          </p>
          <code style={styles.code}>
{`<ChatBox api="/api/chat" onFinish={(msg) => save(msg)}>
  <ChatMessages>
    {(props) => <MessageList {...props} />}
  </ChatMessages>
  <ChatInput />
</ChatBox>`}
          </code>
        </div>

        <div style={styles.componentBlock}>
          <h3 style={styles.componentTitle}>ChatInput</h3>
          <p style={styles.componentDesc}>
            Auto-sizing textarea powered by{" "}
            <span style={styles.inlineCode}>@chenglou/pretext</span>{" "}
            measurement. Grows with content up to a configurable maximum,
            then scrolls. Handles submit-on-Enter and shift-for-newline
            keyboard behavior.
          </p>
        </div>

        <div style={styles.componentBlock}>
          <h3 style={styles.componentTitle}>ChatMessages</h3>
          <p style={styles.componentDesc}>
            Virtualized message list. Only renders messages visible in the
            viewport plus a configurable overscan. Handles scroll management
            with automatic stick-to-bottom during streaming. Supports two
            measurement modes: pretext for plain text, DOM-based for rich
            content like markdown.
          </p>
        </div>

        <div style={styles.componentBlock}>
          <h3 style={styles.componentTitle}>ChatMessage</h3>
          <p style={styles.componentDesc}>
            Per-message rendering with balanced text — automatically finds the
            tightest container width that preserves line count, eliminating
            awkward short last lines. Includes built-in copy-to-clipboard.
          </p>
        </div>

        <div style={styles.componentBlock}>
          <h3 style={styles.componentTitle}>StreamingText</h3>
          <p style={styles.componentDesc}>
            Animated text that reveals words as they stream in. Ships with five
            presets:{" "}
            <span style={styles.inlineCode}>fade-blur</span>,{" "}
            <span style={styles.inlineCode}>fade</span>,{" "}
            <span style={styles.inlineCode}>slide-up</span>,{" "}
            <span style={styles.inlineCode}>scale</span>, and{" "}
            <span style={styles.inlineCode}>none</span>. Accepts custom
            animation configs for full control. Independent of the chat
            components — usable anywhere you stream text.
          </p>
        </div>

        <div style={styles.componentBlock}>
          <h3 style={styles.componentTitle}>ChatFull</h3>
          <p style={styles.componentDesc}>
            A complete, styled chat interface that composes all the components.
            Drop it in with an API endpoint and you have a working chat. Use it
            as-is or as a reference for building your own composition.
          </p>
          <code style={styles.code}>
{`<ChatFull
  api="/api/chat"
  header={<h2>Support</h2>}
  placeholder="Ask a question..."
/>`}
          </code>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Transport</h2>
        <p style={styles.p}>
          The default transport streams plain text over a standard fetch
          response. For OpenAI-compatible APIs, use{" "}
          <span style={styles.inlineCode}>transport-openai</span>,
          which parses SSE event streams. You can also write a custom
          transport — any object with a{" "}
          <span style={styles.inlineCode}>
            send(messages, signal): AsyncIterable&lt;string&gt;
          </span>{" "}
          method works.
        </p>
        <code style={styles.code}>
{`import { openaiTransport } from "@/lib/transport-openai"

<ChatBox transport={openaiTransport({
  apiKey: "...",
  model: "gpt-4o",
})}>
  ...
</ChatBox>`}
        </code>
      </section>

      <nav style={styles.nav}>
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

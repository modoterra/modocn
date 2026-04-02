import { Link } from "react-router"
import type { CSSProperties } from "react"

const COMPONENTS = [
  {
    name: "ChatBox",
    registry: "chat-box",
    description:
      "Context provider and state machine for chat. Manages messages, input, streaming lifecycle, and error handling.",
    props: [
      { name: "api", type: "string", description: "API endpoint for the default text transport." },
      { name: "transport", type: "ChatTransport", description: "Custom transport implementation. Takes priority over api." },
      { name: "initialMessages", type: "Message[]", description: "Pre-populate the conversation." },
      { name: "onStart", type: "() => void", description: "Called when streaming begins." },
      { name: "onFinish", type: "(message: Message) => void", description: "Called when streaming completes." },
      { name: "onError", type: "(error: Error) => void", description: "Called on transport error." },
      { name: "children", type: "ReactNode | (chat: ChatHandler) => ReactNode", description: "Content or render prop." },
    ],
  },
  {
    name: "ChatInput",
    registry: "chat-input",
    description:
      "Auto-sizing textarea with pretext-powered measurement. Grows with content, clamps to min/max height, and provides keyboard handling.",
    props: [
      { name: "font", type: "string", description: "CSS font shorthand for measurement." },
      { name: "maxWidth", type: "number", description: "Max width for line wrapping in px." },
      { name: "lineHeight", type: "number", description: "Line height in px." },
      { name: "minHeight", type: "number", description: "Minimum textarea height in px." },
      { name: "maxHeight", type: "number", description: "Maximum textarea height in px." },
      { name: "children", type: "(props: ChatInputRenderProps) => ReactNode", description: "Render prop." },
    ],
  },
  {
    name: "ChatMessages",
    registry: "chat-messages",
    description:
      "Virtualized message list with scroll management. Only renders messages visible in the viewport. Supports pretext and DOM-based measurement modes.",
    props: [
      { name: "font", type: "string", description: "Font for pretext measurement." },
      { name: "maxWidth", type: "number", description: "Max text width in px." },
      { name: "lineHeight", type: "number", description: "Line height for measurement." },
      { name: "gap", type: "number", description: "Gap between messages in px. Default 12." },
      { name: "overscan", type: "number", description: "Extra messages rendered outside viewport. Default 3." },
      { name: "renderContent", type: "(message: Message) => ReactNode", description: "Enables DOM-based measurement for rich content." },
      { name: "children", type: "(props: ChatMessagesRenderProps) => ReactNode", description: "Render prop." },
    ],
  },
  {
    name: "ChatMessage",
    registry: "chat-message",
    description:
      "Per-message component with balanced text and copy-to-clipboard. Finds the tightest container width that preserves line count.",
    props: [
      { name: "message", type: "Message", description: "The message to render." },
      { name: "font", type: "string", description: "Font for balanced-text measurement." },
      { name: "maxWidth", type: "number", description: "Max width for measurement." },
      { name: "lineHeight", type: "number", description: "Line height for measurement." },
      { name: "copyResetMs", type: "number", description: "Time before copied resets to false. Default 2000." },
      { name: "children", type: "ReactNode | (ctx: ChatMessageContext) => ReactNode", description: "Content or render prop." },
    ],
  },
  {
    name: "StreamingText",
    registry: "streaming-text",
    description:
      'Animated streaming text with word-level motion. Ships with five presets: fade-blur, fade, slide-up, scale, and none.',
    props: [
      { name: "content", type: "string", description: "Accumulated streaming text." },
      { name: "preset", type: "StreamingTextPreset", description: 'Named animation preset. Default "fade-blur".' },
      { name: "animation", type: "AnimationConfig", description: "Custom animation config. Overrides preset." },
      { name: "tokenPattern", type: "RegExp", description: "Regex for splitting content into tokens." },
    ],
  },
  {
    name: "ChatFull",
    registry: "chat-full",
    description:
      "Complete styled chat interface. Composes all the primitives into a working chat with streaming, virtualization, and auto-sizing input.",
    props: [
      { name: "api", type: "string", description: "API endpoint." },
      { name: "transport", type: "ChatTransport", description: "Custom transport." },
      { name: "header", type: "ReactNode", description: "Optional header element." },
      { name: "placeholder", type: "string", description: "Empty-state message." },
    ],
  },
  {
    name: "openaiTransport",
    registry: "transport-openai",
    description:
      "Transport adapter for OpenAI-compatible SSE APIs. Works with OpenAI, Azure OpenAI, Groq, Together, and any compatible endpoint.",
    props: [
      { name: "apiKey", type: "string", description: "API key." },
      { name: "model", type: "string", description: 'Model ID. Default "gpt-4o".' },
      { name: "baseUrl", type: "string", description: "Base URL for the API." },
      { name: "fetch", type: "typeof fetch", description: "Custom fetch implementation." },
    ],
  },
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
  component: {
    marginTop: "3rem",
    paddingTop: "2rem",
    borderTop: "1px solid var(--border)",
  },
  componentName: {
    fontSize: "1.125rem",
    fontWeight: 600,
    margin: 0,
  },
  registryName: {
    fontSize: "0.75rem",
    color: "var(--muted-foreground)",
    marginTop: "0.25rem",
    letterSpacing: "0.02em",
  },
  componentDesc: {
    fontSize: "0.9375rem",
    lineHeight: 1.7,
    color: "var(--muted-foreground)",
    marginTop: "0.75rem",
    maxWidth: "42rem",
  },
  installCode: {
    display: "block",
    marginTop: "0.75rem",
    padding: "0.75rem 1rem",
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: "0.8125rem",
    lineHeight: 1.6,
    overflowX: "auto" as const,
    whiteSpace: "pre" as const,
  },
  propsLabel: {
    fontSize: "0.75rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "var(--muted-foreground)",
    marginTop: "1.5rem",
    marginBottom: "0.5rem",
  },
  propsTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "0.8125rem",
  },
  th: {
    textAlign: "left" as const,
    fontWeight: 500,
    padding: "0.5rem 1rem 0.5rem 0",
    borderBottom: "1px solid var(--border)",
    color: "var(--muted-foreground)",
    fontSize: "0.75rem",
    letterSpacing: "0.04em",
  },
  td: {
    padding: "0.375rem 1rem 0.375rem 0",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "top" as const,
    lineHeight: 1.5,
  },
  tdCode: {
    fontFamily: "inherit",
    fontSize: "0.8125rem",
    whiteSpace: "nowrap" as const,
  },
  tdType: {
    color: "var(--muted-foreground)",
    fontSize: "0.75rem",
  },
  tdDesc: {
    color: "var(--muted-foreground)",
    fontSize: "0.8125rem",
  },
  nav: {
    marginTop: "3rem",
    paddingTop: "2rem",
    borderTop: "1px solid var(--border)",
    fontSize: "1rem",
  },
}

export function ComponentsPage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Components</h1>
      <p style={styles.intro}>
        Every component in the modocn registry. Install individually or
        use{" "}
        <Link to="/docs/getting-started">the CLI</Link> to pull in what
        you need.
      </p>

      {COMPONENTS.map((c) => (
        <section key={c.name} style={styles.component}>
          <h2 style={styles.componentName}>{c.name}</h2>
          <p style={styles.registryName}>
            registry: {c.registry}
          </p>
          <p style={styles.componentDesc}>{c.description}</p>
          <code style={styles.installCode}>
            npx shadcn@latest add {c.registry} -r https://modocn.mdtrr.com
          </code>

          <p style={styles.propsLabel}>Props / Options</p>
          <table style={styles.propsTable}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              {c.props.map((p) => (
                <tr key={p.name}>
                  <td style={{ ...styles.td, ...styles.tdCode }}>{p.name}</td>
                  <td style={{ ...styles.td, ...styles.tdType }}>{p.type}</td>
                  <td style={{ ...styles.td, ...styles.tdDesc }}>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <nav style={styles.nav}>
        <Link to="/docs/conversational-ui">
          &larr; Conversational UI
        </Link>
      </nav>
    </div>
  )
}

import type { CSSProperties } from "react"
import { Link } from "react-router"

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
    marginBottom: "1rem",
  },
  code: {
    display: "block",
    padding: "1rem",
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: "0.875rem",
    lineHeight: 1.7,
    overflowX: "auto" as const,
    whiteSpace: "pre" as const,
  },
  p: {
    fontSize: "0.9375rem",
    lineHeight: 1.7,
    color: "var(--muted-foreground)",
    marginTop: "0.75rem",
    maxWidth: "42rem",
  },
  inlineCode: {
    padding: "0.125rem 0.375rem",
    background: "var(--card)",
    border: "1px solid var(--border)",
    fontSize: "0.8125rem",
  },
  stepList: {
    marginTop: "0.75rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  stepLabel: {
    fontSize: "0.75rem",
    color: "var(--muted-foreground)",
    letterSpacing: "0.04em",
    marginBottom: "0.5rem",
  },
  nav: {
    marginTop: "3rem",
    paddingTop: "2rem",
    borderTop: "1px solid var(--border)",
    fontSize: "1rem",
  },
}

export function GettingStartedPage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Getting Started</h1>
      <p style={styles.intro}>
        modocn components are installed via the shadcn CLI. Point it at our
        registry and add any component to your project.
      </p>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Prerequisites</h2>
        <p style={styles.p}>
          A React project with{" "}
          <span style={styles.inlineCode}>tailwindcss</span> and{" "}
          <span style={styles.inlineCode}>shadcn/ui</span> initialized.
          If you haven&apos;t set up shadcn yet:
        </p>
        <div style={{ marginTop: "0.75rem" }}>
          <code style={styles.code}>npx shadcn@latest init</code>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Install a component</h2>
        <div style={styles.stepList}>
          <div>
            <p style={styles.stepLabel}>Add from the modocn registry</p>
            <code style={styles.code}>
              npx shadcn@latest add chat-full -r https://modocn.mdtrr.com
            </code>
          </div>
          <div>
            <p style={styles.stepLabel}>Or add individual primitives</p>
            <code style={styles.code}>
{`npx shadcn@latest add chat-box -r https://modocn.mdtrr.com
npx shadcn@latest add chat-input -r https://modocn.mdtrr.com
npx shadcn@latest add chat-messages -r https://modocn.mdtrr.com
npx shadcn@latest add streaming-text -r https://modocn.mdtrr.com`}
            </code>
          </div>
        </div>
        <p style={styles.p}>
          The CLI resolves dependencies automatically.{" "}
          <span style={styles.inlineCode}>chat-full</span> pulls in all
          the conversational UI primitives. Installing individual components
          lets you pick only what you need.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Basic usage</h2>
        <code style={styles.code}>
{`import { ChatFull } from "@/components/chat-full"

export function App() {
  return (
    <ChatFull api="/api/chat" />
  )
}`}
        </code>
        <p style={styles.p}>
          That gives you a complete chat interface with streaming, auto-sizing
          input, virtualized messages, and scroll management. Every component
          can be styled and composed however you need.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Available components</h2>
        <p style={styles.p}>
          See the full list on the{" "}
          <Link to="/docs/components">Components</Link> page, or read about
          the system design on the{" "}
          <Link to="/docs/conversational-ui">Conversational UI</Link> page.
        </p>
      </section>

      <nav style={styles.nav}>
        <Link to="/docs/conversational-ui">
          Conversational UI &rarr;
        </Link>
      </nav>
    </div>
  )
}

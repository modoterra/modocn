import { Link } from "react-router"
import type { CSSProperties } from "react"

const COMPONENTS = [
  { title: "ChatBox", description: "Chat state, transport, and context provider." },
  { title: "ChatInput", description: "Auto-sizing textarea with keyboard handling." },
  { title: "ChatMessage", description: "Per-message rendering with balanced text and copy." },
  { title: "ChatMessages", description: "Virtualized message list with scroll management." },
  { title: "StreamingText", description: "Word-level streaming animation with presets." },
  { title: "ChatFull", description: "Complete styled chat interface, ready to use." },
]

const styles: Record<string, CSSProperties> = {
  hero: {
    padding: "4rem 0 2rem",
  },
  title: {
    fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.03em",
    margin: 0,
  },
  meta: {
    display: "flex",
    alignItems: "baseline",
    flexWrap: "wrap" as const,
    gap: "0.5rem 1.5rem",
    marginTop: "1.25rem",
  },
  version: {
    fontSize: "0.875rem",
    color: "var(--muted-foreground)",
    letterSpacing: "0.04em",
  },
  tagline: {
    fontSize: "0.9375rem",
    color: "var(--muted-foreground)",
    letterSpacing: "0.02em",
  },
  spotlight: {
    padding: "3rem 0 2.5rem",
  },
  spotlightTitle: {
    fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
    fontWeight: 600,
    lineHeight: 1.2,
    margin: 0,
  },
  spotlightDesc: {
    marginTop: "1.25rem",
    fontSize: "1.125rem",
    lineHeight: 1.7,
    color: "var(--muted-foreground)",
    maxWidth: "44rem",
  },
  install: {
    marginTop: "2rem",
  },
  installLabel: {
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "var(--muted-foreground)",
    marginBottom: "0.5rem",
  },
  installCode: {
    display: "block",
    padding: "1rem",
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    overflowX: "auto" as const,
    whiteSpace: "pre" as const,
  },
  componentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(16rem, 100%), 1fr))",
    gap: "1rem",
    marginTop: "2.5rem",
  },
  componentItem: {
    padding: "1rem",
    border: "1px solid var(--border)",
  },
  componentName: {
    fontSize: "0.9375rem",
    fontWeight: 500,
    color: "var(--foreground)",
  },
  componentDesc: {
    fontSize: "0.8125rem",
    color: "var(--muted-foreground)",
    marginTop: "0.25rem",
    lineHeight: 1.5,
  },
  moreLink: {
    display: "inline-block",
    marginTop: "2rem",
    fontSize: "1rem",
  },
  navSection: {
    padding: "2.5rem 0",
  },
  navList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  navTitle: {
    fontSize: "1.125rem",
    fontWeight: 500,
  },
  navDesc: {
    fontSize: "0.9375rem",
    color: "var(--muted-foreground)",
    marginTop: "0.25rem",
    lineHeight: 1.6,
  },
}

export function HomePage() {
  return (
    <>
      <section style={styles.hero}>
        <h1 style={styles.title}>modocn</h1>
        <div style={styles.meta}>
          <span style={styles.version}>v0.0.1</span>
          <span style={styles.tagline}>
            shadcn/ui-compatible component registry
          </span>
        </div>
      </section>

      <hr />

      <section style={styles.spotlight}>
        <h2 style={styles.spotlightTitle}>
          Conversational UI for React
        </h2>
        <p style={styles.spotlightDesc}>
          Chat interfaces, streaming text, virtualized message lists, and
          auto-sizing input. Composable components that are easy to style
          and adapt to your application. Install from the registry and
          start building.
        </p>
        <div style={styles.install}>
          <p style={styles.installLabel}>Quick start</p>
          <code style={styles.installCode}>
            npx shadcn@latest add chat-full -r https://modocn.mdtrr.com
          </code>
        </div>
        <div style={styles.componentGrid}>
          {COMPONENTS.map((c) => (
            <div key={c.title} style={styles.componentItem}>
              <span style={styles.componentName}>{c.title}</span>
              <p style={styles.componentDesc}>{c.description}</p>
            </div>
          ))}
        </div>
        <Link to="/docs/conversational-ui" style={styles.moreLink}>
          Read the guide &rarr;
        </Link>
      </section>

      <hr />

      <section style={styles.navSection}>
        <div style={styles.navList}>
          <div>
            <Link to="/docs/getting-started" style={styles.navTitle}>
              Getting Started
            </Link>
            <p style={styles.navDesc}>
              Install and configure components in your project.
            </p>
          </div>
          <div>
            <Link to="/docs/components" style={styles.navTitle}>
              Components
            </Link>
            <p style={styles.navDesc}>
              Full API reference for every registry component.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

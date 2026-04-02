import { Link } from "react-router"
import { ChatCompositionDemo } from "@/src/demos/chat-composition-demo"
import { StreamingPresetsDemo } from "@/src/demos/streaming-presets-demo"
import { VirtualizationDemo } from "@/src/demos/virtualization-demo"
import { Playground } from "@/src/components/playground"
import type { CSSProperties } from "react"

import chatCompositionSource from "@/src/demos/chat-composition-demo.tsx?raw"
import streamingPresetsSource from "@/src/demos/streaming-presets-demo.tsx?raw"
import virtualizationSource from "@/src/demos/virtualization-demo.tsx?raw"

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
    marginBottom: "0.5rem",
  },
  sectionDesc: {
    fontSize: "0.9375rem",
    lineHeight: 1.7,
    color: "var(--muted-foreground)",
    maxWidth: "42rem",
    marginBottom: "1.5rem",
  },
  nav: {
    marginTop: "3rem",
    paddingTop: "2rem",
    borderTop: "1px solid var(--border)",
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "space-between",
    gap: "0.5rem",
    fontSize: "1rem",
  },
}

export function DemosPage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Demos</h1>
      <p style={styles.intro}>
        Live demonstrations of the modocn registry components. All demos
        use mock streaming — no API key required.
      </p>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Chat Composition</h2>
        <p style={styles.sectionDesc}>
          Streaming chat with markdown rendering, virtualized messages,
          and copy support. Type a message to see it in action.
        </p>
        <Playground code={chatCompositionSource}>
          <ChatCompositionDemo />
        </Playground>
      </section>

      <hr style={{ marginTop: "3rem" }} />

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Streaming Text Presets</h2>
        <p style={styles.sectionDesc}>
          Five animation presets for word-level streaming text. Each card
          loops the same text with a different animation.
        </p>
        <Playground code={streamingPresetsSource}>
          <StreamingPresetsDemo />
        </Playground>
      </section>

      <hr style={{ marginTop: "3rem" }} />

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Virtualization</h2>
        <p style={styles.sectionDesc}>
          500 pre-loaded messages with markdown content. Scroll the
          conversation and watch the virtualization log — only a handful
          of messages are in the DOM at any time.
        </p>
        <Playground code={virtualizationSource}>
          <VirtualizationDemo />
        </Playground>
      </section>

      <nav style={styles.nav}>
        <Link to="/docs/components">
          &larr; Components
        </Link>
        <Link to="/">
          Home &rarr;
        </Link>
      </nav>
    </div>
  )
}

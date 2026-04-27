import { Link } from "react-router"
import { ChatCompositionDemo } from "@/src/demos/chat-composition-demo"
import { StreamingPresetsDemo } from "@/src/demos/streaming-presets-demo"
import { VirtualizationDemo } from "@/src/demos/virtualization-demo"
import { Playground } from "@/src/components/playground"
import { Separator } from "@/components/ui/separator"

import chatCompositionSource from "@/src/demos/chat-composition-demo.tsx?raw"
import streamingPresetsSource from "@/src/demos/streaming-presets-demo.tsx?raw"
import virtualizationSource from "@/src/demos/virtualization-demo.tsx?raw"

export function DemosPage() {
  return (
    <div>
      <h1 className="m-0">Demos</h1>
      <p className="mt-14 max-w-[48rem]">
        Live demonstrations of the modocn registry components. All demos
        use mock streaming — no API key required.
      </p>

      <section className="mt-28">
        <h2 className="mb-12">Chat Composition</h2>
        <p className="mb-14 max-w-[48rem]">
          Streaming chat with markdown rendering, virtualized messages,
          and copy support. Type a message to see it in action.
        </p>
        <Playground code={chatCompositionSource}>
          <ChatCompositionDemo />
        </Playground>
      </section>

      <Separator className="my-28" />

      <section>
        <h2 className="mb-12">Streaming Text Presets</h2>
        <p className="mb-14 max-w-[48rem]">
          Five animation presets for word-level streaming text. Each card
          loops the same text with a different animation.
        </p>
        <Playground code={streamingPresetsSource}>
          <StreamingPresetsDemo />
        </Playground>
      </section>

      <Separator className="my-28" />

      <section>
        <h2 className="mb-12">Virtualization</h2>
        <p className="mb-14 max-w-[48rem]">
          500 pre-loaded messages with markdown content. Scroll the
          conversation and watch the virtualization log — only a handful
          of messages are in the DOM at any time.
        </p>
        <Playground code={virtualizationSource}>
          <VirtualizationDemo />
        </Playground>
      </section>

      <Separator className="mt-32" />

      <nav className="flex flex-wrap justify-between gap-4 py-16">
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

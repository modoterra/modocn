import {
  StreamingText,
  STREAMING_TEXT_PRESETS,
} from "@/registry/default/streaming-text/components/streaming-text"
import type { StreamingTextPreset } from "@/registry/default/streaming-text/lib/presets"
import { layout, prepare } from "@chenglou/pretext"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"

const SAMPLE_TEXT =
  "Pretext measures text using canvas as ground truth, so we can know the exact height of any text block before it hits the DOM."

const PRESET_DESCRIPTIONS: Record<StreamingTextPreset, string> = {
  "fade-blur": "Opacity fades in while blur dissolves",
  fade: "Clean opacity transition",
  "slide-up": "Slides up from below with a fade",
  scale: "Scales up from 85% with a fade",
  none: "Instant render, no animation",
}

const PRESETS = Object.keys(STREAMING_TEXT_PRESETS) as StreamingTextPreset[]

const styles: Record<string, CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(16rem, 100%), 1fr))",
    gap: "1rem",
  },
  card: {
    border: "1px solid var(--border)",
    padding: "1.25rem",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "var(--foreground)",
    margin: 0,
  },
  desc: {
    fontSize: "0.75rem",
    color: "var(--muted-foreground)",
    marginTop: "0.25rem",
    lineHeight: 1.5,
  },
  textArea: {
    marginTop: "1rem",
    fontSize: "0.875rem",
    lineHeight: 1.7,
    color: "var(--foreground)",
    whiteSpace: "pre-wrap" as const,
  },
}

export function StreamingPresetsDemo() {
  return (
    <div style={styles.grid}>
      {PRESETS.map((preset, i) => (
        <PresetCard key={preset} preset={preset} staggerMs={i * 400} />
      ))}
    </div>
  )
}

function PresetCard({
  preset,
  staggerMs,
}: {
  preset: StreamingTextPreset
  staggerMs: number
}) {
  const content = useStreamingLoop(SAMPLE_TEXT, 40, 2500, staggerMs)
  const containerRef = useRef<HTMLDivElement>(null)
  const textHeight = useTextHeight(SAMPLE_TEXT, containerRef)

  return (
    <div style={styles.card}>
      <p style={styles.label}>{preset}</p>
      <p style={styles.desc}>{PRESET_DESCRIPTIONS[preset]}</p>
      <div
        ref={containerRef}
        style={{
          ...styles.textArea,
          ...(textHeight ? { height: textHeight } : {}),
        }}
      >
        <StreamingText content={content} preset={preset} />
      </div>
    </div>
  )
}

function useTextHeight(
  text: string,
  ref: React.RefObject<HTMLDivElement | null>,
) {
  const [height, setHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    function measure() {
      const el = ref.current
      if (!el) return
      const style = getComputedStyle(el)
      const font = style.font
      const lineHeight = parseFloat(style.lineHeight)
      const width = el.clientWidth
      if (!width) return

      const prepared = prepare(text, font, { whiteSpace: "pre-wrap" })
      const result = layout(prepared, width, lineHeight)
      setHeight(result.height)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text, ref])

  return height
}

function useStreamingLoop(
  text: string,
  tokenDelay: number,
  pauseMs: number,
  initialDelay: number,
) {
  const [visibleText, setVisibleText] = useState("")
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    const tokens = text.match(/\S+\s*|\s+/g) ?? []

    async function loop() {
      await sleep(initialDelay)

      while (!cancelledRef.current) {
        setVisibleText("")
        await sleep(200)

        let acc = ""
        for (const token of tokens) {
          if (cancelledRef.current) return
          acc += token
          setVisibleText(acc)
          await sleep(tokenDelay)
        }

        if (cancelledRef.current) return
        await sleep(pauseMs)
      }
    }

    loop()
    return () => {
      cancelledRef.current = true
    }
  }, [text, tokenDelay, pauseMs, initialDelay])

  return visibleText
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

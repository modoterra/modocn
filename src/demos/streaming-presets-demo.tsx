import {
  StreamingText,
  STREAMING_TEXT_PRESETS,
} from "@/registry/default/streaming-text/components/streaming-text"
import { Card } from "@/components/ui/card"
import type { StreamingTextPreset } from "@/registry/default/streaming-text/lib/presets"
import { layout, prepare } from "@chenglou/pretext"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

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

export function StreamingPresetsDemo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(16rem,100%),1fr))] gap-6">
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
      <Card className="p-6">
        <p className="text-xs font-semibold tracking-wide uppercase text-foreground m-0">{preset}</p>
        <p className="text-xs text-muted-foreground mt-2 leading-normal">{PRESET_DESCRIPTIONS[preset]}</p>
        <div
          ref={containerRef}
          className="mt-6 text-sm leading-relaxed text-foreground whitespace-pre-wrap"
          style={textHeight ? { height: textHeight } : undefined}
        >
          <StreamingText content={content} preset={preset} />
      </div>
    </Card>
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

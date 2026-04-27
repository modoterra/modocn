import { motion } from "motion/react"
import { useEffect, useRef } from "react"

import {
  STREAMING_TEXT_PRESETS,
  type AnimationConfig,
  type StreamingTextPreset,
} from "../lib/presets"

const DEFAULT_TOKEN_PATTERN = /\S+\s*|\s+/g

type StreamingTextProps = {
  /** The accumulated streaming text content. */
  content: string
  /**
   * Named animation preset.
   * @default "fade-blur"
   */
  preset?: StreamingTextPreset
  /**
   * Custom animation config — overrides `preset` when provided.
   * Set `initial` and `animate` for the motion values, and an optional `transition`.
   */
  animation?: AnimationConfig
  /**
   * Regex used to split content into tokens for animation.
   * Each match becomes one `<span>`. Defaults to word-level splitting.
   * @default /\S+\s*|\s+/g
   */
  tokenPattern?: RegExp
}

export function StreamingText({
  content,
  preset = "fade-blur",
  animation,
  tokenPattern = DEFAULT_TOKEN_PATTERN,
}: StreamingTextProps) {
  const prevCountRef = useRef(0)
  const tokens = content.match(tokenPattern) ?? []
  const prevCount = prevCountRef.current

  useEffect(() => {
    prevCountRef.current = tokens.length
  })

  const config = animation ?? STREAMING_TEXT_PRESETS[preset]

  if (!config) {
    return <>{content}</>
  }

  return (
    <>
      {tokens.map((token, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre-wrap"
          initial={i >= prevCount ? config.initial : false}
          animate={config.animate}
          transition={config.transition}
        >
          {token}
        </motion.span>
      ))}
    </>
  )
}

export { STREAMING_TEXT_PRESETS, type AnimationConfig, type StreamingTextPreset }

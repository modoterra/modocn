import type { Transition } from "motion/react"

export type AnimationConfig = {
  initial: Record<string, string | number>
  animate: Record<string, string | number>
  transition?: Transition
}

export const STREAMING_TEXT_PRESETS = {
  "fade-blur": {
    initial: { opacity: 0, filter: "blur(3px)", WebkitFilter: "blur(3px)" },
    animate: { opacity: 1, filter: "blur(0px)", WebkitFilter: "blur(0px)" },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  "slide-up": {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  scale: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  none: null,
} as const satisfies Record<string, AnimationConfig | null>

export type StreamingTextPreset = keyof typeof STREAMING_TEXT_PRESETS

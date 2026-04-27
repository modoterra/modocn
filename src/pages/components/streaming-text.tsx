import { ComponentPage } from "@/src/components/component-page"

export function StreamingTextPage() {
  return (
    <ComponentPage
      name="StreamingText"
      registry="streaming-text"
      description='Animated streaming text with word-level motion. Splits content into tokens and animates each as it appears. Ships with five presets: fade-blur, fade, slide-up, scale, and none. Accepts custom animation configs for full control. Independent of the chat components — usable anywhere you stream text.'
      features={[
        "Word-level animation with configurable token splitting",
        "Five built-in presets: fade-blur, fade, slide-up, scale, none",
        "Custom animation config for full control over initial/animate/transition",
        "Only newly-appeared tokens animate — existing tokens skip the entrance",
        "Powered by motion (Framer Motion) for performant animations",
        "Independent of chat components — works anywhere you have streaming text",
      ]}
      props={[
        { name: "content", type: "string", description: "The accumulated streaming text to display." },
        { name: "preset", type: "StreamingTextPreset", default: '"fade-blur"', description: "Named animation preset." },
        { name: "animation", type: "AnimationConfig", description: "Custom animation config. Overrides preset when provided." },
        { name: "tokenPattern", type: "RegExp", default: "/\\S+\\s*|\\s+/g", description: "Regex pattern for splitting content into tokens." },
      ]}
      exports={[
        { name: "StreamingText", kind: "component", description: "Animated streaming text component." },
        { name: "STREAMING_TEXT_PRESETS", kind: "constant", description: "Map of preset name to AnimationConfig. Keys: fade-blur, fade, slide-up, scale, none." },
        { name: "StreamingTextPreset", kind: "type", description: '"fade-blur" | "fade" | "slide-up" | "scale" | "none"' },
        { name: "AnimationConfig", kind: "type", description: "{ initial: Record<string, string | number>, animate: Record<string, string | number>, transition?: Transition }" },
      ]}
      examples={[
        {
          title: "Basic streaming text",
          description: "Display streaming text with the default fade-blur preset.",
          code: `const [text, setText] = useState("")

// Append text as it streams in
useEffect(() => {
  // ... your streaming logic
  setText((prev) => prev + chunk)
}, [chunk])

<StreamingText content={text} />`,
        },
        {
          title: "Different presets",
          description: "Choose from five built-in animation presets.",
          code: `<StreamingText content={text} preset="fade" />
<StreamingText content={text} preset="slide-up" />
<StreamingText content={text} preset="scale" />
<StreamingText content={text} preset="none" />`,
        },
        {
          title: "Custom animation",
          description: "Provide a custom animation config for full control.",
          code: `<StreamingText
  content={text}
  animation={{
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  }}
/>`,
        },
        {
          title: "Custom token splitting",
          description: "Split on characters instead of words for a typewriter effect.",
          code: `<StreamingText
  content={text}
  tokenPattern={/./g}
  preset="fade"
/>`,
        },
      ]}
      prev={{ label: "ChatMessages", href: "/docs/components/chat-messages" }}
      next={{ label: "ChatFull", href: "/docs/components/chat-full" }}
    />
  )
}

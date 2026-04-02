import { useCallback, type ReactNode } from "react"

import { useChatBox } from "@/registry/default/chat-box/components/chat-box"
import { useAutosize } from "@/registry/default/chat-box/hooks/use-autosize"

export type ChatInputRenderProps = {
  /** Current input text. */
  input: string
  /** Set the input text. */
  setInput: (value: string) => void
  /** Submit the current input. */
  submit: () => void
  /** Stop the current streaming response. */
  stop: () => void
  /** Whether the assistant is generating. */
  isLoading: boolean
  /** Computed textarea height in px (from pretext). */
  height: number
  /** Number of lines in the current input. */
  lineCount: number
  /** Keyboard handler: Enter to submit, Shift+Enter for newline. */
  onKeyDown: (e: React.KeyboardEvent) => void
}

export type ChatInputProps = {
  /** CSS font shorthand for measurement, e.g. `"16px Inter"`. */
  font: string
  /** Max width for line wrapping in px. Match your textarea's CSS width. */
  maxWidth: number
  /** Line height in px. Match your textarea's CSS line-height. */
  lineHeight: number
  /** Minimum textarea height in px. */
  minHeight?: number
  /** Maximum textarea height in px. Overflow scrolls beyond this. */
  maxHeight?: number
  /** Render prop receiving all input state and handlers. */
  children: (props: ChatInputRenderProps) => ReactNode
}

/**
 * Headless chat input component with pretext-powered auto-sizing.
 *
 * Must be used inside a `<ChatBox>` provider. Reads chat state
 * from context and provides everything needed to render a
 * textarea with auto-sizing, submit-on-enter, and stop control.
 *
 * @example
 * ```tsx
 * <ChatInput font="16px Inter" maxWidth={600} lineHeight={24} minHeight={48} maxHeight={200}>
 *   {({ input, setInput, height, onKeyDown, submit, stop, isLoading }) => (
 *     <div>
 *       <textarea
 *         value={input}
 *         onChange={e => setInput(e.target.value)}
 *         onKeyDown={onKeyDown}
 *         style={{ height }}
 *       />
 *       {isLoading ? (
 *         <button onClick={stop}>Stop</button>
 *       ) : (
 *         <button onClick={submit}>Send</button>
 *       )}
 *     </div>
 *   )}
 * </ChatInput>
 * ```
 */
export function ChatInput({
  font,
  maxWidth,
  lineHeight,
  minHeight,
  maxHeight,
  children,
}: ChatInputProps) {
  const { input, setInput, submit, stop, isLoading } = useChatBox()

  const { height, lineCount } = useAutosize({
    text: input,
    font,
    maxWidth,
    lineHeight,
    minHeight,
    maxHeight,
    whiteSpace: "pre-wrap",
  })

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault()
        submit()
      }
    },
    [submit]
  )

  return (
    <>
      {children({
        input,
        setInput,
        submit,
        stop,
        isLoading,
        height,
        lineCount,
        onKeyDown,
      })}
    </>
  )
}

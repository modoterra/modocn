import {
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react"

import { useChatBox } from "@/registry/default/chat-box/components/chat-box"
import {
  useMessageHeights,
  type MessageHeight,
} from "@/registry/default/chat-messages/hooks/use-message-heights"
import { useDOMHeights } from "@/registry/default/chat-messages/hooks/use-dom-heights"
import {
  useVirtualMessages,
  type VirtualMessage,
} from "@/registry/default/chat-messages/hooks/use-virtual-messages"
import {
  useChatScroll,
  type ChatScrollState,
} from "@/registry/default/chat-messages/hooks/use-chat-scroll"
import type { Message } from "@/registry/default/chat-box/lib/types"

export type ChatMessagesRenderProps = {
  /** The virtualized messages to render. */
  virtualMessages: VirtualMessage[]
  /** Total scrollable content height. */
  totalHeight: number
  /** All message heights. */
  heights: MessageHeight[]
  /** All messages from chat state. */
  messages: Message[]
  /** Whether loading. */
  isLoading: boolean
  /** Scroll state and controls. */
  scroll: ChatScrollState
  /** Viewport height from ResizeObserver. */
  viewportHeight: number
}

export type ChatMessagesProps = {
  /**
   * Font shorthand for pretext measurement.
   * Required when `renderContent` is not provided (plain-text mode).
   */
  font?: string
  /** Maximum text width in px. Also used as the measurement container width in DOM mode. */
  maxWidth: number
  /**
   * Line height for pretext measurement.
   * Required when `renderContent` is not provided (plain-text mode).
   */
  lineHeight?: number
  whiteSpace?: "normal" | "pre-wrap"
  /** Gap between messages in px. Default 12. */
  gap?: number
  /** Extra messages to render outside viewport. Default 3. */
  overscan?: number
  /** Extra height for padding/chrome added to each measured text height. Default 0. */
  paddingPerMessage?: number | ((message: Message) => number)
  /**
   * When provided, enables DOM-based height measurement instead of pretext.
   * The function receives a message and returns the React content to render
   * for height measurement. This is required for rich/markdown content where
   * pretext cannot predict the rendered height.
   */
  renderContent?: (message: Message) => ReactNode
  /** Extra cache key for render-affecting changes in DOM measurement mode. */
  measureKey?: string
  children: (props: ChatMessagesRenderProps) => ReactNode
}

export function ChatMessages({
  font,
  maxWidth,
  lineHeight,
  whiteSpace = "pre-wrap",
  gap = 12,
  overscan = 3,
  paddingPerMessage = 0,
  renderContent,
  measureKey,
  children,
}: ChatMessagesProps) {
  const { messages, isLoading } = useChatBox()
  const [viewportHeight, setViewportHeight] = useState(0)

  // DOM measurement mode: hidden container ref
  const measureRef = useRef<HTMLDivElement>(null)

  const domMeasureKey = useMemo(() => {
    if (!renderContent) return undefined
    return `${maxWidth}:${measureKey ?? ""}`
  }, [maxWidth, measureKey, renderContent])

  // --- Height measurement ---
  // Both hooks are always called (Rules of Hooks) but one operates
  // on an empty message list so it becomes a no-op.

  const pretextHeights = useMessageHeights({
    messages: renderContent ? [] : messages,
    font: font ?? "",
    maxWidth,
    lineHeight: lineHeight ?? 22,
    whiteSpace,
  })

  const domHeights = useDOMHeights({
    containerRef: measureRef,
    messages: renderContent ? messages : [],
    measureKey: domMeasureKey,
  })

  const rawHeights = renderContent ? domHeights : pretextHeights

  // Add per-message padding to heights
  const heights = useMemo(() => {
    if (!paddingPerMessage) return rawHeights

    return rawHeights.map((height, index) => {
      const extraHeight =
        typeof paddingPerMessage === "function"
          ? paddingPerMessage(messages[index])
          : paddingPerMessage

      return extraHeight
        ? {
            ...height,
            height: height.height + extraHeight,
          }
        : height
    })
  }, [messages, paddingPerMessage, rawHeights])

  const scrollTotalHeight = useMemo(
    () => computeTotalHeight(heights, gap),
    [heights, gap]
  )

  const scroll = useChatScroll({
    totalHeight: scrollTotalHeight,
  })

  const { virtualMessages, totalHeight } = useVirtualMessages({
    heights,
    scrollTop: scroll.scrollTop,
    viewportHeight,
    gap,
    overscan,
  })

  useEffect(() => {
    const el = scroll.containerRef.current
    if (!el) return

    setViewportHeight(el.clientHeight)

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height)
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [scroll.containerRef, messages.length])

  return (
    <>
      {renderContent && (
        <MeasurementContainer
          ref={measureRef}
          maxWidth={maxWidth}
          messages={messages}
          renderContent={renderContent}
        />
      )}
      {children({
        virtualMessages,
        totalHeight,
        heights,
        messages,
        isLoading,
        scroll,
        viewportHeight,
      })}
    </>
  )
}

type MeasurementContainerProps = {
  maxWidth: number
  messages: Message[]
  renderContent: (message: Message) => ReactNode
}

const MeasurementContainer = memo(
  forwardRef<HTMLDivElement, MeasurementContainerProps>(function MeasurementContainer(
    { maxWidth, messages, renderContent },
    ref
  ) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: maxWidth,
          height: 0,
          overflow: "hidden",
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id}>{renderContent(msg)}</div>
        ))}
      </div>
    )
  })
)

/**
 * Attach this to the scrollable container as a ref callback to
 * wire up both scroll tracking and viewport measurement.
 */
export function useChatMessagesContainerRef(
  scroll: ChatScrollState,
  onViewportResize: (height: number) => void
) {
  const observerRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    return () => observerRef.current?.disconnect()
  }, [])

  return useCallback(
    (el: HTMLDivElement | null) => {
      observerRef.current?.disconnect()
      scroll.containerRef.current = el

      if (!el) return

      onViewportResize(el.clientHeight)

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onViewportResize(entry.contentRect.height)
        }
      })

      observer.observe(el)
      observerRef.current = observer
    },
    [scroll.containerRef, onViewportResize]
  )
}

function computeTotalHeight(heights: MessageHeight[], gap: number): number {
  if (heights.length === 0) return 0
  let total = 0
  for (const h of heights) total += h.height
  total += gap * (heights.length - 1)
  return total
}

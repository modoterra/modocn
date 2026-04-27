import {
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react"

import { ChatBox, useChatBox } from "@/registry/default/chat-box/components/chat-box"
import { ChatInput } from "@/registry/default/chat-input/components/chat-input"
import { ChatMessage } from "@/registry/default/chat-message/components/chat-message"
import { useMessageHeights } from "@/registry/default/chat-messages/hooks/use-message-heights"
import { useVirtualMessages } from "@/registry/default/chat-messages/hooks/use-virtual-messages"
import { useChatScroll } from "@/registry/default/chat-messages/hooks/use-chat-scroll"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ChatOptions, Message } from "@/registry/default/chat-box/lib/types"

const FONT = '15px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
const LINE_HEIGHT = 22
const MAX_BUBBLE_WIDTH = 520
const GAP = 8
// User bubble:      padding (8+8) = 16
// Assistant bubble: padding (8+8) + roleLabel (~14) + actions (~24) + border (2) = 56
const USER_PADDING = 16
const ASSISTANT_PADDING = 56
// Horizontal chrome consumed by message row padding and bubble padding/border
const ROW_H_PAD = 32 // padding "0 16px" on each message row
const BUBBLE_H_CHROME = 30 // padding (14+14) + border (2) on assistant bubble

export type ChatFullProps = ChatOptions & {
  /** Optional header element. */
  header?: ReactNode
  /** Placeholder when no messages. */
  placeholder?: string
  /** Additional className for the outer card. */
  className?: string
}

export function ChatFull({
  header,
  placeholder = "Send a message to start the conversation.",
  className,
  ...chatOptions
}: ChatFullProps) {
  return (
    <ChatBox {...chatOptions}>
      <Card className={cn("overflow-hidden h-[560px] font-sans", className)}>
        {header && (
          <CardHeader className="px-4 py-3 border-b text-xs font-semibold text-muted-foreground tracking-wide">
            {header}
          </CardHeader>
        )}
        <CardContent className="flex-1 overflow-hidden p-0">
          <MessageArea placeholder={placeholder} />
        </CardContent>
        <CardFooter className="border-t p-0">
          <InputBar />
        </CardFooter>
      </Card>
    </ChatBox>
  )
}

function MessageArea({ placeholder }: { placeholder: string }) {
  const { messages } = useChatBox()
  const [viewportHeight, setViewportHeight] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  const effectiveMaxWidth = containerWidth > 0
    ? Math.min(containerWidth - ROW_H_PAD - BUBBLE_H_CHROME, MAX_BUBBLE_WIDTH)
    : MAX_BUBBLE_WIDTH

  const rawHeights = useMessageHeights({
    messages,
    font: FONT,
    maxWidth: effectiveMaxWidth,
    lineHeight: LINE_HEIGHT,
  })

  const heights = rawHeights.map((h, i) => ({
    ...h,
    height:
      h.height +
      (messages[i].role === "user" ? USER_PADDING : ASSISTANT_PADDING),
  }))

  const totalContentHeight = heights.reduce(
    (sum, h, i) => sum + h.height + (i > 0 ? GAP : 0),
    0
  )

  const scroll = useChatScroll({ totalHeight: totalContentHeight })

  const { virtualMessages, totalHeight } = useVirtualMessages({
    heights,
    scrollTop: scroll.scrollTop,
    viewportHeight,
    gap: GAP,
    overscan: 5,
  })

  const containerRefCallback = useCallback(
    (el: HTMLDivElement | null) => {
      scroll.containerRef.current = el
      if (el) {
        setViewportHeight(el.clientHeight)
        setContainerWidth(el.clientWidth)
      }
    },
    [scroll.containerRef]
  )

  useEffect(() => {
    const el = scroll.containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height)
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [scroll.containerRef])

  return (
    <div
      ref={containerRefCallback}
      onScroll={scroll.onScroll}
      className="flex-1 overflow-y-auto relative h-full"
    >
      {messages.length === 0 ? (
        <div className="text-muted-foreground text-center px-8 py-20 text-sm leading-relaxed">
          {placeholder}
        </div>
      ) : (
        <div className="relative" style={{ height: totalHeight }}>
          {virtualMessages.map((vm) => {
            const msg = messages[vm.index]
            return (
              <div
                key={vm.id}
                className={cn(
                  "absolute left-0 right-0 flex px-4",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
                style={{ top: vm.offsetTop }}
              >
                <MessageBubble message={msg} maxWidth={effectiveMaxWidth} />
              </div>
            )
          })}
        </div>
      )}

      {!scroll.isAtBottom && messages.length > 0 && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll.scrollToBottom()}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full z-10"
        >
          &darr;
        </Button>
      )}
    </div>
  )
}

function MessageBubble({ message, maxWidth }: { message: Message; maxWidth: number }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="rounded-lg px-3.5 py-2 max-w-[85%] text-[15px] leading-[22px] bg-primary text-primary-foreground">
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    )
  }

  return (
    <ChatMessage
      message={message}
      font={FONT}
      maxWidth={maxWidth}
      lineHeight={LINE_HEIGHT}
    >
      {({ width, copied, copy }) => (
        <div
          className="rounded-lg px-3.5 py-2 max-w-[85%] text-[15px] leading-[22px] bg-card border text-card-foreground"
          style={{
            width: width > 0 ? width + 28 : undefined,
            maxWidth: `min(${MAX_BUBBLE_WIDTH + 28}px, 100%)`,
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
            Assistant
          </div>
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
          <div className="mt-1 flex gap-2">
            <button
              onClick={copy}
              className={cn(
                "bg-transparent border-none text-[10px] cursor-pointer p-0 uppercase tracking-wide font-semibold",
                copied ? "text-green-400" : "text-muted-foreground",
              )}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </ChatMessage>
  )
}

function InputBar() {
  const { input } = useChatBox()

  return (
    <ChatInput
      font={FONT}
      maxWidth={640}
      lineHeight={LINE_HEIGHT}
      minHeight={44}
      maxHeight={150}
    >
      {({ setInput, submit, stop, isLoading, height, onKeyDown }) => (
        <div className="flex gap-2 items-end p-3 w-full">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message..."
            disabled={isLoading}
            className="flex-1 min-h-0 resize-none text-[15px] leading-[22px] font-sans"
            style={{
              height,
              overflowY: height >= 150 ? "auto" : "hidden",
            }}
          />
          <Button
            onClick={isLoading ? stop : submit}
            disabled={!isLoading && !input.trim()}
            variant={isLoading ? "destructive" : "default"}
          >
            {isLoading ? "Stop" : "Send"}
          </Button>
        </div>
      )}
    </ChatInput>
  )
}

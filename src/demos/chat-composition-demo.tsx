import {
  ChatBox,
  useChatBox,
} from "@/registry/default/chat-box/components/chat-box"
import { ChatInput } from "@/registry/default/chat-input/components/chat-input"
import { ChatMessage } from "@/registry/default/chat-message/components/chat-message"
import { MarkdownContent } from "@/registry/default/chat-message/components/markdown-content"
import { ChatMessages } from "@/registry/default/chat-messages/components/chat-messages"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createMockStreamFetch } from "../lib/mock-stream"

import type { Message } from "@/registry/default/chat-box/lib/types"

const mockFetch = createMockStreamFetch({ tokenDelay: 20 })

const MAX_MESSAGE_WIDTH = 520
const ASSISTANT_BUBBLE_WIDTH = MAX_MESSAGE_WIDTH + 34
const BUBBLE_H_CHROME = 34
const CONVERSATION_H_PAD = 32
const MESSAGE_GAP = 16
const USER_CHROME_HEIGHT = 46
const ASSISTANT_CHROME_HEIGHT = 82

const COMPOSER_FONT =
  '15px "JetBrains Mono", "Fira Code", "SF Mono", monospace'
const COMPOSER_LINE_HEIGHT = 22

export function ChatCompositionDemo() {
  return (
    <ChatBox api="/api/chat" fetch={mockFetch}>
      <Card className="min-w-0 max-w-full overflow-x-hidden">
        <ShellHeader />
        <CardContent className="p-0">
          <Conversation />
        </CardContent>
        <CardFooter className="flex-col items-stretch p-0">
          <Composer />
          <div className="px-4 pb-4 text-[0.625rem] text-muted-foreground tracking-wide">
            Press Enter to send, Shift + Enter for a new line
          </div>
        </CardFooter>
      </Card>
    </ChatBox>
  )
}

function ShellHeader() {
  const { messages, isLoading } = useChatBox()
  const assistantCount = messages.filter(
    (m) => m.role === "assistant",
  ).length

  return (
    <CardHeader className="flex-row items-baseline justify-between gap-3 px-5 py-5 border-b text-xs max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3">
      <span className="font-semibold tracking-wide uppercase">Chat Composition</span>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground max-[480px]:hidden">
        <span>messages: {messages.length}</span>
        <span>assistant: {assistantCount}</span>
        <span>status: {isLoading ? "streaming" : "idle"}</span>
      </div>
    </CardHeader>
  )
}

function Conversation() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const update = () => setContainerWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const effectiveMaxWidth = containerWidth > 0
    ? Math.min(
        containerWidth - CONVERSATION_H_PAD - BUBBLE_H_CHROME,
        MAX_MESSAGE_WIDTH,
      )
    : MAX_MESSAGE_WIDTH

  const renderContent = useCallback((message: Message) => {
    if (message.role === "user") {
      return <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</div>
    }
    return (
      <MarkdownContent
        content={message.content}
        className="text-[14px] leading-[1.65]"
      />
    )
  }, [])

  const paddingPerMessage = useCallback(
    (message: Message) =>
      message.role === "assistant"
        ? ASSISTANT_CHROME_HEIGHT
        : USER_CHROME_HEIGHT,
    [],
  )

  const measureKey = useMemo(() => "chat-composition", [])

  return (
    <div ref={wrapperRef}>
      <ChatMessages
        maxWidth={effectiveMaxWidth}
        gap={MESSAGE_GAP}
        overscan={5}
        paddingPerMessage={paddingPerMessage}
        renderContent={renderContent}
        measureKey={measureKey}
      >
        {({ messages, virtualMessages, totalHeight, scroll }) => (
          <div className="relative">
              <div
                ref={scroll.containerRef}
                onScroll={scroll.onScroll}
                className="relative h-[420px] overflow-y-auto p-5"
              >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-xl font-semibold">Start a conversation</div>
                  <p className="mt-2 text-[0.8125rem] text-muted-foreground max-w-[20rem] leading-relaxed">
                    Type a message below to see streaming responses,
                    virtualized layout, and auto-scrolling.
                  </p>
                </div>
              ) : (
                <div className="relative" style={{ height: totalHeight }}>
                  {virtualMessages.map((vm) => {
                    const message = messages[vm.index]
                    const isUser = message.role === "user"

                    return (
                      <div
                        key={vm.id}
                        className={`absolute left-0 right-0 flex ${isUser ? "justify-end" : "justify-start"}`}
                        style={{ top: vm.offsetTop }}
                      >
                        {isUser ? (
                          <UserBubble content={message.content} />
                        ) : (
                          <AssistantBubble message={message} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {!scroll.isAtBottom && messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scroll.scrollToBottom()}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs"
                >
                  Jump to latest
                </Button>
              )}
            </div>
          </div>
        )}
      </ChatMessages>
    </div>
  )
}

function UserBubble({ content }: { content: string }) {
  return (
    <div
      className="border border-border bg-card px-4 py-3.5"
      style={{ maxWidth: `min(${ASSISTANT_BUBBLE_WIDTH}px, 100%)` }}
    >
      <div className="text-[0.625rem] font-semibold tracking-widest uppercase text-muted-foreground mb-2">You</div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</div>
    </div>
  )
}

function AssistantBubble({ message }: { message: Message }) {
  return (
    <ChatMessage message={message}>
      {({ copied, copy }) => (
        <div
          className="border border-border px-4 py-3.5"
          style={{ maxWidth: `min(${ASSISTANT_BUBBLE_WIDTH}px, 100%)` }}
        >
          <div className="text-[0.625rem] font-semibold tracking-widest uppercase text-muted-foreground mb-2">Assistant</div>
          <MarkdownContent
            content={message.content}
            className="text-[14px] leading-[1.65]"
          />
          <div className="flex justify-end mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={copy}
              className="text-[0.625rem] font-semibold tracking-widest uppercase text-muted-foreground p-0 h-auto"
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}
    </ChatMessage>
  )
}

function Composer() {
  return (
    <ChatInput
      font={COMPOSER_FONT}
      maxWidth={640}
      lineHeight={COMPOSER_LINE_HEIGHT}
      minHeight={42}
      maxHeight={150}
    >
      {({ input, setInput, submit, stop, isLoading, height, onKeyDown }) => (
        <div className="flex gap-3 p-5 border-t border-border">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about pretext, streaming, virtualization..."
            disabled={isLoading}
            className="flex-1 resize-none text-sm leading-[22px] min-h-0"
            style={{
              height,
              overflowY: height >= 150 ? "auto" : "hidden",
            }}
          />
          {isLoading ? (
            <Button variant="destructive" onClick={stop} className="self-end h-[44px]">
              Stop
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={!input.trim()}
              className="self-end h-[44px]"
            >
              Send
            </Button>
          )}
        </div>
      )}
    </ChatInput>
  )
}

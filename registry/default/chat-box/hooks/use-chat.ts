import { useCallback, useMemo, useRef, useState } from "react"

import {
  textTransport,
  type ChatTransport,
} from "@/registry/default/chat-box/lib/transport"
import type {
  ChatActions,
  ChatHandler,
  ChatOptions,
  ChatState,
  Message,
} from "@/registry/default/chat-box/lib/types"

/**
 * React hook for managing AI chat state with streaming support.
 *
 * Handles message history, user input, streaming responses,
 * and lifecycle callbacks. Provider-agnostic: supply a custom
 * `transport` for any AI backend, or pass `api` for the
 * default text-streaming transport.
 *
 * @example
 * ```tsx
 * const chat = useChat({ api: "/api/chat" })
 *
 * // Or with a custom transport:
 * const chat = useChat({
 *   transport: openaiTransport({ apiKey: "..." }),
 * })
 * ```
 */
export function useChat(options: ChatOptions): ChatHandler {
  const {
    transport: transportOption,
    api,
    initialMessages = [],
    headers,
    body,
    onStart,
    onFinish,
    onError,
    fetch: fetchFn,
    generateId = () => crypto.randomUUID(),
  } = options

  if (!transportOption && !api) {
    throw new Error("useChat requires either a `transport` or an `api` URL")
  }

  const transport: ChatTransport =
    transportOption ?? textTransport({ api: api!, headers, body, fetch: fetchFn })

  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const transportRef = useRef(transport)
  transportRef.current = transport

  const sendMessages = useCallback(
    async (messagesToSend: Message[]) => {
      const controller = new AbortController()
      abortRef.current = controller

      setIsLoading(true)
      setError(null)
      onStart?.()

      const assistantId = generateId()
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      try {
        const outgoing = messagesToSend.map(({ role, content }) => ({
          role,
          content,
        }))

        let accumulated = ""

        for await (const chunk of transportRef.current.send(
          outgoing,
          controller.signal
        )) {
          accumulated += chunk
          const content = accumulated
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content } : m))
          )
        }

        const finalMessage: Message = {
          ...assistantMessage,
          content: accumulated,
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? finalMessage : m))
        )
        onFinish?.(finalMessage)
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return
        }
        const error =
          err instanceof Error ? err : new Error("Unknown chat error")
        setError(error)
        onError?.(error)

        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [onStart, onFinish, onError, generateId]
  )

  const submit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput("")
    sendMessages(nextMessages)
  }, [input, isLoading, messages, generateId, sendMessages])

  const append = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
  }, [])

  const clear = useCallback(() => {
    setMessages([])
    setInput("")
    setError(null)
  }, [])

  const reload = useCallback(() => {
    if (isLoading) return

    let lastUserIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserIndex = i
        break
      }
    }
    if (lastUserIndex === -1) return

    const messagesToKeep = messages.slice(0, lastUserIndex + 1)
    setMessages(messagesToKeep)
    sendMessages(messagesToKeep)
  }, [isLoading, messages, sendMessages])

  return useMemo(
    () => ({
      messages,
      input,
      isLoading,
      error,
      setInput,
      submit,
      append,
      stop,
      clear,
      reload,
      setMessages,
    }),
    [messages, input, isLoading, error, submit, append, stop, clear, reload]
  )
}

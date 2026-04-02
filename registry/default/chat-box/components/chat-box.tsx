import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react"

import { useChat } from "@/registry/default/chat-box/hooks/use-chat"
import type {
  ChatHandler,
  ChatOptions,
} from "@/registry/default/chat-box/lib/types"

export const ChatBoxContext = createContext<ChatHandler | null>(null)

/**
 * Access the chat box context from any descendant component.
 *
 * Must be used within a `<ChatBox>` provider.
 */
export function useChatBox(): ChatHandler {
  const context = useContext(ChatBoxContext)
  if (!context) {
    throw new Error("useChatBox must be used within a <ChatBox> provider")
  }
  return context
}

type ChatBoxProps = ChatOptions & {
  children: ReactNode | ((chat: ChatHandler) => ReactNode)
}

/**
 * Headless chat box provider component.
 *
 * Manages all chat state (messages, input, streaming) and exposes it
 * via context to descendant components, or via render props.
 *
 * Bring your own UI — this component renders no DOM elements.
 *
 * @example
 * ```tsx
 * // With context
 * <ChatBox api="/api/chat">
 *   <MyMessages />
 *   <MyInput />
 * </ChatBox>
 *
 * // With a custom transport
 * <ChatBox transport={openaiTransport({ apiKey: "..." })}>
 *   <MyMessages />
 *   <MyInput />
 * </ChatBox>
 *
 * // With render props
 * <ChatBox api="/api/chat">
 *   {({ messages, input, setInput, submit }) => (
 *     <div>
 *       {messages.map(m => <p key={m.id}>{m.content}</p>)}
 *       <input value={input} onChange={e => setInput(e.target.value)} />
 *       <button onClick={submit}>Send</button>
 *     </div>
 *   )}
 * </ChatBox>
 * ```
 */
export function ChatBox({ children, ...options }: ChatBoxProps) {
  const chat = useChat(options)

  return (
    <ChatBoxContext.Provider value={chat}>
      {typeof children === "function" ? children(chat) : children}
    </ChatBoxContext.Provider>
  )
}

/**
 * Returns an `onKeyDown` handler that submits on Enter
 * (without Shift) and allows newlines with Shift+Enter.
 */
export function useChatBoxSubmitOnEnter() {
  const { submit } = useChatBox()

  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault()
        submit()
      }
    },
    [submit]
  )
}

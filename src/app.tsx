import { Routes, Route } from "react-router"
import { AppLayout } from "@/src/components/app-layout"
import { HomePage } from "@/src/pages/home"
import { GettingStartedPage } from "@/src/pages/getting-started"
import { ConversationalUIPage } from "@/src/pages/conversational-ui"
import { ComponentsPage } from "@/src/pages/components"
import { DemosPage } from "@/src/pages/demos"
import { ChatBoxPage } from "@/src/pages/components/chat-box"
import { ChatInputPage } from "@/src/pages/components/chat-input"
import { ChatMessagePage } from "@/src/pages/components/chat-message"
import { ChatMessagesPage } from "@/src/pages/components/chat-messages"
import { StreamingTextPage } from "@/src/pages/components/streaming-text"
import { ChatFullPage } from "@/src/pages/components/chat-full"
import { TransportOpenaiPage } from "@/src/pages/components/transport-openai"

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs/getting-started" element={<GettingStartedPage />} />
        <Route path="/docs/conversational-ui" element={<ConversationalUIPage />} />
        <Route path="/docs/components" element={<ComponentsPage />} />
        <Route path="/docs/components/chat-box" element={<ChatBoxPage />} />
        <Route path="/docs/components/chat-input" element={<ChatInputPage />} />
        <Route path="/docs/components/chat-message" element={<ChatMessagePage />} />
        <Route path="/docs/components/chat-messages" element={<ChatMessagesPage />} />
        <Route path="/docs/components/streaming-text" element={<StreamingTextPage />} />
        <Route path="/docs/components/chat-full" element={<ChatFullPage />} />
        <Route path="/docs/components/transport-openai" element={<TransportOpenaiPage />} />
        <Route path="/demos" element={<DemosPage />} />
      </Route>
    </Routes>
  )
}

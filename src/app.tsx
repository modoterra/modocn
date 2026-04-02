import { Routes, Route } from "react-router"
import { AppLayout } from "@/src/components/app-layout"
import { HomePage } from "@/src/pages/home"
import { GettingStartedPage } from "@/src/pages/getting-started"
import { ConversationalUIPage } from "@/src/pages/conversational-ui"
import { ComponentsPage } from "@/src/pages/components"
import { DemosPage } from "@/src/pages/demos"

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs/getting-started" element={<GettingStartedPage />} />
        <Route path="/docs/conversational-ui" element={<ConversationalUIPage />} />
        <Route path="/docs/components" element={<ComponentsPage />} />
        <Route path="/demos" element={<DemosPage />} />
      </Route>
    </Routes>
  )
}

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { ThemeProvider } from "@/src/components/theme-provider"
import "./index.css"
import { App } from "./app"

const BASENAME = import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL

const redirectedPath = sessionStorage.getItem("modocn:redirect")
if (redirectedPath) {
  sessionStorage.removeItem("modocn:redirect")
  window.history.replaceState(null, "", redirectedPath)
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={BASENAME}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)

import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router"
import { Menu } from "lucide-react"
import { useTheme } from "@/src/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarNav } from "@/src/components/sidebar-nav"

const NAV_ITEMS = [
  { label: "Docs", href: "/docs/getting-started" },
  { label: "Components", href: "/docs/components" },
  { label: "Demos", href: "/demos" },
]

const BREADCRUMB_LABELS: Record<string, string> = {
  "/docs/getting-started": "Getting Started",
  "/docs/conversational-ui": "Conversational UI",
  "/docs/components": "Components",
  "/docs/components/chat-box": "ChatBox",
  "/docs/components/chat-input": "ChatInput",
  "/docs/components/chat-message": "ChatMessage",
  "/docs/components/chat-messages": "ChatMessages",
  "/docs/components/streaming-text": "StreamingText",
  "/docs/components/chat-full": "ChatFull",
  "/docs/components/transport-openai": "Transport OpenAI",
}

function DocsBreadcrumb({ pathname }: { pathname: string }) {
  const label = BREADCRUMB_LABELS[pathname]
  if (!label) return null

  const isComponentPage = pathname.startsWith("/docs/components/")

  return (
      <Breadcrumb className="mb-12">
        <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">modocn</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {isComponentPage ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/docs/components">Components</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{label}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>{label}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function AppLayout() {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const isDocsPage = pathname.startsWith("/docs")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh">
      <header>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            {isDocsPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4" />
              </Button>
            )}
            <Link to="/">
              modocn
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} to={item.href} className="px-3 py-2">
                {item.label}
              </Link>
            ))}
            <a
              href="https://github.com/modoterra/modocn"
              className="hidden px-3 py-2 sm:inline-flex"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="px-6 py-4">
            <Link to="/">
              modocn
            </Link>
          </div>
          <div className="p-4">
            <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {isDocsPage ? (
        <div className="mx-auto flex max-w-7xl flex-1 gap-10 px-4 py-8 sm:px-6 lg:px-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6 p-4">
              <SidebarNav />
            </div>
          </aside>
          <main className="min-w-0 max-w-4xl flex-1">
            <DocsBreadcrumb pathname={pathname} />
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <Outlet />
          </div>
        </main>
      )}

      <footer>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <span>&copy; 2026 Modoterra Corporation</span>
          <a
            href="https://modoterra.xyz"
            target="_blank"
            rel="noopener noreferrer"
          >
            modoterra.xyz
          </a>
        </div>
      </footer>
    </div>
  )
}

import { Link } from "react-router"

type NavItem = {
  label: string
  href: string
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs/getting-started" },
      { label: "Conversational UI", href: "/docs/conversational-ui" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "Overview", href: "/docs/components" },
      { label: "ChatBox", href: "/docs/components/chat-box" },
      { label: "ChatInput", href: "/docs/components/chat-input" },
      { label: "ChatMessage", href: "/docs/components/chat-message" },
      { label: "ChatMessages", href: "/docs/components/chat-messages" },
      { label: "StreamingText", href: "/docs/components/streaming-text" },
      { label: "ChatFull", href: "/docs/components/chat-full" },
      { label: "Transport OpenAI", href: "/docs/components/transport-openai" },
    ],
  },
  {
    title: "Demos",
    items: [
      { label: "All Demos", href: "/demos" },
    ],
  },
]

type SidebarNavProps = {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps = {}) {
  return (
    <nav className="flex flex-col gap-8">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-3">
            {group.title}
          </p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link to={item.href} onClick={onNavigate} className="block px-3 py-2">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

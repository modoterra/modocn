import { Link, Outlet } from "react-router"
import { useTheme } from "@/src/components/theme-provider"
import type { CSSProperties } from "react"

const styles: Record<string, CSSProperties> = {
  shell: {
    maxWidth: "64rem",
    margin: "0 auto",
    padding: "0 2rem",
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    padding: "1.5rem 0",
    fontSize: "0.8125rem",
    letterSpacing: "0.02em",
  },
  wordmark: {
    fontWeight: 600,
    fontSize: "0.875rem",
    textDecoration: "none",
    color: "var(--foreground)",
    letterSpacing: "0.04em",
  },
  nav: {
    display: "flex",
    alignItems: "baseline",
    gap: "1.5rem",
    fontSize: "0.8125rem",
  },
  navLink: {
    textDecoration: "none",
    color: "var(--muted-foreground)",
  },
  themeToggle: {
    background: "none",
    border: "none",
    color: "var(--muted-foreground)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "inherit",
    padding: 0,
    letterSpacing: "inherit",
  },
  content: {
    flex: 1,
    padding: "2rem 0",
  },
  footer: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    padding: "1.5rem 0",
    fontSize: "0.75rem",
    color: "var(--muted-foreground)",
    letterSpacing: "0.02em",
  },
}

export function AppLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <Link to="/" style={styles.wordmark}>
          modocn
        </Link>
        <nav style={styles.nav}>
          <Link to="/docs/getting-started" style={styles.navLink}>
            docs
          </Link>
          <Link to="/demos" style={styles.navLink}>
            demos
          </Link>
          <a
            href="https://github.com/modoterra/modocn"
            style={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            source
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            style={styles.themeToggle}
          >
            {theme === "dark" ? "light" : "dark"}
          </button>
        </nav>
      </header>

      <hr />

      <main style={styles.content}>
        <Outlet />
      </main>

      <hr />

      <footer style={styles.footer}>
        <span>&copy; 2026 Modoterra Corporation. All rights reserved.</span>
        <a
          href="https://modoterra.xyz"
          style={{ color: "inherit" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          modoterra.xyz
        </a>
      </footer>
    </div>
  )
}

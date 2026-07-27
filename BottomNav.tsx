import { Link } from "@tanstack/react-router";
import { Home, Sprout, BookOpen, Bookmark } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/recommend", label: "Recommend", icon: Sprout, exact: false },
  { to: "/guide", label: "Guide", icon: BookOpen, exact: false },
  { to: "/saved", label: "Saved", icon: Bookmark, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {tabs.map(({ to, label, icon: Icon, exact }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="btn-tap flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={
                      "flex h-9 w-14 items-center justify-center rounded-full transition-colors " +
                      (isActive ? "bg-accent" : "bg-transparent")
                    }
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

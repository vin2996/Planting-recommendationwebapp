import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { AdBanner } from "./AdBanner";
import { SearchButton } from "./GlobalSearch";
import { LanguageButton } from "./LanguagePicker";
import { OfflineBanner } from "./OfflineBanner";
import { useT } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <div className="mx-auto max-w-lg pb-28">{children}</div>
      <BottomNav />
      <AdBanner />
    </div>
  );
}



export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const t = useT();
  return (
    <header className="flex items-start justify-between gap-2 px-5 pb-4 pt-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t(title)}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{t(subtitle)}</p>
        ) : null}
      </div>
      <div className="flex flex-none items-center gap-2">
        <SearchButton />
        <LanguageButton />
        {right ?? (
          <Link
            to="/auth"
            aria-label={t("Account")}
            className="btn-tap grid h-11 w-11 flex-none place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)]"
          >
            <UserRound className="h-5 w-5" />
          </Link>
        )}
      </div>
    </header>
  );
}


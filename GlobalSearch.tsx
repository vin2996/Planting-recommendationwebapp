import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { CROPS, CATEGORIES, cropCategory } from "@/lib/crops";
import { useT } from "@/lib/i18n";

/** Search button that opens a full-screen crop search, available on every page. */
export function SearchButton() {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t("Search crops")}
        className="btn-tap grid h-11 w-11 flex-none place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)]"
      >
        <Search className="h-5 w-5" />
      </button>
      {open && <SearchOverlay onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [q, setQ] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = term
      ? CROPS.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            c.season.toLowerCase().includes(term) ||
            c.soils.some((s) => s.includes(term)) ||
            cropCategory(c).includes(term),
        )
      : CROPS;
    return list.slice(0, 60);
  }, [q]);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="mx-auto flex h-full max-w-lg flex-col">
        <div className="flex items-center gap-2 px-4 pb-3 pt-6">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border-2 border-border bg-card px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search any crop, fruit or vegetable")}
              className="w-full bg-transparent py-3 text-base outline-none"
            />
          </div>
          <button
            onClick={onClose}
            aria-label={t("Close")}
            className="btn-tap grid h-11 w-11 place-items-center rounded-full bg-card"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!q && (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setQ(c.id)}
                className="btn-tap rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-semibold"
              >
                {c.emoji} {t(c.label)}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          <p className="py-2 text-xs text-muted-foreground">
            {results.length} {t("results")}
          </p>
          <div className="grid gap-2">
            {results.map((crop) => (
              <Link
                key={crop.id}
                to="/guide/$cropId"
                params={{ cropId: crop.id }}
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]"
              >
                <span
                  className={`grid h-12 w-12 flex-none place-items-center rounded-xl bg-gradient-to-br ${crop.gradient} text-2xl`}
                >
                  {crop.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold text-foreground">{t(crop.name)}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t(crop.season)} · {crop.daysToHarvest}
                  </span>
                </span>
              </Link>
            ))}
          </div>
          {results.length === 0 && (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              {t("Nothing found. Try another word.")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

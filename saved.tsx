import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { getSaved, deleteSaved, togglePlanted, type SavedRecommendation } from "@/lib/storage";
import { Bookmark, Trash2, Check, MapPin } from "lucide-react";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved — Crop Guide" },
      { name: "description", content: "Your saved recommendations and planting history." },
    ],
  }),
  component: Saved,
});

function Saved() {
  const [items, setItems] = useState<SavedRecommendation[]>([]);
  useEffect(() => { setItems(getSaved()); }, []);

  const refresh = () => setItems(getSaved());

  return (
    <AppShell>
      <PageHeader title="Saved" subtitle="Track what you planted." />

      {items.length === 0 ? (
        <div className="mx-5 mt-4 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent">
            <Bookmark className="h-8 w-8 text-accent-foreground" />
          </div>
          <p className="text-base font-semibold">No saved recommendations yet</p>
          <p className="text-sm text-muted-foreground">Save a recommendation to track what you plant.</p>
          <Link to="/recommend" className="btn-tap mt-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground">
            Get a recommendation
          </Link>
        </div>
      ) : (
        <ul className="space-y-4 px-5">
          {items.map((s) => (
            <li key={s.id} className="rounded-3xl bg-card p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate">{s.location.name}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{s.soil} soil · {Math.round(s.avgTempC)}°C · {Math.round(s.totalRain7d)}mm rain
                  </div>
                </div>
                <button
                  onClick={() => { deleteSaved(s.id); refresh(); }}
                  aria-label="Delete"
                  className="btn-tap grid w-10 flex-none place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <ul className="mt-3 space-y-2">
                {s.crops.map((c) => {
                  const planted = s.planted?.includes(c.id);
                  return (
                    <li key={c.id} className="flex items-center gap-3">
                      <Link
                        to="/guide/$cropId"
                        params={{ cropId: c.id }}
                        className="btn-tap flex flex-1 items-center gap-3 rounded-2xl bg-muted px-3"
                      >
                        <span className="text-2xl">{c.emoji}</span>
                        <span className="flex-1 truncate font-semibold">{c.name}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {c.score}
                        </span>
                      </Link>
                      <button
                        onClick={() => { togglePlanted(s.id, c.id); refresh(); }}
                        aria-label={planted ? "Mark not planted" : "Mark as planted"}
                        className={
                          "btn-tap grid w-12 flex-none place-items-center rounded-2xl border-2 " +
                          (planted ? "border-primary bg-primary text-primary-foreground" : "border-border")
                        }
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}

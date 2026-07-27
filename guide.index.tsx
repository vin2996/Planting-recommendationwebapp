import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CROPS, cropCategory, type CropCategory } from "@/lib/crops";
import { Search } from "lucide-react";


export const Route = createFileRoute("/guide/")({
  head: () => ({
    meta: [
      { title: "Crop guide library — Crop Guide" },
      { name: "description", content: "Browse plain-language planting guides for crops, vegetables and fruits." },
    ],
  }),
  component: GuideIndex,
});

function GuideIndex() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CropCategory | "all">("all");

  const list = useMemo(
    () =>
      CROPS.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) &&
          (cat === "all" || cropCategory(c) === cat),
      ),
    [q, cat],
  );

  return (
    <AppShell>
      <PageHeader title="Crop guide" subtitle={`${CROPS.length} crops, vegetables and fruits.`} />
      <section className="px-5">
        <div className="flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search crops"
            className="btn-tap w-full bg-transparent py-3 text-base outline-none"
          />
        </div>
      </section>

      <CategoryFilter value={cat} onChange={setCat} className="mt-4 px-5" />

      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        {list.map((crop) => (
          <Link
            key={crop.id}
            to="/guide/$cropId"
            params={{ cropId: crop.id }}
            className="flex flex-col gap-2 rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]"
          >
            <span className={`grid aspect-[4/3] place-items-center rounded-xl bg-gradient-to-br ${crop.gradient} text-5xl`}>
              {crop.emoji}
            </span>
            <span className="font-bold text-foreground">{crop.name}</span>
            <span className="-mt-1 text-xs text-muted-foreground">{crop.season}</span>
          </Link>
        ))}
      </section>

      {list.length === 0 && (
        <p className="mt-8 px-5 text-center text-sm text-muted-foreground">No crops match your filters.</p>
      )}
    </AppShell>
  );
}

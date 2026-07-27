import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { SOILS, recommendCrops, cropCategory, type SoilType, type CropCategory } from "@/lib/crops";
import { CategoryFilter } from "@/components/CategoryFilter";
import { getWeather, reverseGeocode, geocode, weatherLabel, type Location, type WeatherSummary } from "@/lib/weather";
import { cacheWeather, getProfile, readCachedWeather, saveRecommendation, updateProfile } from "@/lib/storage";
import { MapPin, Search, Loader2, Sparkles, Bookmark, ArrowRight, Cloud, Thermometer } from "lucide-react";

export const Route = createFileRoute("/recommend")({
  head: () => ({
    meta: [
      { title: "Recommend — Crop Guide" },
      { name: "description", content: "Ranked crops for your soil and forecast." },
    ],
  }),
  component: Recommend,
});

function Recommend() {
  const navigate = useNavigate();
  const [profile, setProfileState] = useState(() => getProfile());
  const [location, setLocation] = useState<Location | null>(profile.location ?? null);
  const [soil, setSoil] = useState<SoilType | null>(profile.soil ?? null);
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [cat, setCat] = useState<CropCategory | "all">("all");

  useEffect(() => {
    if (!profile.onboarded) navigate({ to: "/onboarding" });
  }, [profile.onboarded, navigate]);

  useEffect(() => {
    if (!location) { setWeather(null); return; }
    const key = `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
    const cached = readCachedWeather<WeatherSummary>(key);
    if (cached) setWeather(cached);
    setLoading(true); setError(null);
    getWeather(location.latitude, location.longitude)
      .then((w) => { setWeather(w); cacheWeather(key, w); })
      .catch(() => setError("Couldn't fetch weather. Showing saved data if any."))
      .finally(() => setLoading(false));
  }, [location]);

  const allRanked = useMemo(() => {
    if (!soil || !weather) return [];
    return recommendCrops({ soil, avgTempC: weather.avgTemp7d, totalRain7d: weather.totalRain7d });
  }, [soil, weather]);

  const ranked = useMemo(
    () => (cat === "all" ? allRanked : allRanked.filter((r) => cropCategory(r.crop) === cat)),
    [allRanked, cat],
  );

  const handleSave = () => {
    if (!location || !soil || !weather) return;
    saveRecommendation({
      location, soil,
      avgTempC: weather.avgTemp7d,
      totalRain7d: weather.totalRain7d,
      crops: allRanked.slice(0, 10).map((r) => ({ id: r.crop.id, name: r.crop.name, emoji: r.crop.emoji, score: r.score })),
    });
    updateProfile({ location, soil });
    setProfileState(getProfile());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <PageHeader title="Recommend" subtitle="Match crops to your land." />

      <section className="px-5">
        <LocationPicker value={location} onChange={setLocation} />
      </section>

      <section className="mt-5 px-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Soil type</h2>
        <div className="grid grid-cols-3 gap-2">
          {SOILS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSoil(s.id)}
              className={
                "flex flex-col items-center gap-1 rounded-2xl border-2 bg-card p-3 " +
                (soil === s.id ? "border-primary shadow-[var(--shadow-card)]" : "border-border")
              }
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-xs font-semibold">{s.name}</span>
            </button>
          ))}
        </div>
      </section>

      {weather && (
        <section className="mx-5 mt-5 flex items-center gap-3 rounded-2xl bg-accent p-4 text-accent-foreground">
          <span className="text-3xl">{weatherLabel(weather.current.code).emoji}</span>
          <div className="flex-1 text-sm">
            <div className="flex items-center gap-1 font-semibold">
              <Thermometer className="h-4 w-4" /> avg {Math.round(weather.avgTemp7d)}°C
              <span className="mx-2 opacity-40">•</span>
              <Cloud className="h-4 w-4" /> {Math.round(weather.totalRain7d)} mm / 7d
            </div>
            <div className="mt-0.5 text-xs opacity-80">Live 7-day forecast</div>
          </div>
        </section>
      )}

      {error && <p className="mx-5 mt-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {ranked.length > 0 ? `Ranked for you (${ranked.length} crops)` : "Set location and soil"}
          </h2>
          {ranked.length > 0 && (
            <button onClick={handleSave} className="flex items-center gap-1 text-sm font-semibold text-primary">
              <Bookmark className="h-4 w-4" /> {saved ? "Saved!" : "Save"}
            </button>
          )}
        </div>

        {allRanked.length > 0 && <CategoryFilter value={cat} onChange={setCat} className="mt-3" />}

        {loading && !weather && (
          <div className="mt-4 flex items-center justify-center gap-2 p-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading weather…
          </div>
        )}

        {ranked.length === 0 && !loading && (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Pick a location and soil to see recommendations.</p>
          </div>
        )}

        <ul className="mt-3 space-y-3">
          {ranked.map(({ crop, score, reasons }, i) => (
            <li key={crop.id}>
              <Link
                to="/guide/$cropId"
                params={{ cropId: crop.id }}
                className="btn-tap flex items-stretch gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <span className={`grid h-16 w-16 flex-none place-items-center rounded-2xl bg-gradient-to-br ${crop.gradient} text-4xl`}>
                  {crop.emoji}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground">
                      {i === 0 && "🏆 "}{crop.name}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {score}
                    </span>
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {crop.season} • {crop.daysToHarvest} • {crop.yield}
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs text-foreground/80">
                    {reasons.join(" · ") || crop.reason}
                  </span>
                </span>
                <ArrowRight className="mt-1 h-5 w-5 flex-none self-center text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function LocationPicker({ value, onChange }: { value: Location | null; onChange: (v: Location) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [busy, setBusy] = useState<"gps" | "search" | null>(null);

  const useGps = () => {
    setBusy("gps");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const loc = await reverseGeocode(p.coords.latitude, p.coords.longitude);
        onChange(loc); setOpen(false); setBusy(null);
      },
      () => setBusy(null),
    );
  };

  const runSearch = async () => {
    if (!q.trim()) return;
    setBusy("search");
    try { setResults(await geocode(q.trim())); } finally { setBusy(null); }
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
      <button onClick={() => setOpen((v) => !v)} className="btn-tap flex w-full items-center gap-3 text-left">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
          <MapPin className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block text-xs font-semibold uppercase text-muted-foreground">Farm location</span>
          <span className="block truncate font-semibold text-foreground">
            {value?.name ?? "Set your location"}
          </span>
        </span>
        <span className="text-sm font-semibold text-primary">{open ? "Close" : "Change"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <button
            onClick={useGps}
            className="btn-tap flex w-full items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-foreground"
          >
            {busy === "gps" ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
            Use current location
          </button>
          <form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search town or village"
              className="btn-tap w-full rounded-2xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
            />
            <button className="btn-tap grid w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
              {busy === "search" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </button>
          </form>
          {results.length > 0 && (
            <ul className="max-h-64 space-y-1 overflow-auto">
              {results.map((r) => (
                <li key={`${r.latitude},${r.longitude}`}>
                  <button
                    onClick={() => { onChange(r); setOpen(false); setResults([]); setQ(""); }}
                    className="btn-tap w-full rounded-xl px-3 text-left hover:bg-accent"
                  >
                    <span className="block font-semibold">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

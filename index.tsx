import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { getProfile, readCachedWeather, cacheWeather } from "@/lib/storage";
import { getWeather, weatherLabel, type WeatherSummary } from "@/lib/weather";
import { recommendCrops } from "@/lib/crops";
import { MapPin, Sprout, ArrowRight, CloudSun, Droplets, Wind, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crop Guide -Recommendation" },
      {
        name: "description",
        content: "Your farm dashboard: today's weather and ranked crop suggestions.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [profile] = useState(() => getProfile());
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (!profile.onboarded) {
      navigate({ to: "/onboarding" });
      return;
    }
    if (!profile.location) return;
    const key = `${profile.location.latitude.toFixed(2)},${profile.location.longitude.toFixed(2)}`;
    const cached = readCachedWeather<WeatherSummary>(key);
    if (cached) { setWeather(cached); setStale(true); }
    getWeather(profile.location.latitude, profile.location.longitude)
      .then((w) => { setWeather(w); setStale(false); cacheWeather(key, w); })
      .catch(() => {});
  }, [profile, navigate]);

  if (!profile.onboarded) return null;

  const top = weather && profile.soil
    ? recommendCrops({
        soil: profile.soil,
        avgTempC: weather.avgTemp7d,
        totalRain7d: weather.totalRain7d,
      }).slice(0, 3)
    : [];

  return (
    <AppShell>
      <PageHeader
        title={`Hello${profile.name ? `, ${profile.name}` : ""} 👋`}
        subtitle="Let's see what to plant."
      />

      <section className="mx-5 rounded-3xl bg-primary p-5 text-primary-foreground shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 text-sm opacity-90">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{profile.location?.name ?? "No location set"}</span>
        </div>
        {weather ? (
          <>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-6xl">{weatherLabel(weather.current.code).emoji}</span>
              <div>
                <div className="text-5xl font-bold leading-none">
                  {Math.round(weather.current.temperature)}°
                </div>
                <div className="mt-1 text-sm opacity-90">
                  {weatherLabel(weather.current.code).label}
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <Stat icon={<CloudSun className="h-4 w-4" />} label="7-day avg" value={`${Math.round(weather.avgTemp7d)}°`} />
              <Stat icon={<Droplets className="h-4 w-4" />} label="Rain 7d" value={`${Math.round(weather.totalRain7d)} mm`} />
              <Stat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${Math.round(weather.current.wind)} km/h`} />
            </div>
            {stale ? (
              <p className="mt-3 text-xs opacity-75">Showing saved data — reconnect to refresh.</p>
            ) : null}
          </>
        ) : (
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/20" />
        )}
      </section>

      {weather ? (
        <section className="mt-5 px-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            7-day forecast
          </h2>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
            {weather.daily.map((d) => {
              const label = weatherLabel(d.code);
              const day = new Date(d.date).toLocaleDateString(undefined, { weekday: "short" });
              return (
                <div key={d.date} className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]">
                  <span className="text-xs font-semibold text-muted-foreground">{day}</span>
                  <span className="text-2xl" aria-hidden>{label.emoji}</span>
                  <span className="text-sm font-bold text-foreground">{Math.round(d.tMax)}°</span>
                  <span className="text-xs text-muted-foreground">{Math.round(d.tMin)}°</span>
                  <span className="text-[10px] font-semibold text-sky-700">{Math.round(d.rain)}mm</span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top picks for your farm
          </h2>
          <Link to="/recommend" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {top.length === 0 ? (
            <Link
              to="/recommend"
              className="btn-tap flex items-center justify-between rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="font-semibold">Get recommendations</span>
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ) : (
            top.map(({ crop, score, reasons }) => (
              <Link
                key={crop.id}
                to="/guide/$cropId"
                params={{ cropId: crop.id }}
                className="btn-tap flex items-center gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${crop.gradient} text-3xl`}>
                  {crop.emoji}
                </span>
                <span className="flex-1">
                  <span className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{crop.name}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {score}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {reasons[0] ?? crop.reason}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="mt-6 px-5">
        <Link
          to="/recommend"
          className="btn-tap flex items-center justify-center gap-2 rounded-2xl bg-earth px-4 py-3 font-semibold text-earth-foreground shadow-[var(--shadow-soft)]"
        >
          <Sprout className="h-5 w-5" />
          New recommendation
        </Link>
      </section>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-3">
      <div className="flex items-center gap-1 text-xs opacity-90">{icon}<span>{label}</span></div>
      <div className="mt-0.5 text-base font-bold">{value}</div>
    </div>
  );
}

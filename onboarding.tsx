import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { updateProfile } from "@/lib/storage";
import { SOILS, type SoilType } from "@/lib/crops";
import { geocode, reverseGeocode, type Location } from "@/lib/weather";
import { MapPin, Sprout, Search, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — Crop Guide" },
      { name: "description", content: "Set up your farm in three quick steps." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [soil, setSoil] = useState<SoilType | null>(null);

  const finish = () => {
    updateProfile({ onboarded: true, name: name.trim() || undefined, location: location ?? undefined, soil: soil ?? undefined });
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 pb-8 pt-12">
        <div className="mb-6 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={
                "h-1.5 flex-1 rounded-full transition-colors " +
                (i <= step ? "bg-primary" : "bg-border")
              }
            />
          ))}
        </div>

        {step === 0 && (
          <StepWelcome name={name} setName={setName} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <StepLocation
            value={location}
            onChange={setLocation}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepSoil
            value={soil}
            onChange={setSoil}
            onBack={() => setStep(1)}
            onFinish={finish}
            canFinish={!!soil && !!location}
          />
        )}
      </div>
    </div>
  );
}

function StepWelcome({ name, setName, onNext }: { name: string; setName: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-6 grid place-items-center">
        <div className="grid h-28 w-28 place-items-center rounded-[2rem] bg-gradient-to-br from-leaf to-primary text-6xl shadow-[var(--shadow-soft)]">
          🌱
        </div>
      </div>
      <h1 className="mt-8 text-center text-3xl font-bold">Welcome to Crop Guide</h1>
      <p className="mt-3 text-center text-base text-muted-foreground">
        Plant the right crop for your land — based on your soil and the weather.
      </p>
      <label className="mt-8 block">
        <span className="text-sm font-semibold text-foreground">Your name (optional)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Amina"
          className="btn-tap mt-2 w-full rounded-2xl border-2 border-border bg-card px-4 text-base outline-none focus:border-primary"
        />
      </label>
      <div className="flex-1" />
      <button
        onClick={onNext}
        className="btn-tap mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-soft)]"
      >
        Get started <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function StepLocation({
  value, onChange, onNext, onBack,
}: {
  value: Location | null;
  onChange: (v: Location) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState<"search" | "gps" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const search = async () => {
    if (!q.trim()) return;
    setLoading("search"); setErr(null);
    try { setResults(await geocode(q.trim())); }
    catch { setErr("Search failed. Check your connection."); }
    finally { setLoading(null); }
  };

  const useGps = () => {
    setLoading("gps"); setErr(null);
    if (!navigator.geolocation) { setErr("GPS not available on this device."); setLoading(null); return; }
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const loc = await reverseGeocode(p.coords.latitude, p.coords.longitude);
        onChange(loc); setLoading(null);
      },
      () => { setErr("Couldn't get your location. Try searching by name."); setLoading(null); },
      { timeout: 10000 },
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mt-2 text-2xl font-bold">Where is your farm?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We use this to fetch local weather. It stays on your device.
      </p>

      <button
        onClick={useGps}
        className="btn-tap mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-base font-semibold text-accent-foreground"
      >
        {loading === "gps" ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
        Use my current location
      </button>

      <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> Or search <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); search(); }} className="mt-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Town, village or city"
          className="btn-tap w-full rounded-2xl border-2 border-border bg-card px-4 text-base outline-none focus:border-primary"
        />
        <button
          type="submit"
          aria-label="Search"
          className="btn-tap grid w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"
        >
          {loading === "search" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </button>
      </form>

      {err && <p className="mt-3 text-sm text-destructive">{err}</p>}

      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((r) => (
            <li key={`${r.latitude},${r.longitude}`}>
              <button
                onClick={() => onChange(r)}
                className={
                  "btn-tap flex w-full items-center justify-between rounded-2xl border-2 bg-card px-4 text-left " +
                  (value?.latitude === r.latitude && value?.longitude === r.longitude
                    ? "border-primary"
                    : "border-border")
                }
              >
                <span>
                  <span className="block font-semibold">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.country}</span>
                </span>
                {value?.latitude === r.latitude && value?.longitude === r.longitude && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {value && results.length === 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-primary bg-card p-4">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <div>
            <div className="font-semibold">{value.name}</div>
            <div className="text-xs text-muted-foreground">Location set</div>
          </div>
        </div>
      )}

      <div className="flex-1" />
      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="btn-tap flex-1 rounded-2xl border-2 border-border bg-card font-semibold">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!value}
          className="btn-tap flex-[2] rounded-2xl bg-primary font-semibold text-primary-foreground disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function StepSoil({
  value, onChange, onBack, onFinish, canFinish,
}: {
  value: SoilType | null;
  onChange: (v: SoilType) => void;
  onBack: () => void;
  onFinish: () => void;
  canFinish: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mt-2 text-2xl font-bold">What is your soil like?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick the one closest to your farm. You can change this later.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {SOILS.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={
              "flex flex-col items-start gap-2 rounded-2xl border-2 bg-card p-4 text-left transition-all " +
              (value === s.id ? "border-primary shadow-[var(--shadow-soft)]" : "border-border")
            }
          >
            <span className="text-4xl" aria-hidden>{s.emoji}</span>
            <span className="font-bold">{s.name}</span>
            <span className="text-xs text-muted-foreground">{s.description}</span>
          </button>
        ))}
      </div>

      <div className="flex-1" />
      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="btn-tap flex-1 rounded-2xl border-2 border-border bg-card font-semibold">
          Back
        </button>
        <button
          onClick={onFinish}
          disabled={!canFinish}
          className="btn-tap flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground disabled:opacity-40"
        >
          <Sprout className="h-5 w-5" />
          Start planting
        </button>
      </div>
    </div>
  );
}

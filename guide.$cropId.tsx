import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ListenButton } from "@/components/ListenButton";
import { getCrop } from "@/lib/crops";
import { buildGuide, type GuideStage } from "@/lib/guide";
import { useT } from "@/lib/i18n";

import {
  ArrowLeft,
  Droplets,
  Bug,
  Sun,
  Calendar,
  Sprout,
  Shovel,
  Leaf,
  ShoppingBasket,
  Package,
  Wheat,
} from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/guide/$cropId")({
  loader: ({ params }) => {
    const crop = getCrop(params.cropId);
    if (!crop) throw notFound();
    return { crop };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.crop.name} — planting guide` },
          { name: "description", content: `How to grow ${loaderData.crop.name}: ${loaderData.crop.reason}` },
          { property: "og:title", content: `${loaderData.crop.name} — step-by-step planting guide` },
          { property: "og:description", content: loaderData.crop.reason },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Crop guide" }],
  }),
  notFoundComponent: () => (
    <AppShell>
      <div className="px-5 pt-8 text-center">
        <p className="text-lg font-bold">Crop not found</p>
        <Link to="/guide" className="mt-4 inline-block font-semibold text-primary">Back to guide</Link>
      </div>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <div className="px-5 pt-8 text-center">
        <p className="text-lg font-bold">Something went wrong</p>
        <Link to="/guide" className="mt-4 inline-block font-semibold text-primary">Back to guide</Link>
      </div>
    </AppShell>
  ),
  component: CropDetail,
});

const STAGE_ICONS: Record<GuideStage["icon"], React.ReactNode> = {
  calendar: <Calendar className="h-5 w-5" />,
  shovel: <Shovel className="h-5 w-5" />,
  seed: <Wheat className="h-5 w-5" />,
  plant: <Sprout className="h-5 w-5" />,
  leaf: <Leaf className="h-5 w-5" />,
  droplet: <Droplets className="h-5 w-5" />,
  bug: <Bug className="h-5 w-5" />,
  basket: <ShoppingBasket className="h-5 w-5" />,
  box: <Package className="h-5 w-5" />,
};

function CropDetail() {
  const { crop } = Route.useLoaderData();
  const t = useT();

  const stages = useMemo(() => buildGuide(crop), [crop]);

  const fullText = () =>
    [
      t(crop.name),
      t(crop.reason),
      ...stages.flatMap((s) => [t(s.title), t(s.intro), ...s.items.map((i) => t(i))]),
    ].join(". ");


  return (
    <AppShell>
      <div className={`bg-gradient-to-br ${crop.gradient} px-5 pb-8 pt-6`}>
        <Link
          to="/guide"
          className="btn-tap inline-flex items-center gap-1 rounded-full bg-white/80 px-3 text-sm font-semibold text-foreground backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" /> {t("Back")}
        </Link>
        <div className="mt-6 flex items-end gap-3">
          <span className="text-7xl drop-shadow-sm">{crop.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t(crop.name)}</h1>
            <p className="mt-1 text-sm font-semibold text-foreground/70">{t(crop.season)}</p>
          </div>
        </div>
      </div>

      <section className="mx-5 -mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
        <QuickStat icon={<Calendar className="h-4 w-4" />} label={t("Harvest")} value={t(crop.daysToHarvest)} />
        <QuickStat icon={<Sprout className="h-4 w-4" />} label={t("Yield")} value={crop.yield} />
        <QuickStat icon={<Sun className="h-4 w-4" />} label={t("Temp")} value={`${crop.tempMin}–${crop.tempMax}°C`} />
      </section>

      <section className="mt-6 px-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{t("Why this crop")}</h2>
          <ListenButton getText={fullText} />

        </div>
        <p className="mt-2 rounded-2xl bg-accent p-4 text-base text-accent-foreground">{t(crop.reason)}</p>
      </section>

      <section className="mt-6 px-5">
        <h2 className="text-lg font-bold">{t("Full step-by-step planting guide")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("From choosing the day to storing the harvest.")}
        </p>

        <div className="mt-4 grid gap-3">
          {stages.map((stage) => (
            <details
              key={stage.key}
              open={stage.key === "when" || stage.key === "plant"}
              className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]"
            >
              <summary className="btn-tap flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-primary text-primary-foreground">
                  {STAGE_ICONS[stage.icon]}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-foreground">{t(stage.title)}</span>
                  <span className="block text-xs text-muted-foreground">{t(stage.intro)}</span>
                </span>
              </summary>
              <ol className="space-y-2 border-t border-border px-4 pb-4 pt-3">
                {stage.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-muted text-xs font-bold text-foreground">
                      {i + 1}
                    </span>
                    <span className="text-base leading-relaxed text-foreground/90">{t(item)}</span>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-3 px-5">
        <InfoCard icon={<Droplets className="h-5 w-5" />} title={t("Watering")} body={t(crop.water)} tone="sky" />
        <InfoCard
          icon={<Bug className="h-5 w-5" />}
          title={t("Common pests")}
          body={crop.pests.map((p: string) => t(p)).join(", ")}
          tone="earth"
        />
        <InfoCard icon={<Sprout className="h-5 w-5" />} title={t("Harvest")} body={t(crop.harvest)} tone="leaf" />
      </section>
    </AppShell>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="mt-1 text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

function InfoCard({ icon, title, body, tone }: { icon: React.ReactNode; title: string; body: string; tone: "sky" | "earth" | "leaf" }) {
  const bg = tone === "sky" ? "bg-sky/20" : tone === "earth" ? "bg-earth/15" : "bg-leaf/15";
  return (
    <div className={`rounded-2xl ${bg} p-4`}>
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">{icon}{title}</div>
      <p className="mt-1 text-base text-foreground/85">{body}</p>
    </div>
  );
}

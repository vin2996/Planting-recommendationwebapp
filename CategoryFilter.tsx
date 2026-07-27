import { CATEGORIES, type CropCategory } from "@/lib/crops";

export function CategoryFilter({
  value,
  onChange,
  className = "mt-4",
}: {
  value: CropCategory | "all";
  onChange: (v: CropCategory | "all") => void;
  className?: string;
}) {
  const items = [{ id: "all" as const, label: "All", emoji: "🌍" }, ...CATEGORIES];
  return (
    <div
      className={
        className +
        " flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
    >
      {items.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={
            "btn-tap flex flex-none items-center gap-1.5 rounded-full border-2 px-3 py-2 text-xs font-semibold transition-colors " +
            (value === c.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground")
          }
        >
          <span>{c.emoji}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}

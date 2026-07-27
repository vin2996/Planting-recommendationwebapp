import { useEffect, useState } from "react";
import { Check, Languages, Loader2, X } from "lucide-react";
import { LANGUAGES, getLanguage } from "@/lib/languages";
import { useI18n } from "@/lib/i18n";

export function LanguageButton() {
  const { lang, translating } = useI18n();
  const [open, setOpen] = useState(false);
  const current = getLanguage(lang);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Change language"
        className="btn-tap grid h-11 w-11 flex-none place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)]"
      >
        {translating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : lang === "en" ? (
          <Languages className="h-5 w-5" />
        ) : (
          <span className="text-xs font-bold uppercase">{current.code}</span>
        )}
      </button>
      {open && <LanguageSheet onClose={() => setOpen(false)} />}
    </>
  );
}

function LanguageSheet({ onClose }: { onClose: () => void }) {
  const { lang, setLang } = useI18n();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-5 pb-10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Choose your language</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Guides and menus are translated for you.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="btn-tap grid h-10 w-10 place-items-center rounded-full bg-card"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                onClose();
              }}
              className={
                "btn-tap flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left " +
                (lang === l.code ? "border-primary bg-accent" : "border-border bg-card")
              }
            >
              <span className="text-2xl">{l.flag}</span>
              <span className="flex-1">
                <span className="block font-bold text-foreground">{l.label}</span>
                <span className="block text-xs text-muted-foreground">{l.english}</span>
              </span>
              {lang === l.code && <Check className="h-5 w-5 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

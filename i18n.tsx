import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { translateTexts } from "./translate.functions";
import { getLanguage } from "./languages";

const LANG_KEY = "cropguide.lang";
const dictKey = (lang: string) => `cropguide.dict.${lang}`;

interface I18nValue {
  lang: string;
  setLang: (lang: string) => void;
  t: (text: string) => string;
  translating: boolean;
}

const I18nContext = createContext<I18nValue>({
  lang: "en",
  setLang: () => {},
  t: (s) => s,
  translating: false,
});

function loadDict(lang: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(dictKey(lang)) ?? "{}");
  } catch {
    return {};
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");
  const [dict, setDict] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);

  const queue = useRef<Set<string>>(new Set());
  const requested = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  // Restore the saved language on first client render.
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(LANG_KEY) : null;
    if (saved && saved !== "en") {
      setDict(loadDict(saved));
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    const meta = getLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.rtl ? "rtl" : "ltr";
  }, [lang]);

  const flush = useCallback(async () => {
    const texts = Array.from(queue.current);
    queue.current.clear();
    if (texts.length === 0 || langRef.current === "en") return;
    const target = langRef.current;
    texts.forEach((t) => requested.current.add(t));
    setTranslating(true);
    try {
      // Chunk so very long pages still translate reliably.
      for (let i = 0; i < texts.length; i += 60) {
        const chunk = texts.slice(i, i + 60);
        const result = await translateTexts({ data: { lang: target, texts: chunk } });
        if (langRef.current !== target) return;
        setDict((prev) => {
          const next = { ...prev, ...result };
          try {
            window.localStorage.setItem(dictKey(target), JSON.stringify(next));
          } catch {
            /* storage full — translations still work in memory */
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Translation failed", err);
      texts.forEach((t) => requested.current.delete(t));
    } finally {
      setTranslating(false);
    }
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 80);
  }, [flush]);

  const t = useCallback(
    (text: string) => {
      if (!text || langRef.current === "en") return text;
      const hit = dict[text];
      if (hit) return hit;
      if (!requested.current.has(text) && !queue.current.has(text)) {
        queue.current.add(text);
        schedule();
      }
      return text;
    },
    [dict, schedule],
  );

  const setLang = useCallback((next: string) => {
    queue.current.clear();
    requested.current.clear();
    langRef.current = next;
    setDict(next === "en" ? {} : loadDict(next));
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t, translating }), [lang, setLang, t, translating]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Shorthand: const t = useT(); <p>{t("Plant the seed")}</p> */
export function useT() {
  return useContext(I18nContext).t;
}

/** Translated text node. */
export function T({ children }: { children: string }) {
  const t = useT();
  return <>{t(children)}</>;
}

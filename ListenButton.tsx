import { useEffect, useRef, useState } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import { useI18n, useT } from "@/lib/i18n";
import { speakText } from "@/lib/tts.functions";

/** Split long text into pieces small enough for one speech request. */
function chunk(text: string, maxWords = 120): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const words = (s: string) => (s.match(/\S+/g) ?? []).length;
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && words(cur) + words(s) > maxWords) {
      out.push(cur.trim());
      cur = "";
    }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function browserVoiceFor(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase())) ?? null
  );
}

export function ListenButton({
  getText,
  className,
}: {
  getText: () => string;
  className?: string;
}) {
  const t = useT();
  const { lang } = useI18n();
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    // Warm up the browser voice list (Chrome loads it lazily).
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
    return () => stopAll();
  }, []);

  const stopAll = () => {
    cancelled.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const start = async () => {
    if (state !== "idle") {
      stopAll();
      setState("idle");
      return;
    }
    cancelled.current = false;
    const text = getText();
    if (!text.trim()) return;

    const voice = browserVoiceFor(lang);
    if (voice) {
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.95;
      u.onend = () => setState("idle");
      u.onerror = () => setState("idle");
      setState("playing");
      window.speechSynthesis.speak(u);
      return;
    }

    // No local voice for this language — use the cloud voice instead.
    setState("loading");
    try {
      for (const part of chunk(text)) {
        if (cancelled.current) break;
        const { audio, mime } = await speakText({ data: { text: part, lang } });
        if (cancelled.current) break;
        const el = new Audio(`data:${mime};base64,${audio}`);
        audioRef.current = el;
        setState("playing");
        await new Promise<void>((resolve) => {
          el.onended = () => resolve();
          el.onerror = () => resolve();
          void el.play().catch(() => resolve());
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!cancelled.current) setState("idle");
      else setState("idle");
    }
  };

  const busy = state === "loading";
  return (
    <button
      onClick={() => void start()}
      aria-label={state === "idle" ? t("Read aloud") : t("Stop reading")}
      className={
        className ??
        "btn-tap flex flex-none items-center gap-1 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"
      }
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "playing" ? (
        <Square className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {busy ? t("Loading") : state === "playing" ? t("Stop") : t("Listen")}
    </button>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { syncFromCloud, clearLocalData } from "@/lib/storage";
import { Sprout, Loader2, LogOut, Mail, Lock, ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Crop Guide" },
      {
        name: "description",
        content: "Sign in to save your farm profile and crop recommendations to the cloud.",
      },
      { property: "og:title", content: "Sign in — Crop Guide" },
      {
        property: "og:description",
        content: "Sign in to keep your farm profile and saved crop plans on every device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null); setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name.trim() || undefined },
          },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
          setBusy(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      await syncFromCloud();
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    clearLocalData();
    setBusy(false);
    navigate({ to: "/onboarding" });
  };

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 pb-10 pt-8">
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to farm
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sprout className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {user ? "Your account" : mode === "signup" ? "Create account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user
                ? "Your farm data is backed up to the cloud."
                : "Keep your farm profile and saved plans on every device."}
            </p>
          </div>
        </div>

        {user ? (
          <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signed in as</p>
            <p className="mt-1 break-all text-lg font-bold text-foreground">{user.email}</p>
            <button
              onClick={() => { void syncFromCloud(); setMessage("Synced."); }}
              className="btn-tap mt-5 w-full rounded-2xl bg-accent py-3 font-semibold text-accent-foreground"
            >
              Sync my farm data now
            </button>
            <button
              onClick={signOut}
              disabled={busy}
              className="btn-tap mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-border py-3 font-semibold text-foreground"
            >
              <LogOut className="h-5 w-5" /> Sign out
            </button>
            {message ? <p className="mt-3 text-center text-sm text-primary">{message}</p> : null}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            {mode === "signup" ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ama"
                  className="btn-tap mt-1 w-full rounded-2xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="btn-tap w-full rounded-2xl border-2 border-border bg-background pl-12 pr-4 text-base outline-none focus:border-primary"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</span>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="btn-tap w-full rounded-2xl border-2 border-border bg-background pl-12 pr-4 text-base outline-none focus:border-primary"
                />
              </div>
            </label>

            {error ? (
              <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
            ) : null}
            {message ? (
              <p className="rounded-2xl bg-accent p-3 text-sm text-accent-foreground">{message}</p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="btn-tap flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); setMessage(null); }}
              className="btn-tap w-full text-sm font-semibold text-primary"
            >
              {mode === "signup" ? "I already have an account" : "New here? Create an account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can keep using Crop Guide without an account — signing in just backs up your data.
        </p>
      </div>
    </div>
  );
}

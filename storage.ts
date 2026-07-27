import type { Location } from "./weather";
import type { SoilType } from "./crops";
import { supabase } from "@/integrations/supabase/client";

const PROFILE_KEY = "cropguide.profile.v1";
const SAVED_KEY = "cropguide.saved.v1";
const CACHE_KEY = "cropguide.weathercache.v1";

export interface Profile {
  location?: Location;
  soil?: SoilType;
  onboarded: boolean;
  name?: string;
}

export interface SavedRecommendation {
  id: string;
  createdAt: number;
  location: Location;
  soil: SoilType;
  avgTempC: number;
  totalRain7d: number;
  crops: { id: string; name: string; emoji: string; score: number }[];
  planted?: string[];
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function getProfile(): Profile {
  if (typeof window === "undefined") return { onboarded: false };
  return safeParse(localStorage.getItem(PROFILE_KEY), { onboarded: false });
}

export function setProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function updateProfile(patch: Partial<Profile>) {
  const p = { ...getProfile(), ...patch };
  setProfile(p);
  void pushProfile(p);
  return p;
}

export function getSaved(): SavedRecommendation[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(SAVED_KEY), [] as SavedRecommendation[]);
}

function writeSaved(list: SavedRecommendation[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 200)));
}

export function saveRecommendation(rec: Omit<SavedRecommendation, "id" | "createdAt">) {
  const list = getSaved();
  const item: SavedRecommendation = { ...rec, id: crypto.randomUUID(), createdAt: Date.now() };
  list.unshift(item);
  writeSaved(list);
  void pushSaved(item);
  return item;
}

export function deleteSaved(id: string) {
  writeSaved(getSaved().filter((s) => s.id !== id));
  void withUser(async (userId) => {
    await supabase.from("saved_recommendations").delete().eq("id", id).eq("user_id", userId);
  });
}

export function togglePlanted(savedId: string, cropId: string) {
  const list = getSaved();
  const s = list.find((x) => x.id === savedId);
  if (!s) return;
  s.planted = s.planted ?? [];
  s.planted = s.planted.includes(cropId)
    ? s.planted.filter((c) => c !== cropId)
    : [...s.planted, cropId];
  writeSaved(list);
  const planted = s.planted;
  void withUser(async (userId) => {
    await supabase.from("saved_recommendations").update({ planted }).eq("id", savedId).eq("user_id", userId);
  });
}

export function cacheWeather(key: string, data: unknown) {
  try { localStorage.setItem(CACHE_KEY + ":" + key, JSON.stringify({ t: Date.now(), data })); } catch {}
}

export function readCachedWeather<T>(key: string, maxAgeMs = 6 * 60 * 60 * 1000): T | null {
  const raw = safeParse<{ t: number; data: T } | null>(
    typeof window === "undefined" ? null : localStorage.getItem(CACHE_KEY + ":" + key),
    null,
  );
  if (!raw) return null;
  if (Date.now() - raw.t > maxAgeMs) return raw.data; // return stale but usable offline
  return raw.data;
}

/* ------------------------------------------------------------------ */
/* Cloud sync (only active when the farmer is signed in)               */
/* ------------------------------------------------------------------ */

async function withUser<T>(fn: (userId: string) => Promise<T>): Promise<T | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return null;
    return await fn(userId);
  } catch {
    return null;
  }
}

async function pushProfile(p: Profile) {
  await withUser(async (userId) => {
    await supabase.from("profiles").upsert({
      id: userId,
      name: p.name ?? null,
      location_name: p.location?.name ?? null,
      latitude: p.location?.latitude ?? null,
      longitude: p.location?.longitude ?? null,
      soil: p.soil ?? null,
      updated_at: new Date().toISOString(),
    });
  });
}

async function pushSaved(item: SavedRecommendation) {
  await withUser(async (userId) => {
    await supabase.from("saved_recommendations").insert({
      id: item.id,
      user_id: userId,
      location_name: item.location.name,
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      soil: item.soil,
      avg_temp_c: item.avgTempC,
      total_rain_7d: item.totalRain7d,
      crops: item.crops,
      planted: item.planted ?? [],
      created_at: new Date(item.createdAt).toISOString(),
    });
  });
}

/** Pull the signed-in farmer's cloud data down into local storage. */
export async function syncFromCloud(): Promise<void> {
  await withUser(async (userId) => {
    const [{ data: prof }, { data: rows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("saved_recommendations").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    const local = getProfile();
    if (prof && (prof.latitude != null || prof.soil)) {
      setProfile({
        onboarded: true,
        name: prof.name ?? local.name,
        soil: (prof.soil as SoilType) ?? local.soil,
        location:
          prof.latitude != null && prof.longitude != null
            ? { name: prof.location_name ?? "My farm", latitude: prof.latitude, longitude: prof.longitude }
            : local.location,
      });
    } else if (local.onboarded) {
      // First sign-in on a fresh account: push what we already have up.
      await pushProfile(local);
    }

    const cloudSaved: SavedRecommendation[] = (rows ?? []).map((r) => ({
      id: r.id,
      createdAt: new Date(r.created_at).getTime(),
      location: { name: r.location_name, latitude: r.latitude, longitude: r.longitude },
      soil: r.soil as SoilType,
      avgTempC: r.avg_temp_c,
      totalRain7d: r.total_rain_7d,
      crops: (r.crops ?? []) as SavedRecommendation["crops"],
      planted: r.planted ?? [],
    }));

    const cloudIds = new Set(cloudSaved.map((s) => s.id));
    const localOnly = getSaved().filter((s) => !cloudIds.has(s.id));
    for (const item of localOnly) await pushSaved(item);

    writeSaved([...localOnly, ...cloudSaved].sort((a, b) => b.createdAt - a.createdAt));
  });
}

export function clearLocalData() {
  localStorage.removeItem(SAVED_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

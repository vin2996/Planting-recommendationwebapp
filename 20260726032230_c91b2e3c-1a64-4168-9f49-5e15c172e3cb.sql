CREATE TABLE public.translations (
  id uuid primary key default gen_random_uuid(),
  lang text not null,
  source_hash text not null,
  source text not null,
  translated text not null,
  created_at timestamptz not null default now(),
  unique (lang, source_hash)
);
GRANT SELECT ON public.translations TO anon;
GRANT SELECT ON public.translations TO authenticated;
GRANT ALL ON public.translations TO service_role;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translations are public to read" ON public.translations FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX translations_lang_idx ON public.translations (lang);
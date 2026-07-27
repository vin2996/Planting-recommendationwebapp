export interface Language {
  code: string;
  label: string; // native name
  english: string;
  flag: string;
  rtl?: boolean;
}

/** Languages offered in the app. English is the source language. */
export const LANGUAGES: Language[] = [
  { code: "en", label: "English", english: "English", flag: "🇬🇧" },
  { code: "sw", label: "Kiswahili", english: "Swahili", flag: "🇰🇪" },
  { code: "fr", label: "Français", english: "French", flag: "🇫🇷" },
  { code: "es", label: "Español", english: "Spanish", flag: "🇪🇸" },
  { code: "pt", label: "Português", english: "Portuguese", flag: "🇵🇹" },
  { code: "tl", label: "Tagalog", english: "Tagalog (Filipino)", flag: "🇵🇭" },
  { code: "ceb", label: "Bisaya", english: "Cebuano (Bisaya)", flag: "🇵🇭" },
  { code: "id", label: "Bahasa Indonesia", english: "Indonesian", flag: "🇮🇩" },
  { code: "hi", label: "हिन्दी", english: "Hindi", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", english: "Bengali", flag: "🇧🇩" },
  { code: "ta", label: "தமிழ்", english: "Tamil", flag: "🇮🇳" },
  { code: "ur", label: "اردو", english: "Urdu", flag: "🇵🇰", rtl: true },
  { code: "ar", label: "العربية", english: "Arabic", flag: "🇸🇦", rtl: true },
  { code: "am", label: "አማርኛ", english: "Amharic", flag: "🇪🇹" },
  { code: "ha", label: "Hausa", english: "Hausa", flag: "🇳🇬" },
  { code: "yo", label: "Yorùbá", english: "Yoruba", flag: "🇳🇬" },
  { code: "ig", label: "Igbo", english: "Igbo", flag: "🇳🇬" },
  { code: "zu", label: "isiZulu", english: "Zulu", flag: "🇿🇦" },
  { code: "vi", label: "Tiếng Việt", english: "Vietnamese", flag: "🇻🇳" },
  { code: "th", label: "ไทย", english: "Thai", flag: "🇹🇭" },
  { code: "km", label: "ភាសាខ្មែរ", english: "Khmer", flag: "🇰🇭" },
  { code: "ne", label: "नेपाली", english: "Nepali", flag: "🇳🇵" },
  { code: "my", label: "မြန်မာ", english: "Burmese", flag: "🇲🇲" },
  { code: "zh", label: "中文", english: "Chinese (Simplified)", flag: "🇨🇳" },
];

export function getLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

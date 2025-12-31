import type { Language } from "./types";

const PLACEHOLDER_QUOTES = {
  en: [
    {
      content: "The universe is full of magical things...",
      author: "Unknown",
    },
    {
      content: "Every moment is a fresh beginning...",
      author: "Ancient Proverb",
    },
    {
      content: "In the middle of difficulty lies opportunity...",
      author: "Wise One",
    },
    {
      content: "The only true wisdom is knowing you know nothing...",
      author: "Philosopher",
    },
    {
      content: "What we think, we become...",
      author: "Master",
    },
    {
      content: "The journey is the reward...",
      author: "Traveler",
    },
    {
      content: "Stars can't shine without darkness...",
      author: "Dreamer",
    },
    {
      content: "Be the change you wish to see...",
      author: "Sage",
    },
  ],
  hu: [
    {
      content: "Az univerzum tele van varázslatos dolgokkal...",
      author: "Ismeretlen",
    },
    {
      content: "Minden pillanat új kezdet...",
      author: "Ősi közmondás",
    },
    {
      content: "A nehézségek közepén ott rejlik a lehetőség...",
      author: "Bölcs",
    },
    {
      content: "Az egyetlen igazi bölcsesség az, ha tudod, hogy semmit sem tudsz...",
      author: "Filozófus",
    },
    {
      content: "Amire gondolunk, azzá válunk...",
      author: "Mester",
    },
    {
      content: "Az út maga a jutalom...",
      author: "Utazó",
    },
    {
      content: "A csillagok nem ragyoghatnak sötétség nélkül...",
      author: "Álmodó",
    },
    {
      content: "Te légy a változás, amit a világban látni szeretnél...",
      author: "Bölcs",
    },
  ],
} as const;

export function getPlaceholderQuotes(language: Language) {
  return PLACEHOLDER_QUOTES[language] ?? PLACEHOLDER_QUOTES.en;
}

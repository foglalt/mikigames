import type { Language } from "./types";

const PLACEHOLDER_QUOTES = {
  en: [
    {
      title: "Mystery Quote",
      content: "The universe is full of magical things...",
      author: "Unknown",
    },
    {
      title: "Hidden Wisdom",
      content: "Every moment is a fresh beginning...",
      author: "Ancient Proverb",
    },
    {
      title: "Secret Words",
      content: "In the middle of difficulty lies opportunity...",
      author: "Wise One",
    },
    {
      title: "Lost Knowledge",
      content: "The only true wisdom is knowing you know nothing...",
      author: "Philosopher",
    },
    {
      title: "Ancient Truth",
      content: "What we think, we become...",
      author: "Master",
    },
    {
      title: "Timeless Insight",
      content: "The journey is the reward...",
      author: "Traveler",
    },
    {
      title: "Forgotten Lore",
      content: "Stars can't shine without darkness...",
      author: "Dreamer",
    },
    {
      title: "Sacred Text",
      content: "Be the change you wish to see...",
      author: "Sage",
    },
  ],
  hu: [
    {
      title: "Rejtélyes idézet",
      content: "Az univerzum tele van varázslatos dolgokkal...",
      author: "Ismeretlen",
    },
    {
      title: "Rejtett bölcsesség",
      content: "Minden pillanat új kezdet...",
      author: "Ősi közmondás",
    },
    {
      title: "Titkos szavak",
      content: "A nehézségek közepén ott rejlik a lehetőség...",
      author: "Bölcs",
    },
    {
      title: "Elveszett tudás",
      content: "Az egyetlen igazi bölcsesség az, ha tudod, hogy semmit sem tudsz...",
      author: "Filozófus",
    },
    {
      title: "Ősi igazság",
      content: "Amire gondolunk, azzá válunk...",
      author: "Mester",
    },
    {
      title: "Időtlen felismerés",
      content: "Az út maga a jutalom...",
      author: "Utazó",
    },
    {
      title: "Elfeledett tudás",
      content: "A csillagok nem ragyoghatnak sötétség nélkül...",
      author: "Álmodó",
    },
    {
      title: "Szent szöveg",
      content: "Te légy a változás, amit a világban látni szeretnél...",
      author: "Bölcs",
    },
  ],
} as const;

export function getPlaceholderQuotes(language: Language) {
  return PLACEHOLDER_QUOTES[language] ?? PLACEHOLDER_QUOTES.en;
}

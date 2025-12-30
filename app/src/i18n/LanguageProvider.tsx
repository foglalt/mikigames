"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { Language } from "@/types";
import type { TranslationKey } from "./translations";
import { translations } from "./translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "mikigames_language";

function resolveStoredLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "hu" || stored === "en" ? stored : "en";
}

function interpolate(
  template: string,
  vars?: Record<string, string>
): string {
  if (!vars) return template;
  return Object.keys(vars).reduce(
    (value, key) => value.replaceAll(`{${key}}`, vars[key]),
    template
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    resolveStoredLanguage()
  );

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const t = useMemo(() => {
    const dictionary = translations[language];
    return (key: TranslationKey, vars?: Record<string, string>) =>
      interpolate(dictionary[key], vars);
  }, [language]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

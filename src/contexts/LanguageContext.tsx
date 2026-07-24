"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import en from "./translations/en";
import type { Translations } from "./translations/en";

export type Lang = "en" | "th" | "zh";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [translations, setTranslations] = useState<Translations>(en);

  const loadLang = async (l: Lang) => {
    setLangState(l);
    if (l === "en") {
      setTranslations(en);
    } else {
      try {
        const mod = await import(`./translations/${l}`);
        setTranslations(mod.default);
      } catch (err) {
        console.error(`Failed to load translations for ${l}:`, err);
        setTranslations(en);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: loadLang, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

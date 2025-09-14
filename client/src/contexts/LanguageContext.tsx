import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LanguageContextType {
  language: "bn" | "en";
  toggleLanguage: () => void;
  t: (bnText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<"bn" | "en">("bn");

  const toggleLanguage = () => {
    const newLanguage = language === "bn" ? "en" : "bn";
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    document.documentElement.lang = newLanguage;
  };

  const t = (bnText: string, enText: string) => {
    return language === "bn" ? bnText : enText;
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "bn" | "en";
    if (savedLanguage) {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

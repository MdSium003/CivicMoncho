import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="relative w-16 h-7 bg-red-500 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 flex items-center"
      data-testid="language-toggle"
    >
      {/* Sliding indicator */}
      <div
        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
          language === "en" ? "translate-x-8" : "translate-x-0.5"
        }`}
      >
        <span className="text-xs font-medium text-gray-800">
          {language === "bn" ? "বাং" : "EN"}
        </span>
      </div>
      
      {/* Background text */}
      <div className="flex w-full justify-between px-2 text-white text-xs font-medium">
        <span className={`transition-opacity duration-300 ${language === "bn" ? "opacity-0" : "opacity-100"}`}>
          বাং
        </span>
        <span className={`transition-opacity duration-300 ${language === "en" ? "opacity-0" : "opacity-100"}`}>
          EN
        </span>
      </div>
    </button>
  );
}

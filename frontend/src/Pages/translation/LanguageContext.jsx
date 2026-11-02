import React, { createContext, useState, useContext } from "react";
import { t, setLanguage, getCurrentLanguage } from "./translation";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getCurrentLanguage());

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setLanguageState(newLanguage);
  };

  const translate = (key) => t(key);

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

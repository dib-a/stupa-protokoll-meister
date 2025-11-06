import React, { createContext, useContext, useState, useEffect } from "react";

export interface GlobalEmailSettings {
  senderEmail: string;
  senderName: string;
  collectorEmail: string;
}

interface SettingsContextType {
  emailSettings: GlobalEmailSettings | null;
  updateEmailSettings: (settings: GlobalEmailSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emailSettings, setEmailSettings] = useState<GlobalEmailSettings | null>(() => {
    const stored = localStorage.getItem("globalEmailSettings");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (emailSettings) {
      localStorage.setItem("globalEmailSettings", JSON.stringify(emailSettings));
    }
  }, [emailSettings]);

  const updateEmailSettings = (settings: GlobalEmailSettings) => {
    setEmailSettings(settings);
  };

  return (
    <SettingsContext.Provider value={{ emailSettings, updateEmailSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

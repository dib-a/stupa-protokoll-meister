import React, { createContext, useContext, useState, useEffect } from "react";
import { Sitzung, Role } from "@/types/sitzung";

interface SitzungenContextType {
  sitzungen: Sitzung[];
  addSitzung: (sitzung: Omit<Sitzung, "id" | "createdAt" | "updatedAt">) => string;
  updateSitzung: (id: string, updates: Partial<Sitzung>) => void;
  deleteSitzung: (id: string) => void;
  getSitzung: (id: string) => Sitzung | undefined;
}

const SitzungenContext = createContext<SitzungenContextType | undefined>(undefined);

export const useSitzungen = () => {
  const context = useContext(SitzungenContext);
  if (!context) {
    throw new Error("useSitzungen must be used within SitzungenProvider");
  }
  return context;
};

export const SitzungenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sitzungen, setSitzungen] = useState<Sitzung[]>(() => {
    const stored = localStorage.getItem("sitzungen");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("sitzungen", JSON.stringify(sitzungen));
  }, [sitzungen]);

  const addSitzung = (sitzung: Omit<Sitzung, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const defaultRoles: Role[] = [
      { id: "1", name: "Referent", color: "primary", canVote: true, isDefault: true },
      { id: "2", name: "Mitglied", color: "secondary", canVote: true, isDefault: true },
      { id: "3", name: "Gast", color: "muted", canVote: false, isDefault: true },
      { id: "4", name: "Ehrenmitglied", color: "accent", canVote: false, isDefault: true },
    ];
    const newSitzung: Sitzung = {
      ...sitzung,
      id: crypto.randomUUID(),
      roles: sitzung.roles?.length > 0 ? sitzung.roles : defaultRoles,
      createdAt: now,
      updatedAt: now,
    };
    setSitzungen((prev) => [...prev, newSitzung]);
    return newSitzung.id;
  };

  const updateSitzung = (id: string, updates: Partial<Sitzung>) => {
    setSitzungen((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      )
    );
  };

  const deleteSitzung = (id: string) => {
    setSitzungen((prev) => prev.filter((s) => s.id !== id));
  };

  const getSitzung = (id: string) => {
    return sitzungen.find((s) => s.id === id);
  };

  return (
    <SitzungenContext.Provider
      value={{ sitzungen, addSitzung, updateSitzung, deleteSitzung, getSitzung }}
    >
      {children}
    </SitzungenContext.Provider>
  );
};

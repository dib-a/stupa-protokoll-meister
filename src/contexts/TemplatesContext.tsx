import React, { createContext, useContext, useState, useEffect } from "react";

export interface Template {
  id: string;
  name: string;
  description: string;
  agendaItems: Array<{ title: string }>;
}

interface TemplatesContextType {
  templates: Template[];
  addTemplate: (template: Omit<Template, "id">) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => Template | undefined;
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

export const useTemplates = () => {
  const context = useContext(TemplatesContext);
  if (!context) {
    throw new Error("useTemplates must be used within TemplatesProvider");
  }
  return context;
};

export const TemplatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const stored = localStorage.getItem("sitzung-templates");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load templates");
      }
    }
    // Default empty template
    return [{
      id: "empty",
      name: "Leere Sitzung",
      description: "Sitzung ohne vordefinierte Tagesordnungspunkte",
      agendaItems: []
    }];
  });

  useEffect(() => {
    localStorage.setItem("sitzung-templates", JSON.stringify(templates));
  }, [templates]);

  const addTemplate = (template: Omit<Template, "id">) => {
    const newTemplate = {
      ...template,
      id: crypto.randomUUID(),
    };
    setTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTemplate = (id: string) => {
    // Don't allow deleting the empty template
    if (id === "empty") return;
    setTemplates(templates.filter(t => t.id !== id));
  };

  const getTemplate = (id: string) => {
    return templates.find(t => t.id === id);
  };

  return (
    <TemplatesContext.Provider value={{ templates, addTemplate, updateTemplate, deleteTemplate, getTemplate }}>
      {children}
    </TemplatesContext.Provider>
  );
};

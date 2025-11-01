import { AgendaItem, Role } from "./sitzung";

export interface SitzungTemplate {
  id: string;
  name: string;
  description: string;
  agendaItems: Omit<AgendaItem, "id">[];
  roles?: Role[];
}

export const TEMPLATE_CATEGORIES = {
  STANDARD: "standard",
  FINANCE: "finance",
  SPECIAL: "special",
} as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[keyof typeof TEMPLATE_CATEGORIES];

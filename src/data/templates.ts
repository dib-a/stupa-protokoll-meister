import { SitzungTemplate, TEMPLATE_CATEGORIES } from "@/types/templates";

export const SITZUNG_TEMPLATES: SitzungTemplate[] = [
  {
    id: "standard-weekly",
    name: "Standard Wochensitzung",
    description: "Reguläre wöchentliche StuPa-Sitzung mit Standardtagesordnung",
    roles: [
      { id: "mitglied", name: "Mitglied", color: "primary", canVote: true, isDefault: true },
      { id: "gast", name: "Gast", color: "secondary", canVote: false, isDefault: false },
    ],
    agendaItems: [
      {
        title: "Eröffnung und Begrüßung",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Feststellung der Beschlussfähigkeit",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Genehmigung der Tagesordnung",
        votingResult: { ja: 0, nein: 0, enthaltungen: 0 },
        notes: "",
        completed: false,
      },
      {
        title: "Genehmigung des letzten Protokolls",
        votingResult: { ja: 0, nein: 0, enthaltungen: 0 },
        notes: "",
        completed: false,
      },
      {
        title: "Berichte",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Anträge und Beschlüsse",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Verschiedenes",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Festlegung des nächsten Sitzungstermins",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Schließung der Sitzung",
        votingResult: null,
        notes: "",
        completed: false,
      },
    ],
  },
  {
    id: "finance-session",
    name: "Finanzsitzung",
    description: "Sitzung mit Fokus auf Haushalts- und Finanzfragen",
    roles: [
      { id: "mitglied", name: "Mitglied", color: "primary", canVote: true, isDefault: true },
      { id: "gast", name: "Gast", color: "secondary", canVote: false, isDefault: false },
    ],
    agendaItems: [
      {
        title: "Eröffnung und Begrüßung",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Feststellung der Beschlussfähigkeit",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Genehmigung der Tagesordnung",
        votingResult: { ja: 0, nein: 0, enthaltungen: 0 },
        notes: "",
        completed: false,
      },
      {
        title: "Bericht des Finanzreferats",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Haushaltsplanung",
        votingResult: { ja: 0, nein: 0, enthaltungen: 0 },
        notes: "",
        completed: false,
      },
      {
        title: "Finanzanträge",
        votingResult: { ja: 0, nein: 0, enthaltungen: 0 },
        notes: "",
        completed: false,
      },
      {
        title: "Mittelfreigaben",
        votingResult: { ja: 0, nein: 0, enthaltungen: 0 },
        notes: "",
        completed: false,
      },
      {
        title: "Verschiedenes",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Festlegung des nächsten Sitzungstermins",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Schließung der Sitzung",
        votingResult: null,
        notes: "",
        completed: false,
      },
    ],
  },
  {
    id: "special-election",
    name: "Wahlsitzung",
    description: "Sitzung für Wahlen und Besetzungen",
    roles: [
      { id: "mitglied", name: "Mitglied", color: "primary", canVote: true, isDefault: true },
      { id: "gast", name: "Gast", color: "secondary", canVote: false, isDefault: false },
    ],
    agendaItems: [
      {
        title: "Eröffnung und Begrüßung",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Feststellung der Beschlussfähigkeit",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Genehmigung der Tagesordnung",
        votingResult: { ja: 0, nein: 0, enthaltungen: 0 },
        notes: "",
        completed: false,
      },
      {
        title: "Vorstellung der Kandidat*innen",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Wahl der Referatsleitung",
        votingResult: { ja: 0, nein: 0, enthaltungen: 0 },
        notes: "",
        completed: false,
      },
      {
        title: "Bestätigung der Wahl",
        votingResult: { ja: 0, nein: 0, enthaltungen: 0 },
        notes: "",
        completed: false,
      },
      {
        title: "Verschiedenes",
        votingResult: null,
        notes: "",
        completed: false,
      },
      {
        title: "Schließung der Sitzung",
        votingResult: null,
        notes: "",
        completed: false,
      },
    ],
  },
  {
    id: "blank",
    name: "Leere Sitzung",
    description: "Beginnen Sie mit einer leeren Tagesordnung",
    roles: [
      { id: "mitglied", name: "Mitglied", color: "primary", canVote: true, isDefault: true },
      { id: "gast", name: "Gast", color: "secondary", canVote: false, isDefault: false },
    ],
    agendaItems: [],
  },
];

export const getTemplateById = (id: string): SitzungTemplate | undefined => {
  return SITZUNG_TEMPLATES.find((template) => template.id === id);
};

import { Sitzung } from "./sitzung";

export interface SitzungSnapshot {
  id: string;
  timestamp: string;
  label: string;
  data: Omit<Sitzung, "id" | "createdAt" | "updatedAt">;
  autoSave: boolean;
}

export interface VersionHistory {
  sitzungId: string;
  snapshots: SitzungSnapshot[];
  maxSnapshots: number;
}

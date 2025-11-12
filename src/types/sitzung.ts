export type SitzungStatus = "planned" | "invited" | "ongoing" | "completed";

export interface Participant {
  id: string;
  name: string;
  role: string;
  present: boolean;
}

export interface VotingResult {
  ja: number;
  nein: number;
  enthaltungen: number;
}

export type AntragType = "voting" | "input";

export interface Antrag {
  id: string;
  title: string;
  type: AntragType;
  votingResult: VotingResult | null;
  inputResult: string;
  notes: string;
  completed: boolean;
}

export interface AgendaItem {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  documentName?: string;
  document?: File;
  antraege: Antrag[];
  isAntraegeSection?: boolean;
}

export interface MeetingTime {
  opening?: string;
  pauses: Array<{ start: string; end?: string }>;
  closing?: string;
}

export interface Role {
  id: string;
  name: string;
  color: "primary" | "secondary" | "accent" | "success" | "warning" | "destructive" | "muted";
  canVote: boolean;
  isDefault: boolean;
}

export interface Sitzung {
  id: string;
  title: string;
  date: string;
  time: string;
  status: SitzungStatus;
  participants: Participant[];
  agendaItems: AgendaItem[];
  meetingTimes: MeetingTime;
  nextMeetingDate: string;
  documents: File[];
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

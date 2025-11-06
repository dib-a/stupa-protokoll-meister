export type SitzungStatus = "planned" | "ongoing" | "completed";

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

export interface AgendaItem {
  id: string;
  title: string;
  votingResult: VotingResult | null;
  notes: string;
  completed: boolean;
  documentName?: string;
  document?: File;
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

export interface EmailSettings {
  senderEmail: string;
  senderName: string;
  replyTo?: string;
}

export interface Sitzung {
  id: string;
  title: string;
  date: string;
  status: SitzungStatus;
  participants: Participant[];
  agendaItems: AgendaItem[];
  meetingTimes: MeetingTime;
  nextMeetingDate: string;
  documents: File[];
  roles: Role[];
  emailSettings?: EmailSettings;
  createdAt: string;
  updatedAt: string;
}

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MeetingNavigation } from "@/components/MeetingNavigation";
import { AttendanceManager } from "@/components/AttendanceManager";
import { AgendaManager } from "@/components/AgendaManager";
import { ProtocolPreview } from "@/components/ProtocolPreview";
import { DocumentManager } from "@/components/DocumentManager";
import { MeetingTimeTracker } from "@/components/MeetingTimeTracker";

export type Participant = {
  id: string;
  name: string;
  role: "Stupa-Mitglied" | "Gast" | "Referent*in / AStA";
  present: boolean;
};

export type AgendaItem = {
  id: string;
  title: string;
  votingResult: {
    ja: number;
    nein: number;
    enthaltungen: number;
  } | null;
  notes: string;
  completed: boolean;
};

export type MeetingData = {
  participants: Participant[];
  agendaItems: AgendaItem[];
  meetingTimes: {
    opening?: string;
    pauses: Array<{ start: string; end?: string }>;
    closing?: string;
  };
  nextMeetingDate?: string;
  documents: File[];
};

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"attendance" | "agenda" | "protocol">("attendance");
  const [meetingData, setMeetingData] = useState<MeetingData>({
    participants: [],
    agendaItems: [],
    meetingTimes: {
      pauses: []
    },
    documents: []
  });

  const updateMeetingData = (updates: Partial<MeetingData>) => {
    setMeetingData(prev => ({ ...prev, ...updates }));
  };

  const getQuorumStatus = () => {
    const stupaMembers = meetingData.participants.filter(p => p.role === "Stupa-Mitglied" && p.present);
    const totalStupaMembers = meetingData.participants.filter(p => p.role === "Stupa-Mitglied");
    const hasQuorum = stupaMembers.length >= Math.ceil(totalStupaMembers.length / 2);
    return { hasQuorum, present: stupaMembers.length, total: totalStupaMembers.length };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Stupa-Sitzungsprotokoll</h1>
          <p className="text-primary-foreground/80 mt-2">
            Studentischer Parlamentssitzung - Protokoll-Assistent
          </p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <MeetingNavigation 
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                quorumStatus={getQuorumStatus()}
              />
              <div className="mt-6 pt-6 border-t">
                <MeetingTimeTracker 
                  meetingTimes={meetingData.meetingTimes}
                  onUpdate={(times) => updateMeetingData({ meetingTimes: times })}
                />
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentStep === "attendance" && (
              <AttendanceManager
                participants={meetingData.participants}
                onUpdate={(participants) => updateMeetingData({ participants })}
                quorumStatus={getQuorumStatus()}
              />
            )}

            {currentStep === "agenda" && (
              <div className="space-y-8">
                <DocumentManager 
                  documents={meetingData.documents}
                  onUpdate={(documents) => updateMeetingData({ documents })}
                />
                <AgendaManager
                  agendaItems={meetingData.agendaItems}
                  onUpdate={(agendaItems) => updateMeetingData({ agendaItems })}
                />
              </div>
            )}

            {currentStep === "protocol" && (
              <ProtocolPreview 
                meetingData={meetingData}
                onNextMeetingDateChange={(date) => updateMeetingData({ nextMeetingDate: date })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
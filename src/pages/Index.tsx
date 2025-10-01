import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MeetingNavigation } from "@/components/MeetingNavigation";
import { AttendanceManager } from "@/components/AttendanceManager";
import { AgendaManager } from "@/components/AgendaManager";
import { ProtocolPreview } from "@/components/ProtocolPreview";
import { DocumentManager } from "@/components/DocumentManager";
import { MeetingTimeTracker } from "@/components/MeetingTimeTracker";
import { ProtocolUploader } from "@/components/ProtocolUploader";
import { Role } from "@/components/RoleManager";
import stupaLogo from "@/assets/stupa-logo-transparent.png";

export type Participant = {
  id: string;
  name: string;
  role: string; // Now accepts any role name
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
  documentName?: string; // PDF filename if this TOP is created from a document
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
  roles: Role[];
};

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"attendance" | "agenda" | "protocol">("attendance");
  
  // Default roles
  const defaultRoles: Role[] = [
    { id: "1", name: "Stupa-Mitglied", color: "primary", canVote: true, isDefault: true },
    { id: "2", name: "Referent*in / AStA", color: "accent", canVote: false, isDefault: true },
    { id: "3", name: "Gast", color: "muted", canVote: false, isDefault: true }
  ];

  const [meetingData, setMeetingData] = useState<MeetingData>({
    participants: [],
    agendaItems: [],
    meetingTimes: {
      pauses: []
    },
    documents: [],
    roles: defaultRoles
  });

  const updateMeetingData = (updates: Partial<MeetingData>) => {
    setMeetingData(prev => ({ ...prev, ...updates }));
  };

  const handleDocumentUpdate = (documents: File[]) => {
    const previousDocs = meetingData.documents;
    const newDocs = documents.filter(doc => !previousDocs.some(prevDoc => prevDoc.name === doc.name));
    
    // Create agenda items for new PDFs
    const newAgendaItems = newDocs.map(doc => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: doc.name.replace('.pdf', ''),
      votingResult: null,
      notes: '',
      completed: false,
      documentName: doc.name
    }));

    updateMeetingData({ 
      documents,
      agendaItems: [...meetingData.agendaItems, ...newAgendaItems]
    });
  };

  const getQuorumStatus = () => {
    const votingRoles = meetingData.roles.filter(role => role.canVote).map(role => role.name);
    const votingMembers = meetingData.participants.filter(p => votingRoles.includes(p.role) && p.present);
    const totalVotingMembers = meetingData.participants.filter(p => votingRoles.includes(p.role));
    const hasQuorum = votingMembers.length >= Math.ceil(totalVotingMembers.length / 2);
    return { hasQuorum, present: votingMembers.length, total: totalVotingMembers.length };
  };

  const handleProtocolLoad = (loadedData: any) => {
    setMeetingData(prev => ({
      ...prev,
      participants: loadedData.participants || prev.participants,
      agendaItems: loadedData.agendaItems || prev.agendaItems,
      meetingTimes: loadedData.meetingTimes || prev.meetingTimes,
      nextMeetingDate: loadedData.nextMeetingDate || prev.nextMeetingDate,
      roles: loadedData.roles || prev.roles
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <img src={stupaLogo} alt="StuPa Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-3xl font-bold">Stupa-Sitzungsprotokoll</h1>
              <p className="text-primary-foreground/80 mt-2">
                Studentischer Parlamentssitzung - Protokoll-Assistent
              </p>
            </div>
          </div>
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
                roles={meetingData.roles}
                onRolesUpdate={(roles) => updateMeetingData({ roles })}
              />
            )}

            {currentStep === "agenda" && (
              <div className="space-y-8">
                <DocumentManager 
                  documents={meetingData.documents}
                  onUpdate={handleDocumentUpdate}
                />
                <AgendaManager
                  agendaItems={meetingData.agendaItems}
                  onUpdate={(agendaItems) => updateMeetingData({ agendaItems })}
                  eligibleVoters={getQuorumStatus().present}
                />
              </div>
            )}

            {currentStep === "protocol" && (
              <div className="space-y-6">
                <ProtocolUploader onProtocolLoad={handleProtocolLoad} />
                <ProtocolPreview 
                  meetingData={meetingData}
                  onNextMeetingDateChange={(date) => updateMeetingData({ nextMeetingDate: date })}
                  onEndMeeting={() => {
                    const formatCurrentTime = () => {
                      return new Date().toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                    };
                    
                    let updatedPauses = [...meetingData.meetingTimes.pauses];
                    const lastPause = updatedPauses[updatedPauses.length - 1];
                    if (lastPause && !lastPause.end) {
                      lastPause.end = formatCurrentTime();
                    }
                    
                    updateMeetingData({ 
                      meetingTimes: {
                        ...meetingData.meetingTimes,
                        pauses: updatedPauses,
                        closing: formatCurrentTime()
                      }
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
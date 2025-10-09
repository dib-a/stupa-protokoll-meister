import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSitzungen } from "@/contexts/SitzungenContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceManager } from "@/components/AttendanceManager";
import { AgendaManager } from "@/components/AgendaManager";
import { DocumentManager } from "@/components/DocumentManager";
import { MeetingTimeTracker } from "@/components/MeetingTimeTracker";
import { ProtocolPreview } from "@/components/ProtocolPreview";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { SitzungStatus, AgendaItem, Participant, Role, MeetingTime } from "@/types/sitzung";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusConfig: Record<SitzungStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  planned: { label: "Geplant", variant: "outline" },
  ongoing: { label: "Laufend", variant: "secondary" },
  completed: { label: "Abgeschlossen", variant: "default" },
};

export default function SitzungDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSitzung, updateSitzung } = useSitzungen();
  const [activeTab, setActiveTab] = useState("attendance");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const sitzung = id ? getSitzung(id) : undefined;

  useEffect(() => {
    if (!sitzung) {
      navigate("/");
    }
  }, [sitzung, navigate]);

  if (!sitzung) {
    return null;
  }

  const getQuorumStatus = () => {
    const votingRoles = sitzung.roles.filter(r => r.canVote).map(r => r.name);
    const present = sitzung.participants.filter(
      p => votingRoles.includes(p.role) && p.present
    ).length;
    const total = sitzung.participants.filter(
      p => votingRoles.includes(p.role)
    ).length;
    const hasQuorum = present >= total / 2;
    return { hasQuorum, present, total };
  };

  const getEligibleVoters = () => {
    const votingRoles = sitzung.roles.filter(r => r.canVote).map(r => r.name);
    return sitzung.participants.filter(
      p => votingRoles.includes(p.role) && p.present
    ).length;
  };

  const handleUpdateParticipants = (participants: Participant[]) => {
    updateSitzung(sitzung.id, { participants });
  };

  const handleUpdateAgenda = (agendaItems: AgendaItem[]) => {
    updateSitzung(sitzung.id, { agendaItems });
  };

  const handleUpdateMeetingTimes = (meetingTimes: MeetingTime) => {
    updateSitzung(sitzung.id, { meetingTimes });
  };

  const handleUpdateNextMeeting = (date: string) => {
    updateSitzung(sitzung.id, { nextMeetingDate: date });
  };

  const handleUpdateDocuments = (documents: File[]) => {
    updateSitzung(sitzung.id, { documents });
  };

  const handleUpdateRoles = (roles: Role[]) => {
    updateSitzung(sitzung.id, { roles });
  };

  const handleUpdateTitle = (title: string) => {
    updateSitzung(sitzung.id, { title });
  };

  const handleUpdateStatus = (status: SitzungStatus) => {
    updateSitzung(sitzung.id, { status });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{sitzung.title}</h1>
              <Badge variant={statusConfig[sitzung.status].variant}>
                {statusConfig[sitzung.status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(sitzung.date), "PPPP", { locale: de })}
            </p>
          </div>
        </div>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sitzungseinstellungen</DialogTitle>
              <DialogDescription>
                Bearbeiten Sie die grundlegenden Einstellungen dieser Sitzung
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titel</Label>
                <Input
                  id="edit-title"
                  value={sitzung.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={sitzung.status} onValueChange={handleUpdateStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Geplant</SelectItem>
                    <SelectItem value="ongoing">Laufend</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="attendance">Anwesenheit</TabsTrigger>
          <TabsTrigger value="agenda">Tagesordnung</TabsTrigger>
          <TabsTrigger value="protocol">Protokoll</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <AttendanceManager
            participants={sitzung.participants}
            onUpdate={handleUpdateParticipants}
            quorumStatus={getQuorumStatus()}
            roles={sitzung.roles}
            onRolesUpdate={handleUpdateRoles}
          />
          <MeetingTimeTracker
            meetingTimes={sitzung.meetingTimes}
            onUpdate={handleUpdateMeetingTimes}
          />
        </TabsContent>

        <TabsContent value="agenda" className="space-y-6">
          <DocumentManager 
            documents={sitzung.documents}
            onUpdate={handleUpdateDocuments}
          />
          <AgendaManager
            agendaItems={sitzung.agendaItems}
            onUpdate={handleUpdateAgenda}
            eligibleVoters={getEligibleVoters()}
            isMeetingActive={sitzung.status === "ongoing"}
          />
        </TabsContent>

        <TabsContent value="protocol">
          <ProtocolPreview
            meetingData={{
              participants: sitzung.participants,
              agendaItems: sitzung.agendaItems,
              meetingTimes: sitzung.meetingTimes,
              nextMeetingDate: sitzung.nextMeetingDate,
              documents: sitzung.documents,
              roles: sitzung.roles,
            }}
            onNextMeetingDateChange={handleUpdateNextMeeting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

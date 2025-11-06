import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSitzungen } from "@/contexts/SitzungenContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Settings, Save, Keyboard, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceManager } from "@/components/AttendanceManager";
import { AgendaManager } from "@/components/AgendaManager";
import { DocumentManager } from "@/components/DocumentManager";
import { MeetingTimeTracker } from "@/components/MeetingTimeTracker";
import { ProtocolPreview } from "@/components/ProtocolPreview";
import { EmailSettings } from "@/components/EmailSettings";
import { EmailInvitations } from "@/components/EmailInvitations";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { SitzungStatus, AgendaItem, Participant, Role, MeetingTime } from "@/types/sitzung";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useVersionHistory } from "@/hooks/useVersionHistory";
import { VersionHistoryDialog } from "@/components/VersionHistoryDialog";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const { emailSettings, updateEmailSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("attendance");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const sitzung = id ? getSitzung(id) : undefined;

  const {
    snapshots,
    createSnapshot,
    deleteSnapshot,
    getSnapshot,
    lastAutoSave,
  } = useVersionHistory(id || "", sitzung!);

  const handleRestoreSnapshot = (snapshot: any) => {
    if (!id) return;
    updateSitzung(id, snapshot.data);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "1",
      altKey: true,
      handler: () => {
        setActiveTab("attendance");
        toast.success("Zu Anwesenheit gewechselt");
      },
      description: "Zur Anwesenheit wechseln",
    },
    {
      key: "2",
      altKey: true,
      handler: () => {
        setActiveTab("agenda");
        toast.success("Zur Tagesordnung gewechselt");
      },
      description: "Zur Tagesordnung wechseln",
    },
    {
      key: "3",
      altKey: true,
      handler: () => {
        setActiveTab("protocol");
        toast.success("Zum Protokoll gewechselt");
      },
      description: "Zum Protokoll wechseln",
    },
    {
      key: "s",
      ctrlKey: true,
      handler: () => {
        if (sitzung) {
          createSnapshot(`Manueller Save - ${format(new Date(), "HH:mm:ss")}`);
          toast.success("Snapshot erstellt");
        }
      },
      description: "Snapshot erstellen",
    },
    {
      key: "h",
      ctrlKey: true,
      handler: () => navigate("/"),
      description: "Zurück zur Übersicht",
    },
    {
      key: "/",
      ctrlKey: true,
      handler: () => setShortcutsOpen(true),
      description: "Tastaturkürzel anzeigen",
    },
    {
      key: "v",
      ctrlKey: true,
      shiftKey: true,
      handler: () => setHistoryOpen(true),
      description: "Versionshistorie öffnen",
    },
  ]);

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
    <TooltipProvider>
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
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setHistoryOpen(true)}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Versionshistorie (Strg+Shift+V)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShortcutsOpen(true)}>
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tastaturkürzel (Strg+/)</p>
              </TooltipContent>
            </Tooltip>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Einstellungen</DialogTitle>
              <DialogDescription>
                Verwalten Sie Sitzungs- und globale E-Mail-Einstellungen
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Allgemein</TabsTrigger>
                <TabsTrigger value="email">E-Mail (Global)</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4 py-4">
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
              </TabsContent>
              <TabsContent value="email" className="py-4">
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Diese Einstellungen gelten für die gesamte Anwendung und alle Sitzungen.
                  </p>
                </div>
                <EmailSettings
                  settings={emailSettings}
                  onSave={updateEmailSettings}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
          </Dialog>
          </div>
        </div>

        <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tastaturkürzel</DialogTitle>
              <DialogDescription>
                Verwenden Sie diese Tastenkombinationen für schnellere Navigation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Navigation</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Anwesenheit</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + 1</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tagesordnung</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + 2</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protokoll</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + 3</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zur Übersicht</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Strg + H</kbd>
                    </div>
                  </div>
                </div>
                  <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Aktionen</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Snapshot erstellen</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Strg + S</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Versionshistorie</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Strg + Shift + V</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tastaturkürzel</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Strg + /</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Erstellen (Eingabe)</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <VersionHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          snapshots={snapshots}
          onRestore={handleRestoreSnapshot}
          onDelete={deleteSnapshot}
          onCreateSnapshot={(label) => createSnapshot(label)}
          lastAutoSave={lastAutoSave}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="attendance">Anwesenheit</TabsTrigger>
          <TabsTrigger value="agenda">Tagesordnung</TabsTrigger>
          <TabsTrigger value="protocol">Protokoll</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Einladungen versenden</CardTitle>
              <CardDescription>
                E-Mail-Einladung an die zentrale Sammeladresse senden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailInvitations
                participants={sitzung.participants}
                meetingTitle={sitzung.title}
                meetingDate={sitzung.date}
                senderEmail={emailSettings?.senderEmail}
                senderName={emailSettings?.senderName}
                collectorEmail={emailSettings?.collectorEmail}
                onEmailSettingsClick={() => setSettingsOpen(true)}
              />
            </CardContent>
          </Card>
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
    </TooltipProvider>
  );
}

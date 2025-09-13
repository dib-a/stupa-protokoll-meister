import { useState } from "react";
import { Download, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MeetingData } from "@/pages/Index";

type ProtocolPreviewProps = {
  meetingData: MeetingData;
  onNextMeetingDateChange: (date: string) => void;
};

export const ProtocolPreview = ({ meetingData, onNextMeetingDateChange }: ProtocolPreviewProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentDate = () => {
    return formatDate(new Date());
  };

  const generateProtocolText = () => {
    const currentDate = getCurrentDate();
    const presentMembers = meetingData.participants.filter(p => p.present);
    const stupaMembers = presentMembers.filter(p => p.role === "Stupa-Mitglied");
    const guests = presentMembers.filter(p => p.role === "Gast");
    const asta = presentMembers.filter(p => p.role === "Referent*in / AStA");

    let protocol = `PROTOKOLL
Sitzung des Studierendenparlaments
${currentDate}

ANWESENHEIT:
Stupa-Mitglieder (${stupaMembers.length}):
${stupaMembers.map(p => `• ${p.name}`).join('\n')}

`;

    if (asta.length > 0) {
      protocol += `Referent*innen / AStA (${asta.length}):
${asta.map(p => `• ${p.name}`).join('\n')}

`;
    }

    if (guests.length > 0) {
      protocol += `Gäste (${guests.length}):
${guests.map(p => `• ${p.name}`).join('\n')}

`;
    }

    protocol += `BESCHLUSSFÄHIGKEIT: ${stupaMembers.length >= Math.ceil(meetingData.participants.filter(p => p.role === "Stupa-Mitglied").length / 2) ? "GEGEBEN" : "NICHT GEGEBEN"}

`;

    if (meetingData.meetingTimes.opening) {
      protocol += `SITZUNGSZEITEN:
Eröffnung: ${meetingData.meetingTimes.opening} Uhr
`;

      if (meetingData.meetingTimes.pauses.length > 0) {
        protocol += `Pausen:\n`;
        meetingData.meetingTimes.pauses.forEach((pause, index) => {
          protocol += `  ${pause.start} - ${pause.end || "offen"} Uhr\n`;
        });
      }

      if (meetingData.meetingTimes.closing) {
        protocol += `Schluss: ${meetingData.meetingTimes.closing} Uhr\n`;
      }
      protocol += '\n';
    }

    protocol += `TAGESORDNUNG:

`;

    meetingData.agendaItems.forEach((item, index) => {
      protocol += `TOP ${index + 1}: ${item.title}\n`;
      
      if (item.votingResult) {
        const { ja, nein, enthaltungen } = item.votingResult;
        const total = ja + nein + enthaltungen;
        const result = ja > nein ? "ANGENOMMEN" : "ABGELEHNT";
        
        protocol += `Abstimmungsergebnis: ${ja} Ja, ${nein} Nein, ${enthaltungen} Enthaltungen (${total} Stimmen)
Ergebnis: ${result}\n`;
      }
      
      if (item.notes) {
        protocol += `Anmerkung: ${item.notes}\n`;
      }
      
      protocol += '\n';
    });

    if (meetingData.nextMeetingDate) {
      protocol += `NÄCHSTE SITZUNG: ${meetingData.nextMeetingDate}\n\n`;
    }

    protocol += `Protokoll erstellt am: ${new Date().toLocaleString('de-DE')}`;

    return protocol;
  };

  const exportProtocol = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const protocolText = generateProtocolText();
    const blob = new Blob([protocolText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Stupa-Protokoll_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  const getCompletionStats = () => {
    const totalItems = meetingData.agendaItems.length;
    const completedItems = meetingData.agendaItems.filter(item => item.completed).length;
    const hasAttendance = meetingData.participants.length > 0;
    const hasTimes = !!meetingData.meetingTimes.opening;
    
    return { totalItems, completedItems, hasAttendance, hasTimes };
  };

  const stats = getCompletionStats();
  const isReadyForExport = stats.hasAttendance && stats.totalItems > 0;

  return (
    <div className="space-y-6">
      {/* Export Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Protokoll-Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{meetingData.participants.filter(p => p.present).length}</div>
              <div className="text-sm text-muted-foreground">Anwesend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-agenda-active">{stats.totalItems}</div>
              <div className="text-sm text-muted-foreground">TOPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-agenda-completed">{stats.completedItems}</div>
              <div className="text-sm text-muted-foreground">Abgeschlossen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {stats.totalItems > 0 ? Math.round((stats.completedItems / stats.totalItems) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Fortschritt</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={stats.hasAttendance ? "default" : "outline"}>
              {stats.hasAttendance ? "✓" : "○"} Teilnehmerliste
            </Badge>
            <Badge variant={stats.totalItems > 0 ? "default" : "outline"}>
              {stats.totalItems > 0 ? "✓" : "○"} Tagesordnung
            </Badge>
            <Badge variant={stats.hasTimes ? "default" : "outline"}>
              {stats.hasTimes ? "✓" : "○"} Sitzungszeiten
            </Badge>
          </div>

          <Button 
            onClick={exportProtocol}
            disabled={!isReadyForExport || isExporting}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Wird erstellt..." : "Protokoll exportieren"}
          </Button>
        </CardContent>
      </Card>

      {/* Next Meeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Nächste Sitzung</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Datum der nächsten Sitzung</Label>
            <Input
              type="text"
              value={meetingData.nextMeetingDate || ""}
              onChange={(e) => onNextMeetingDateChange(e.target.value)}
              placeholder="z.B. Montag, 15. Januar 2024, 14:00 Uhr"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Protocol Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Protokoll-Vorschau</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {generateProtocolText()}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
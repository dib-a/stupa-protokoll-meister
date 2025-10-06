import { useState } from "react";
import { Download, Calendar, FileText, Square, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MeetingData } from "@/pages/Index";
import jsPDF from "jspdf";

type ProtocolPreviewProps = {
  meetingData: MeetingData;
  onNextMeetingDateChange: (date: string) => void;
  onEndMeeting?: () => void;
};

export const ProtocolPreview = ({ meetingData, onNextMeetingDateChange, onEndMeeting }: ProtocolPreviewProps) => {
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

═══════════════════════════════════════════════════

SITZUNGSZEITEN:
${meetingData.meetingTimes.opening ? `Beginn: ${meetingData.meetingTimes.opening} Uhr` : 'Beginn: [Noch nicht erfasst]'}
${meetingData.meetingTimes.closing ? `Ende: ${meetingData.meetingTimes.closing} Uhr` : 'Ende: [Sitzung läuft]'}
${meetingData.meetingTimes.pauses.length > 0 ? `\nPausen:` : ''}${meetingData.meetingTimes.pauses.map((pause, index) => `\n  • ${pause.start} - ${pause.end || "läuft"} Uhr`).join('')}

═══════════════════════════════════════════════════

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

═══════════════════════════════════════════════════
`;

    protocol += `TAGESORDNUNG:

`;

    meetingData.agendaItems.forEach((item, index) => {
      protocol += `TOP ${index + 1}: ${item.title}\n`;
      
      if (item.documentName) {
        protocol += `Dokument: ${item.documentName}\n`;
      }
      
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

    // Add documents section at the end
    const documentsWithTops = meetingData.agendaItems.filter(item => item.documentName);
    if (documentsWithTops.length > 0) {
      protocol += `ANLAGEN:\n`;
      documentsWithTops.forEach((item, index) => {
        const topNumber = meetingData.agendaItems.findIndex(a => a.id === item.id) + 1;
        protocol += `TOP ${topNumber}: ${item.documentName}\n`;
      });
      protocol += '\n';
    }

    protocol += `Protokoll erstellt am: ${new Date().toLocaleString('de-DE')}`;

    return protocol;
  };

  const exportProtocolPDF = async () => {
    setIsExporting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const doc = new jsPDF();
    const protocolText = generateProtocolText();
    const lines = protocolText.split('\n');
    
    let y = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    doc.setFont("helvetica");
    
    lines.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }
      
      // Handle special formatting
      if (line.includes('PROTOKOLL') || line.includes('═══')) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
      } else if (line.startsWith('TOP ') || line.includes('SITZUNGSZEITEN:') || line.includes('ANWESENHEIT:') || line.includes('TAGESORDNUNG:') || line.includes('ANLAGEN:')) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
      }
      
      // Split long lines to fit page width
      const splitText = doc.splitTextToSize(line || ' ', 170);
      splitText.forEach((textLine: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = 20;
        }
        doc.text(textLine, 20, y);
        y += lineHeight;
      });
    });
    
    doc.save(`Stupa-Protokoll_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsExporting(false);
  };

  const exportProtocolTXT = async () => {
    setIsExporting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
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

  const canEndMeeting = meetingData.meetingTimes.opening && !meetingData.meetingTimes.closing;

  return (
    <div className="space-y-6">
      {/* Export Status */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Protokoll-Status</span>
            </div>
            {canEndMeeting && onEndMeeting && (
              <Button 
                onClick={onEndMeeting}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                Sitzung beenden
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">{meetingData.participants.filter(p => p.present).length}</div>
              <div className="text-sm text-muted-foreground mt-1">Anwesend</div>
            </div>
            <div className="text-center p-4 bg-agenda-active/5 rounded-lg">
              <div className="text-3xl font-bold text-agenda-active">{stats.totalItems}</div>
              <div className="text-sm text-muted-foreground mt-1">TOPs</div>
            </div>
            <div className="text-center p-4 bg-agenda-completed/5 rounded-lg">
              <div className="text-3xl font-bold text-agenda-completed">{stats.completedItems}</div>
              <div className="text-sm text-muted-foreground mt-1">Abgeschlossen</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-3xl font-bold text-accent">
                {stats.totalItems > 0 ? Math.round((stats.completedItems / stats.totalItems) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Fortschritt</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant={stats.hasAttendance ? "default" : "outline"} className="text-sm py-1">
              {stats.hasAttendance ? "✓" : "○"} Teilnehmerliste
            </Badge>
            <Badge variant={stats.totalItems > 0 ? "default" : "outline"} className="text-sm py-1">
              {stats.totalItems > 0 ? "✓" : "○"} Tagesordnung
            </Badge>
            <Badge variant={stats.hasTimes ? "default" : "outline"} className="text-sm py-1">
              {stats.hasTimes ? "✓" : "○"} Sitzungszeiten
            </Badge>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={exportProtocolPDF}
              disabled={!isReadyForExport || isExporting}
              className="flex-1"
              size="lg"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {isExporting ? "Wird erstellt..." : "Als PDF exportieren"}
            </Button>
            <Button 
              onClick={exportProtocolTXT}
              disabled={!isReadyForExport || isExporting}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Wird erstellt..." : "Als TXT exportieren"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Meeting */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="bg-gradient-to-r from-accent/5 to-accent/10">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-accent" />
            <span>Nächste Sitzung</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div>
            <Label className="text-sm font-medium">Datum der nächsten Sitzung</Label>
            <Input
              type="text"
              value={meetingData.nextMeetingDate || ""}
              onChange={(e) => onNextMeetingDateChange(e.target.value)}
              placeholder="z.B. Montag, 15. Januar 2024, 14:00 Uhr"
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Protocol Preview */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-secondary/10">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-secondary" />
            <span>Protokoll-Vorschau</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-muted/40 p-6 rounded-lg max-h-[600px] overflow-y-auto border border-border/50">
            <div className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {generateProtocolText().split('\n').map((line, index) => {
                // Check if this line contains a document name that should be clickable
                const docMatch = line.match(/^Dokument: (.+)$/);
                if (docMatch) {
                  const docName = docMatch[1];
                  const document = meetingData.documents.find(doc => doc.name === docName);
                  if (document) {
                    const url = URL.createObjectURL(document);
                    return (
                      <div key={index}>
                        Dokument: <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline cursor-pointer"
                        >
                          {docName}
                        </a>
                      </div>
                    );
                  }
                }
                
                // Check for document links in the attachments section
                const topDocMatch = line.match(/^TOP (\d+): (.+\.pdf)$/);
                if (topDocMatch) {
                  const docName = topDocMatch[2];
                  const document = meetingData.documents.find(doc => doc.name === docName);
                  if (document) {
                    const url = URL.createObjectURL(document);
                    return (
                      <div key={index}>
                        TOP {topDocMatch[1]}: <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline cursor-pointer"
                        >
                          {docName}
                        </a>
                      </div>
                    );
                  }
                }
                
                return <div key={index}>{line}</div>;
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
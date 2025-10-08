import { useState } from "react";
import { Download, Calendar, FileText, Square, FileDown, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MeetingData } from "@/pages/Index";
import jsPDF from "jspdf";
import stupaLogo from "@/assets/stupa-logo-transparent.png";

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
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    let y = 20;
    const lineHeight = 6;
    
    // Helper function to draw separator line
    const drawSeparator = () => {
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    };
    
    // Helper function to check if new page is needed
    const checkPageBreak = (spaceNeeded: number = 15) => {
      if (y > pageHeight - margin - spaceNeeded) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };
    
    // Add logo
    const logoWidth = 30;
    const logoHeight = 30;
    doc.addImage(stupaLogo, 'PNG', margin, y, logoWidth, logoHeight);
    
    // Add header title next to logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("PROTOKOLL", margin + logoWidth + 10, y + 10);
    doc.setFontSize(12);
    doc.text("Sitzung des Studierendenparlaments", margin + logoWidth + 10, y + 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(getCurrentDate(), margin + logoWidth + 10, y + 25);
    
    y += logoHeight + 10;
    drawSeparator();
    
    // Meeting times section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("SITZUNGSZEITEN", margin, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    const openingTime = meetingData.meetingTimes.opening ? `${meetingData.meetingTimes.opening} Uhr` : '[Noch nicht erfasst]';
    const closingTime = meetingData.meetingTimes.closing ? `${meetingData.meetingTimes.closing} Uhr` : '[Sitzung läuft]';
    
    doc.text(`Beginn: ${openingTime}`, margin + 5, y);
    y += lineHeight;
    doc.text(`Ende: ${closingTime}`, margin + 5, y);
    y += lineHeight;
    
    if (meetingData.meetingTimes.pauses.length > 0) {
      y += 3;
      doc.text("Pausen:", margin + 5, y);
      y += lineHeight;
      meetingData.meetingTimes.pauses.forEach((pause) => {
        doc.text(`  • ${pause.start} - ${pause.end || "läuft"} Uhr`, margin + 5, y);
        y += lineHeight;
      });
    }
    
    y += 5;
    drawSeparator();
    
    // Attendance section
    checkPageBreak();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("ANWESENHEIT", margin, y);
    y += 8;
    
    const presentMembers = meetingData.participants.filter(p => p.present);
    const stupaMembers = presentMembers.filter(p => p.role === "Stupa-Mitglied");
    const guests = presentMembers.filter(p => p.role === "Gast");
    const asta = presentMembers.filter(p => p.role === "Referent*in / AStA");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Stupa-Mitglieder (${stupaMembers.length}):`, margin + 5, y);
    y += lineHeight + 1;
    
    doc.setFont("helvetica", "normal");
    stupaMembers.forEach((p) => {
      checkPageBreak();
      doc.text(`• ${p.name}`, margin + 10, y);
      y += lineHeight;
    });
    
    if (asta.length > 0) {
      y += 3;
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text(`Referent*innen / AStA (${asta.length}):`, margin + 5, y);
      y += lineHeight + 1;
      
      doc.setFont("helvetica", "normal");
      asta.forEach((p) => {
        checkPageBreak();
        doc.text(`• ${p.name}`, margin + 10, y);
        y += lineHeight;
      });
    }
    
    if (guests.length > 0) {
      y += 3;
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text(`Gäste (${guests.length}):`, margin + 5, y);
      y += lineHeight + 1;
      
      doc.setFont("helvetica", "normal");
      guests.forEach((p) => {
        checkPageBreak();
        doc.text(`• ${p.name}`, margin + 10, y);
        y += lineHeight;
      });
    }
    
    // Quorum
    y += 5;
    const totalStupaMembers = meetingData.participants.filter(p => p.role === "Stupa-Mitglied").length;
    const isQuorum = stupaMembers.length >= Math.ceil(totalStupaMembers / 2);
    doc.setFont("helvetica", "bold");
    if (isQuorum) {
      doc.setTextColor(0, 120, 0);
    } else {
      doc.setTextColor(200, 0, 0);
    }
    doc.text(`BESCHLUSSFÄHIGKEIT: ${isQuorum ? "GEGEBEN" : "NICHT GEGEBEN"}`, margin + 5, y);
    doc.setTextColor(80, 80, 80);
    y += 8;
    
    drawSeparator();
    
    // Agenda section
    checkPageBreak();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("TAGESORDNUNG", margin, y);
    y += 10;
    
    meetingData.agendaItems.forEach((item, index) => {
      checkPageBreak(25);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(`TOP ${index + 1}: ${item.title}`, margin + 5, y);
      y += lineHeight + 2;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      if (item.documentName) {
        doc.text(`Dokument: ${item.documentName}`, margin + 10, y);
        y += lineHeight + 1;
      }
      
      if (item.votingResult) {
        const { ja, nein, enthaltungen } = item.votingResult;
        const total = ja + nein + enthaltungen;
        const result = ja > nein ? "ANGENOMMEN" : "ABGELEHNT";
        
        doc.text(`Abstimmung: ${ja} Ja, ${nein} Nein, ${enthaltungen} Enthaltungen (${total} Stimmen)`, margin + 10, y);
        y += lineHeight;
        
        doc.setFont("helvetica", "bold");
        if (ja > nein) {
          doc.setTextColor(0, 120, 0);
        } else {
          doc.setTextColor(200, 0, 0);
        }
        doc.text(`Ergebnis: ${result}`, margin + 10, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        y += lineHeight + 1;
      }
      
      if (item.notes) {
        const noteLines = doc.splitTextToSize(`Anmerkung: ${item.notes}`, contentWidth - 15);
        noteLines.forEach((line) => {
          checkPageBreak();
          doc.text(line, margin + 10, y);
          y += lineHeight;
        });
        y += 1;
      }
      
      y += 4;
    });
    
    // Next meeting
    if (meetingData.nextMeetingDate) {
      y += 3;
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text("NÄCHSTE SITZUNG", margin + 5, y);
      y += lineHeight + 2;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(meetingData.nextMeetingDate, margin + 10, y);
      y += 8;
    }
    
    // Attachments section
    const documentsWithTops = meetingData.agendaItems.filter(item => item.documentName);
    if (documentsWithTops.length > 0) {
      y += 5;
      checkPageBreak();
      drawSeparator();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text("ANLAGEN", margin, y);
      y += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      documentsWithTops.forEach((item) => {
        checkPageBreak();
        const topNumber = meetingData.agendaItems.findIndex(a => a.id === item.id) + 1;
        doc.text(`TOP ${topNumber}: ${item.documentName}`, margin + 5, y);
        y += lineHeight;
      });
    }
    
    // Footer with timestamp
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "italic");
    const timestamp = `Protokoll erstellt am: ${new Date().toLocaleString('de-DE')}`;
    doc.text(timestamp, margin, pageHeight - 10);
    
    doc.save(`Stupa-Protokoll_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsExporting(false);
  };

  const exportMeetingDataJSON = async () => {
    setIsExporting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const jsonData = JSON.stringify(meetingData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Stupa-Sitzung_${new Date().toISOString().split('T')[0]}.json`;
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

          <div className="flex flex-col gap-3">
            <Button 
              onClick={exportProtocolPDF}
              disabled={!isReadyForExport || isExporting}
              className="w-full"
              size="lg"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {isExporting ? "Wird erstellt..." : "Protokoll als PDF exportieren"}
            </Button>
            <Button 
              onClick={exportMeetingDataJSON}
              disabled={isExporting}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isExporting ? "Wird gespeichert..." : "Sitzungsdaten speichern (JSON)"}
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
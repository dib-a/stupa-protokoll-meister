import { useState } from "react";
import { Download, Calendar, FileText, Square, FileDown, Save, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MeetingData } from "@/pages/Index";
import jsPDF from "jspdf";
import stupaLogo from "@/assets/stupa-logo-transparent.png";
import { PDFViewer } from "@/components/PDFViewer";

type ProtocolPreviewProps = {
  meetingData: MeetingData;
  onNextMeetingDateChange: (date: string) => void;
  onEndMeeting?: () => void;
  meetingStatus?: string;
};

export const ProtocolPreview = ({ meetingData, onNextMeetingDateChange, onEndMeeting, meetingStatus = "planned" }: ProtocolPreviewProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<File | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleViewDocument = (docName: string) => {
    const document = meetingData.documents.find(doc => doc.name === docName);
    if (document) {
      setViewingDocument(document);
      setIsViewerOpen(true);
    }
  };

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
    const mitglieder = presentMembers.filter(p => p.role === "Mitglied");
    const guests = presentMembers.filter(p => p.role === "Gast");

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
Mitglieder (${mitglieder.length}):
${mitglieder.map(p => `• ${p.name}`).join('\n')}

`;

    if (guests.length > 0) {
      protocol += `Gäste (${guests.length}):
${guests.map(p => `• ${p.name}`).join('\n')}

`;
    }

    protocol += `BESCHLUSSFÄHIGKEIT: ${mitglieder.length >= Math.ceil(meetingData.participants.filter(p => p.role === "Mitglied").length / 2) ? "GEGEBEN" : "NICHT GEGEBEN"}

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
    const lineHeight = 7;
    
    // Professional color palette - minimal colors
    const colors = {
      text: [30, 30, 30] as [number, number, number],        // Dark gray for main text
      textLight: [100, 100, 100] as [number, number, number], // Medium gray for secondary text
      border: [200, 200, 200] as [number, number, number]     // Light gray for borders
    };
    
    // Helper function to draw simple separator
    const drawSeparator = () => {
      doc.setDrawColor(...colors.border);
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
    
    // Add logo with proper rectangular aspect ratio
    const logoWidth = 50;
    const logoHeight = 30;
    doc.addImage(stupaLogo, 'PNG', margin, y, logoWidth, logoHeight, undefined, 'FAST');
    
    // Professional header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...colors.text);
    doc.text("PROTOKOLL", margin + logoWidth + 12, y + 10);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sitzung des Studierendenparlaments", margin + logoWidth + 12, y + 18);
    
    doc.setFontSize(9);
    doc.setTextColor(...colors.textLight);
    doc.text(getCurrentDate(), margin + logoWidth + 12, y + 25);
    
    y += logoHeight + 15;
    drawSeparator();
    
    // Meeting times section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colors.text);
    doc.text("SITZUNGSZEITEN", margin, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    
    const openingTime = meetingData.meetingTimes.opening ? `${meetingData.meetingTimes.opening} Uhr` : '[Noch nicht erfasst]';
    const closingTime = meetingData.meetingTimes.closing ? `${meetingData.meetingTimes.closing} Uhr` : '[Sitzung läuft]';
    
    doc.text(`Beginn: ${openingTime}`, margin + 5, y);
    y += lineHeight;
    doc.text(`Ende: ${closingTime}`, margin + 5, y);
    y += lineHeight;
    
    if (meetingData.meetingTimes.pauses.length > 0) {
      y += 2;
      doc.text("Pausen:", margin + 5, y);
      y += lineHeight;
      meetingData.meetingTimes.pauses.forEach((pause) => {
        doc.text(`  ${pause.start} - ${pause.end || "läuft"} Uhr`, margin + 5, y);
        y += lineHeight;
      });
    }
    
    y += 8;
    drawSeparator();
    
    // Attendance section
    checkPageBreak();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colors.text);
    doc.text("ANWESENHEIT", margin, y);
    y += 10;
    
    const presentMembers = meetingData.participants.filter(p => p.present);
    const mitglieder = presentMembers.filter(p => p.role === "Mitglied");
    const guests = presentMembers.filter(p => p.role === "Gast");
    
    // Mitglieder section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    doc.text(`Mitglieder (${mitglieder.length}):`, margin + 5, y);
    y += lineHeight + 2;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    mitglieder.forEach((p) => {
      checkPageBreak();
      doc.text(`  ${p.name}`, margin + 5, y);
      y += lineHeight;
    });
    
    if (guests.length > 0) {
      y += 3;
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text(`Gäste (${guests.length}):`, margin + 5, y);
      y += lineHeight + 2;
      
      doc.setFont("helvetica", "normal");
      guests.forEach((p) => {
        checkPageBreak();
        doc.text(`  ${p.name}`, margin + 5, y);
        y += lineHeight;
      });
    }
    
    // Quorum
    y += 5;
    const totalMitglieder = meetingData.participants.filter(p => p.role === "Mitglied").length;
    const isQuorum = mitglieder.length >= Math.ceil(totalMitglieder / 2);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    const quorumText = `Beschlussfähigkeit: ${isQuorum ? "gegeben" : "nicht gegeben"}`;
    doc.text(quorumText, margin + 5, y);
    y += 10;
    
    drawSeparator();
    
    // Agenda section
    checkPageBreak();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colors.text);
    doc.text("TAGESORDNUNG", margin, y);
    y += 10;
    
    meetingData.agendaItems.forEach((item, index) => {
      checkPageBreak(25);
      
      // TOP heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);
      doc.text(`TOP ${index + 1}: ${item.title}`, margin + 5, y);
      y += lineHeight + 2;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      if (item.documentName) {
        doc.setTextColor(...colors.textLight);
        doc.text(`Dokument: ${item.documentName}`, margin + 10, y);
        y += lineHeight + 1;
      }
      
      if (item.votingResult) {
        const { ja, nein, enthaltungen } = item.votingResult;
        const result = ja > nein ? "Angenommen" : "Abgelehnt";
        
        doc.setTextColor(...colors.text);
        doc.text(`Abstimmung: ${ja} Ja, ${nein} Nein, ${enthaltungen} Enthaltungen`, margin + 10, y);
        y += lineHeight;
        
        doc.setFont("helvetica", "bold");
        doc.text(`Ergebnis: ${result}`, margin + 10, y);
        doc.setFont("helvetica", "normal");
        y += lineHeight + 1;
      }
      
      if (item.notes) {
        doc.setTextColor(...colors.textLight);
        const noteLines = doc.splitTextToSize(`Anmerkung: ${item.notes}`, contentWidth - 15);
        noteLines.forEach((line) => {
          checkPageBreak();
          doc.text(line, margin + 10, y);
          y += lineHeight;
        });
        y += 1;
      }
      
      y += 5;
    });
    
    // Next meeting
    if (meetingData.nextMeetingDate) {
      checkPageBreak();
      drawSeparator();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);
      doc.text("Nächste Sitzung:", margin + 5, y);
      y += lineHeight + 1;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(meetingData.nextMeetingDate, margin + 5, y);
      y += 8;
    }
    
    // Attachments section
    const documentsWithTops = meetingData.agendaItems.filter(item => item.documentName);
    if (documentsWithTops.length > 0) {
      checkPageBreak();
      drawSeparator();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...colors.text);
      doc.text("ANLAGEN", margin, y);
      y += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      documentsWithTops.forEach((item) => {
        checkPageBreak();
        const topNumber = meetingData.agendaItems.findIndex(a => a.id === item.id) + 1;
        doc.setTextColor(...colors.text);
        doc.text(`TOP ${topNumber}: ${item.documentName}`, margin + 5, y);
        y += lineHeight + 1;
      });
    }
    
    // Footer with timestamp
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    doc.setFontSize(8);
    doc.setTextColor(...colors.textLight);
    doc.setFont("helvetica", "normal");
    const timestamp = `Erstellt am ${new Date().toLocaleString('de-DE')}`;
    doc.text(timestamp, margin, pageHeight - 10);
    
    // Page number
    doc.text(`Seite 1`, pageWidth - margin - 15, pageHeight - 10);
    
    // Export both PDF and JSON automatically
    doc.save(`Stupa-Protokoll_${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Also export JSON automatically after PDF
    await new Promise(resolve => setTimeout(resolve, 300));
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

  const exportMarkdown = async () => {
    setIsExporting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const markdownContent = generateProtocolText()
      .replace(/═+/g, (match) => '-'.repeat(match.length))
      .split('\n')
      .map(line => {
        if (line.startsWith('TOP ')) {
          return `## ${line}`;
        }
        if (line.match(/^[A-ZÄÖÜ\s]+:$/)) {
          return `### ${line}`;
        }
        return line;
      })
      .join('\n');
    
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Stupa-Protokoll_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
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
  const isMeetingCompleted = meetingStatus === "completed";

  const canEndMeeting = meetingData.meetingTimes.opening && !meetingData.meetingTimes.closing;

  return (
    <div className="space-y-6">
      <PDFViewer 
        file={viewingDocument}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setViewingDocument(null);
        }}
      />
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
            {!isMeetingCompleted && (
              <div className="p-3 bg-warning/10 border border-warning rounded-lg text-sm text-warning mb-2">
                ⚠️ Die Sitzung muss abgeschlossen sein, um Protokolle zu exportieren. Setzen Sie den Status auf "Abgeschlossen".
              </div>
            )}
            <Button 
              onClick={exportProtocolPDF}
              disabled={!isReadyForExport || isExporting || !isMeetingCompleted}
              className="w-full"
              size="lg"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {isExporting ? "Wird erstellt..." : "Protokoll als PDF exportieren"}
            </Button>
            <Button 
              onClick={exportMarkdown}
              disabled={!isReadyForExport || isExporting || !isMeetingCompleted}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isExporting ? "Wird erstellt..." : "Als Markdown exportieren"}
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
                    return (
                      <div key={index} className="flex items-center gap-2">
                        Dokument: 
                        <button
                          onClick={() => handleViewDocument(docName)}
                          className="text-primary hover:underline cursor-pointer inline-flex items-center gap-1 hover-accent"
                        >
                          <Eye className="h-3 w-3" />
                          {docName}
                        </button>
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
                    return (
                      <div key={index} className="flex items-center gap-2">
                        TOP {topDocMatch[1]}: 
                        <button
                          onClick={() => handleViewDocument(docName)}
                          className="text-primary hover:underline cursor-pointer inline-flex items-center gap-1 hover-accent"
                        >
                          <Eye className="h-3 w-3" />
                          {docName}
                        </button>
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
import { useState } from "react";
import { Upload, FileText, Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

type ProtocolUploaderProps = {
  onProtocolLoad: (protocolData: any) => void;
};

export const ProtocolUploader = ({ onProtocolLoad }: ProtocolUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedProtocol, setUploadedProtocol] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Configure PDF.js worker - use unpkg as a reliable CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast({
        title: "Dateityp nicht unterstützt",
        description: "Bitte laden Sie eine PDF-Datei hoch.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await extractTextFromPDF(file);
      setUploadedProtocol(text);
      parseProtocol(text);
      
      toast({
        title: "Protokoll geladen",
        description: "Das PDF-Protokoll wurde erfolgreich geladen und kann nun bearbeitet werden.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Laden",
        description: "Das Protokoll konnte nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const parseProtocol = (text: string) => {
    // Simple parsing logic to extract meeting data from protocol text
    const lines = text.split('\n');
    
    // Extract participants
    const participants = [];
    let inAttendanceSection = false;
    
    // Extract agenda items
    const agendaItems = [];
    
    // Parse through lines to reconstruct meeting data
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('ANWESENHEIT:')) {
        inAttendanceSection = true;
        continue;
      }
      
      if (line.startsWith('TOP ') && line.includes(':')) {
        const topMatch = line.match(/^TOP (\d+): (.+)$/);
        if (topMatch) {
          const [, number, title] = topMatch;
          const agendaItem = {
            id: `top-${number}`,
            title: title,
            completed: false,
            notes: "",
            documentName: "",
            votingResult: null
          };
          
          // Look for voting results in subsequent lines
          for (let j = i + 1; j < lines.length && j < i + 5; j++) {
            const nextLine = lines[j].trim();
            if (nextLine.startsWith('Abstimmungsergebnis:')) {
              const voteMatch = nextLine.match(/(\d+) Ja, (\d+) Nein, (\d+) Enthaltungen/);
              if (voteMatch) {
                agendaItem.votingResult = {
                  ja: parseInt(voteMatch[1]),
                  nein: parseInt(voteMatch[2]),
                  enthaltungen: parseInt(voteMatch[3])
                };
                agendaItem.completed = true;
              }
            }
            if (nextLine.startsWith('Dokument:')) {
              agendaItem.documentName = nextLine.replace('Dokument: ', '');
            }
            if (nextLine.startsWith('Anmerkung:')) {
              agendaItem.notes = nextLine.replace('Anmerkung: ', '');
            }
          }
          
          agendaItems.push(agendaItem);
        }
      }
      
      if (inAttendanceSection && line.startsWith('• ')) {
        const name = line.replace('• ', '');
        if (name) {
          participants.push({
            id: `participant-${Date.now()}-${Math.random()}`,
            name: name,
            role: "Stupa-Mitglied", // Default role, could be enhanced
            present: true
          });
        }
      }
      
      if (line.includes('BESCHLUSSFÄHIGKEIT:') || line.includes('SITZUNGSZEITEN:')) {
        inAttendanceSection = false;
      }
    }

    // Create meeting data object
    const meetingData = {
      participants,
      agendaItems,
      documents: [],
      meetingTimes: {
        opening: "",
        closing: "",
        pauses: []
      },
      nextMeetingDate: ""
    };

    onProtocolLoad(meetingData);
  };

  const handleProtocolEdit = () => {
    if (uploadedProtocol) {
      parseProtocol(uploadedProtocol);
      setIsEditing(false);
      toast({
        title: "Änderungen übernommen",
        description: "Das bearbeitete Protokoll wurde geladen.",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Protokoll hochladen & bearbeiten</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Bestehendes Protokoll hochladen (.pdf)</Label>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Laden Sie ein PDF-Protokoll hoch, um es zu bearbeiten oder zu ergänzen.
          </p>
        </div>

        {uploadedProtocol && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Protokoll bearbeiten</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? "Vorschau" : "Bearbeiten"}
              </Button>
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={uploadedProtocol}
                  onChange={(e) => setUploadedProtocol(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Protokoll-Inhalt bearbeiten..."
                />
                <Button onClick={handleProtocolEdit} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Änderungen übernehmen
                </Button>
              </div>
            ) : (
              <div className="bg-muted/30 p-3 rounded-lg max-h-[200px] overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap font-mono">
                  {uploadedProtocol.split('\n').slice(0, 10).join('\n')}
                  {uploadedProtocol.split('\n').length > 10 && '\n...'}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
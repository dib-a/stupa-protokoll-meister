import { useState } from "react";
import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type ProtocolUploaderProps = {
  onProtocolLoad: (protocolData: any) => void;
};

export const ProtocolUploader = ({ onProtocolLoad }: ProtocolUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, 'Type:', file.type);

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast({
        title: "Dateityp nicht unterstützt",
        description: "Bitte laden Sie eine JSON-Datei hoch.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const meetingData = JSON.parse(text);
      
      onProtocolLoad(meetingData);
      
      toast({
        title: "Sitzungsdaten geladen",
        description: "Die Sitzungsdaten wurden erfolgreich geladen.",
      });
    } catch (error) {
      console.error('Upload error details:', error);
      toast({
        title: "Fehler beim Laden",
        description: `Die Datei konnte nicht geladen werden. Stellen Sie sicher, dass es eine gültige JSON-Datei ist.`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Sitzungsdaten laden</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Sitzungsdaten laden (JSON)</Label>
          <Input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Laden Sie eine zuvor exportierte JSON-Datei, um eine Sitzung fortzusetzen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

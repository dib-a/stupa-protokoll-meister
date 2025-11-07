import { useState } from "react";
import { GlobalEmailSettings } from "@/contexts/SettingsContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface EmailSettingsProps {
  settings: GlobalEmailSettings | null;
  onSave: (settings: GlobalEmailSettings) => void;
}

const validateOstfaliaEmail = (email: string): boolean => {
  return email.endsWith("@ostfalia.de");
};

export function EmailSettings({ settings, onSave }: EmailSettingsProps) {
  const [senderName, setSenderName] = useState(settings?.senderName || "");
  const [collectorEmail, setCollectorEmail] = useState(settings?.collectorEmail || "");

  const handleSave = () => {
    if (!validateOstfaliaEmail(collectorEmail)) {
      toast.error("Sammler E-Mail muss mit @ostfalia.de enden");
      return;
    }
    
    onSave({
      senderName,
      collectorEmail,
    });
  };

  const isValid = senderName && collectorEmail;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="senderName">Absender Name *</Label>
        <Input
          id="senderName"
          type="text"
          placeholder="Ihr Name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="collectorEmail">Sammler E-Mail (Empfänger) *</Label>
        <Input
          id="collectorEmail"
          type="email"
          placeholder="sammler@ostfalia.de"
          value={collectorEmail}
          onChange={(e) => setCollectorEmail(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Muss mit @ostfalia.de enden. Alle Einladungen werden an diese Adresse gesendet.
        </p>
      </div>

      <Button onClick={handleSave} className="w-full" disabled={!isValid}>
        <Save className="w-4 h-4 mr-2" />
        E-Mail-Einstellungen speichern
      </Button>
    </div>
  );
}

import { useState } from "react";
import { EmailSettings as EmailSettingsType } from "@/types/sitzung";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface EmailSettingsProps {
  settings?: EmailSettingsType;
  onSave: (settings: EmailSettingsType) => void;
}

export function EmailSettings({ settings, onSave }: EmailSettingsProps) {
  const [senderEmail, setSenderEmail] = useState(settings?.senderEmail || "");
  const [senderName, setSenderName] = useState(settings?.senderName || "");
  const [replyTo, setReplyTo] = useState(settings?.replyTo || "");

  const handleSave = () => {
    onSave({
      senderEmail,
      senderName,
      replyTo: replyTo || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="senderEmail">Absender E-Mail *</Label>
        <Input
          id="senderEmail"
          type="email"
          placeholder="organisation@beispiel.de"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senderName">Absender Name *</Label>
        <Input
          id="senderName"
          type="text"
          placeholder="Organisation Name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="replyTo">Antwort an (optional)</Label>
        <Input
          id="replyTo"
          type="email"
          placeholder="antwort@beispiel.de"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} className="w-full" disabled={!senderEmail || !senderName}>
        <Save className="w-4 h-4 mr-2" />
        E-Mail-Einstellungen speichern
      </Button>
    </div>
  );
}

import { Participant } from "@/types/sitzung";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface EmailInvitationsProps {
  participants: Participant[];
  meetingTitle: string;
  meetingDate: string;
  senderName?: string;
  collectorEmail?: string;
  onEmailSettingsClick: () => void;
}

export function EmailInvitations({
  participants,
  meetingTitle,
  meetingDate,
  senderName,
  collectorEmail,
  onEmailSettingsClick,
}: EmailInvitationsProps) {
  const sendInvitation = () => {
    if (!collectorEmail) {
      toast.error("Bitte konfigurieren Sie zuerst die E-Mail-Einstellungen");
      onEmailSettingsClick();
      return;
    }

    const formattedDate = format(new Date(meetingDate), "EEEE, dd. MMMM yyyy", { locale: de });
    const formattedTime = format(new Date(meetingDate), "HH:mm", { locale: de });
    const subject = encodeURIComponent(`Einladung: ${meetingTitle}`);
    const participantsList = participants.map(p => `${p.name} - ${p.role}`).join('%0D%0A');
    
    const body = 
      `Sehr geehrte Damen und Herren,%0D%0A%0D%0A` +
      `Sie sind herzlich zur folgenden Sitzung eingeladen:%0D%0A%0D%0A` +
      `──────────────────────────────────────────%0D%0A` +
      `SITZUNG: ${meetingTitle}%0D%0A` +
      `DATUM: ${formattedDate}%0D%0A` +
      `UHRZEIT: ${formattedTime} Uhr%0D%0A` +
      `──────────────────────────────────────────%0D%0A%0D%0A` +
      `TEILNEHMER:%0D%0A${participantsList}%0D%0A%0D%0A` +
      `Wir freuen uns auf Ihre Teilnahme.%0D%0A%0D%0A` +
      `Mit freundlichen Grüßen,%0D%0A${senderName}`;

    const mailto = `mailto:${collectorEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    toast.success(`E-Mail-Client wird geöffnet für ${collectorEmail}`);
  };

  if (!collectorEmail) {
    return (
      <div className="text-center space-y-4 p-6 bg-muted/50 rounded-lg">
        <Mail className="w-12 h-12 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Konfigurieren Sie zuerst die globalen E-Mail-Einstellungen, um Einladungen zu versenden.
        </p>
        <Button onClick={onEmailSettingsClick} variant="outline">
          E-Mail-Einstellungen öffnen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <h3 className="font-medium">Einladung an Sammler-Adresse senden</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Empfänger: <span className="font-mono">{collectorEmail}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Die E-Mail enthält alle Teilnehmer und wird an die zentrale Sammeladresse gesendet
          </p>
        </div>
        <Button onClick={sendInvitation} variant="default" size="lg">
          <Send className="w-4 h-4 mr-2" />
          Einladung senden
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Teilnehmer ({participants.length})</h4>
        <div className="grid gap-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div>
                <p className="font-medium">{participant.name}</p>
                <p className="text-sm text-muted-foreground">{participant.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

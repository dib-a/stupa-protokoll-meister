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
  meetingTime: string;
  senderName?: string;
  collectorEmail?: string;
  onEmailSettingsClick: () => void;
  onInvitationSent: () => void;
}

export function EmailInvitations({
  participants,
  meetingTitle,
  meetingDate,
  meetingTime,
  senderName,
  collectorEmail,
  onEmailSettingsClick,
  onInvitationSent,
}: EmailInvitationsProps) {
  const sendInvitation = () => {
    if (!collectorEmail || !senderName) {
      toast.error("E-Mail-Einstellungen nicht konfiguriert");
      onEmailSettingsClick();
      return;
    }

    const formattedDate = format(new Date(meetingDate), "PPPP", { locale: de });
    
    const subject = encodeURIComponent(`Einladung: ${meetingTitle}`);
    
    const participantsList = participants
      .map(p => `${p.name} (${p.role})`)
      .join("%0D%0A  - ");
    
    const body = encodeURIComponent(
      `Sehr geehrte Damen und Herren,

hiermit lade ich Sie zur folgenden Sitzung ein:

Titel: ${meetingTitle}
Datum: ${formattedDate}
Uhrzeit: ${meetingTime} Uhr

Teilnehmer:
  - ${participantsList}

Mit freundlichen Grüßen
${senderName}`
    );

    window.location.href = `mailto:${collectorEmail}?subject=${subject}&body=${body}`;
    onInvitationSent();
    toast.success("E-Mail-Einladung wird geöffnet und Status auf 'Eingeladen' gesetzt");
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

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
  senderEmail?: string;
  senderName?: string;
  onEmailSettingsClick: () => void;
}

export function EmailInvitations({
  participants,
  meetingTitle,
  meetingDate,
  senderEmail,
  senderName,
  onEmailSettingsClick,
}: EmailInvitationsProps) {
  const generateMailtoLink = (participant: Participant) => {
    if (!senderEmail) {
      toast.error("Bitte konfigurieren Sie zuerst die E-Mail-Einstellungen");
      onEmailSettingsClick();
      return;
    }

    const formattedDate = format(new Date(meetingDate), "dd. MMMM yyyy", { locale: de });
    const subject = encodeURIComponent(`Einladung zur Sitzung: ${meetingTitle}`);
    const body = encodeURIComponent(
      `Guten Tag ${participant.name},\n\n` +
      `Sie sind eingeladen zur folgenden Sitzung:\n\n` +
      `Titel: ${meetingTitle}\n` +
      `Datum: ${formattedDate}\n` +
      `Ihre Rolle: ${participant.role}\n\n` +
      `Wir freuen uns auf Ihre Teilnahme.\n\n` +
      `Mit freundlichen Grüßen,\n${senderName || senderEmail}`
    );

    // Note: participant email would need to be added to the Participant type
    // For now, this opens the email client with pre-filled content
    const mailto = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    toast.success(`E-Mail-Client wird geöffnet für ${participant.name}`);
  };

  const sendToAll = () => {
    if (!senderEmail) {
      toast.error("Bitte konfigurieren Sie zuerst die E-Mail-Einstellungen");
      onEmailSettingsClick();
      return;
    }

    const formattedDate = format(new Date(meetingDate), "dd. MMMM yyyy", { locale: de });
    const subject = encodeURIComponent(`Einladung zur Sitzung: ${meetingTitle}`);
    const participantsList = participants.map(p => `- ${p.name} (${p.role})`).join('\n');
    const body = encodeURIComponent(
      `Guten Tag,\n\n` +
      `Sie sind eingeladen zur folgenden Sitzung:\n\n` +
      `Titel: ${meetingTitle}\n` +
      `Datum: ${formattedDate}\n\n` +
      `Teilnehmer:\n${participantsList}\n\n` +
      `Wir freuen uns auf Ihre Teilnahme.\n\n` +
      `Mit freundlichen Grüßen,\n${senderName || senderEmail}`
    );

    const mailto = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    toast.success("E-Mail-Client wird für alle Teilnehmer geöffnet");
  };

  if (!senderEmail) {
    return (
      <div className="text-center space-y-4 p-6 bg-muted/50 rounded-lg">
        <Mail className="w-12 h-12 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Konfigurieren Sie zuerst Ihre E-Mail-Einstellungen, um Einladungen zu versenden.
        </p>
        <Button onClick={onEmailSettingsClick} variant="outline">
          E-Mail-Einstellungen öffnen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Einladungen versenden</h3>
          <p className="text-sm text-muted-foreground">
            Öffnet Ihren E-Mail-Client mit vorausgefüllter Nachricht
          </p>
        </div>
        <Button onClick={sendToAll} variant="default">
          <Send className="w-4 h-4 mr-2" />
          An alle senden
        </Button>
      </div>

      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div>
              <p className="font-medium">{participant.name}</p>
              <p className="text-sm text-muted-foreground">{participant.role}</p>
            </div>
            <Button
              onClick={() => generateMailtoLink(participant)}
              variant="outline"
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Einladung
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

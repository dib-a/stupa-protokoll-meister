import { useNavigate } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { EmailSettings } from "@/components/EmailSettings";
import { TemplateManager } from "@/components/TemplateManager";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const { emailSettings, updateEmailSettings } = useSettings();

  const handleSaveEmailSettings = (settings: any) => {
    updateEmailSettings(settings);
    toast.success("Einstellungen gespeichert");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground mt-1">
            Globale Anwendungseinstellungen verwalten
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-Mail-Einstellungen
            </CardTitle>
            <CardDescription>
              Konfigurieren Sie globale E-Mail-Einstellungen für alle Sitzungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailSettings
              settings={emailSettings}
              onSave={handleSaveEmailSettings}
            />
          </CardContent>
        </Card>

        <TemplateManager />
      </div>
    </div>
  );
}

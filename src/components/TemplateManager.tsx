import { useState } from "react";
import { Plus, Trash2, FileText, Edit2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTemplates, Template } from "@/contexts/TemplatesContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TemplateManager() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [agendaItemsText, setAgendaItemsText] = useState("");

  const resetForm = () => {
    setTemplateName("");
    setTemplateDescription("");
    setAgendaItemsText("");
    setEditingTemplate(null);
  };

  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Bitte geben Sie einen Vorlagennamen ein");
      return;
    }

    const agendaItems = agendaItemsText
      .split("\n")
      .filter(line => line.trim())
      .map(line => ({ title: line.trim() }));

    addTemplate({
      name: templateName.trim(),
      description: templateDescription.trim(),
      agendaItems,
    });

    toast.success("Vorlage erstellt");
    resetForm();
    setIsOpen(false);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !templateName.trim()) return;

    const agendaItems = agendaItemsText
      .split("\n")
      .filter(line => line.trim())
      .map(line => ({ title: line.trim() }));

    updateTemplate(editingTemplate.id, {
      name: templateName.trim(),
      description: templateDescription.trim(),
      agendaItems,
    });

    toast.success("Vorlage aktualisiert");
    resetForm();
  };

  const handleEditClick = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description);
    setAgendaItemsText(template.agendaItems.map(item => item.title).join("\n"));
  };

  const handleDeleteTemplate = (id: string) => {
    if (id === "empty") {
      toast.error("Die leere Vorlage kann nicht gelöscht werden");
      return;
    }
    deleteTemplate(id);
    toast.success("Vorlage gelöscht");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Sitzungsvorlagen
        </CardTitle>
        <CardDescription>
          Erstellen und verwalten Sie Vorlagen für wiederkehrende Sitzungen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Neue Vorlage erstellen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neue Sitzungsvorlage erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine Vorlage mit vordefinierten Tagesordnungspunkten
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Vorlagenname *</Label>
                <Input
                  id="template-name"
                  placeholder="z.B. Regelsitzung"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Beschreibung</Label>
                <Input
                  id="template-description"
                  placeholder="z.B. Wöchentliche StuPa-Sitzung"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agenda-items">Tagesordnungspunkte</Label>
                <Textarea
                  id="agenda-items"
                  placeholder="Ein TOP pro Zeile, z.B.&#10;Begrüßung&#10;Genehmigung des Protokolls&#10;..."
                  value={agendaItemsText}
                  onChange={(e) => setAgendaItemsText(e.target.value)}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  Geben Sie jeden Tagesordnungspunkt in einer neuen Zeile ein
                </p>
              </div>
              <Button onClick={handleCreateTemplate} className="w-full">
                Vorlage erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{template.name}</h4>
                  {template.agendaItems.length > 0 && (
                    <Badge variant="outline">
                      {template.agendaItems.length} TOPs
                    </Badge>
                  )}
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {template.id !== "empty" && (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(template)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Vorlage bearbeiten</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-template-name">Vorlagenname *</Label>
                            <Input
                              id="edit-template-name"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-template-description">Beschreibung</Label>
                            <Input
                              id="edit-template-description"
                              value={templateDescription}
                              onChange={(e) => setTemplateDescription(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-agenda-items">Tagesordnungspunkte</Label>
                            <Textarea
                              id="edit-agenda-items"
                              value={agendaItemsText}
                              onChange={(e) => setAgendaItemsText(e.target.value)}
                              rows={8}
                            />
                          </div>
                          <Button onClick={handleUpdateTemplate} className="w-full">
                            Änderungen speichern
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSitzungen } from "@/contexts/SitzungenContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SITZUNG_TEMPLATES, getTemplateById } from "@/data/templates";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AgendaItem } from "@/types/sitzung";

export default function NewSitzung() {
  const navigate = useNavigate();
  const { addSitzung } = useSitzungen();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("14:00");
  const [selectedTemplate, setSelectedTemplate] = useState("standard-weekly");

  const handleCreate = () => {
    if (!title || !date || !time) return;

    const template = getTemplateById(selectedTemplate);
    const agendaItems: AgendaItem[] = template?.agendaItems.map((item, index) => ({
      ...item,
      id: crypto.randomUUID(),
    })) || [];

    const id = addSitzung({
      title,
      date: date.toISOString(),
      time,
      status: "planned",
      participants: [],
      agendaItems,
      meetingTimes: { pauses: [] },
      nextMeetingDate: "",
      documents: [],
      roles: template?.roles || [],
    });

    navigate(`/sitzung/${id}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Neue Sitzung erstellen</h1>
        <p className="text-muted-foreground">
          Erstellen Sie eine neue StuPa-Sitzung
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sitzungsdetails</CardTitle>
            <CardDescription>
              Geben Sie die grundlegenden Informationen für die neue Sitzung ein
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                placeholder="z.B. StuPa-Sitzung 01/2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && title && date) {
                    handleCreate();
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={de}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Uhrzeit</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Abbrechen
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={!title || !date || !time}
              >
                Erstellen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vorlage wählen</CardTitle>
            <CardDescription>
              Wählen Sie eine Vorlage für die Tagesordnung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <div className="space-y-3">
                {SITZUNG_TEMPLATES.map((template) => (
                  <div key={template.id} className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value={template.id} id={template.id} />
                    <Label
                      htmlFor={template.id}
                      className="font-normal cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4" />
                        <span className="font-semibold">{template.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      {template.agendaItems.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.agendaItems.length} Tagesordnungspunkte
                        </p>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

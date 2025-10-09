import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSitzungen } from "@/contexts/SitzungenContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function NewSitzung() {
  const navigate = useNavigate();
  const { addSitzung } = useSitzungen();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();

  const handleCreate = () => {
    if (!title || !date) return;

    const id = addSitzung({
      title,
      date: date.toISOString(),
      status: "planned",
      participants: [],
      agendaItems: [],
      meetingTimes: { pauses: [] },
      nextMeetingDate: "",
      documents: [],
      roles: [],
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
                />
              </PopoverContent>
            </Popover>
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
              disabled={!title || !date}
            >
              Erstellen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

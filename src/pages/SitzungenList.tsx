import { useSitzungen } from "@/contexts/SitzungenContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, FileText, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SitzungStatus } from "@/types/sitzung";

const statusConfig: Record<SitzungStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  planned: { label: "Geplant", variant: "outline" },
  ongoing: { label: "Laufend", variant: "secondary" },
  completed: { label: "Abgeschlossen", variant: "default" },
};

export default function SitzungenList() {
  const { sitzungen, deleteSitzung } = useSitzungen();
  const navigate = useNavigate();

  const sortedSitzungen = [...sitzungen].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (id: string) => {
    deleteSitzung(id);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sitzungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie alle StuPa-Sitzungen an einem Ort
        </p>
      </div>

      {sitzungen.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Keine Sitzungen vorhanden</h3>
            <p className="text-muted-foreground mb-4">
              Erstellen Sie Ihre erste Sitzung, um zu beginnen.
            </p>
            <Button onClick={() => navigate("/new")}>
              Neue Sitzung erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedSitzungen.map((sitzung) => (
            <Card key={sitzung.id} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{sitzung.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(sitzung.date), "dd. MMMM yyyy", { locale: de })}
                    </CardDescription>
                  </div>
                  <Badge variant={statusConfig[sitzung.status].variant}>
                    {statusConfig[sitzung.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {sitzung.participants.filter((p) => p.present).length} /{" "}
                      {sitzung.participants.length} Teilnehmer
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>
                      {sitzung.agendaItems.filter((a) => a.completed).length} /{" "}
                      {sitzung.agendaItems.length} TOPs abgeschlossen
                    </span>
                  </div>
                  {sitzung.meetingTimes.opening && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {sitzung.meetingTimes.opening}
                        {sitzung.meetingTimes.closing && ` - ${sitzung.meetingTimes.closing}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/sitzung/${sitzung.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Öffnen
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sitzung löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Diese Aktion kann nicht rückgängig gemacht werden. Die Sitzung
                          "{sitzung.title}" wird dauerhaft gelöscht.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(sitzung.id)}>
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

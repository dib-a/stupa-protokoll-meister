import { useState } from "react";
import { AgendaItem, Antrag, Participant, Role } from "@/types/sitzung";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, FileText, ChevronRight, Plus, Vote } from "lucide-react";
import { AntraegeManager } from "./AntraegeManager";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SessionLiveViewProps = {
  agendaItems: AgendaItem[];
  onUpdate: (items: AgendaItem[]) => void;
  eligibleVoters: number;
  isMeetingActive: boolean;
  participants: Participant[];
  roles: Role[];
};

export const SessionLiveView = ({
  agendaItems,
  onUpdate,
  eligibleVoters,
  isMeetingActive,
}: SessionLiveViewProps) => {
  const [selectedTopId, setSelectedTopId] = useState<string | null>(
    agendaItems.length > 0 ? agendaItems[0].id : null
  );
  const [addTopDialogOpen, setAddTopDialogOpen] = useState(false);
  const [newTopTitle, setNewTopTitle] = useState("");

  const selectedTop = agendaItems.find(item => item.id === selectedTopId);

  const handleAddTop = () => {
    if (!newTopTitle.trim()) return;
    
    const newTop: AgendaItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: newTopTitle.trim(),
      notes: "",
      completed: false,
      antraege: [],
      isAntraegeSection: false,
    };
    
    onUpdate([...agendaItems, newTop]);
    setNewTopTitle("");
    setAddTopDialogOpen(false);
    setSelectedTopId(newTop.id);
  };

  const handleUpdateNotes = (notes: string) => {
    if (!selectedTopId) return;
    onUpdate(
      agendaItems.map(item =>
        item.id === selectedTopId ? { ...item, notes } : item
      )
    );
  };

  const handleUpdateAntraege = (antraege: Antrag[]) => {
    if (!selectedTopId) return;
    const allCompleted = antraege.length > 0 && antraege.every(a => a.completed);
    onUpdate(
      agendaItems.map(item =>
        item.id === selectedTopId ? { ...item, antraege, completed: allCompleted } : item
      )
    );
  };

  const handleMarkTopComplete = () => {
    if (!selectedTopId) return;
    onUpdate(
      agendaItems.map(item =>
        item.id === selectedTopId ? { ...item, completed: true } : item
      )
    );
  };

  const handleToggleAntraegeSection = () => {
    if (!selectedTopId) return;
    const selectedItem = agendaItems.find(item => item.id === selectedTopId);
    
    // If this TOP is already the Anträge section, remove it
    if (selectedItem?.isAntraegeSection) {
      onUpdate(
        agendaItems.map(item =>
          item.id === selectedTopId ? { ...item, isAntraegeSection: false } : item
        )
      );
      toast.success("Anträge-Bereich entfernt");
    } else {
      // Make this TOP the Anträge section and remove the flag from all others
      onUpdate(
        agendaItems.map(item =>
          item.id === selectedTopId 
            ? { ...item, isAntraegeSection: true }
            : { ...item, isAntraegeSection: false }
        )
      );
      toast.success("Anträge-Bereich aktiviert");
    }
  };

  const getCompletionStats = () => {
    const completed = agendaItems.filter(item => item.completed).length;
    const total = agendaItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const stats = getCompletionStats();

  return (
    <div className="grid grid-cols-12 gap-6 min-h-[600px]">
      {/* Sidebar - TOPs List */}
      <div className="col-span-12 lg:col-span-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tagesordnung</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {stats.completed}/{stats.total}
                </Badge>
                <Dialog open={addTopDialogOpen} onOpenChange={setAddTopDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      TOP
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Neuen TOP hinzufügen</DialogTitle>
                      <DialogDescription>
                        Fügen Sie einen neuen Tagesordnungspunkt hinzu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-top-title">Titel</Label>
                        <Input
                          id="new-top-title"
                          value={newTopTitle}
                          onChange={(e) => setNewTopTitle(e.target.value)}
                          placeholder="z.B. Kassenbericht"
                          onKeyPress={(e) => e.key === "Enter" && handleAddTop()}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setAddTopDialogOpen(false)}>
                          Abbrechen
                        </Button>
                        <Button onClick={handleAddTop}>
                          Hinzufügen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 p-4">
                {agendaItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTopId(item.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all hover:bg-muted/50",
                      selectedTopId === item.id && "bg-muted border border-border",
                      item.completed && "opacity-75"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge variant="outline" className="shrink-0">
                          TOP {index + 1}
                        </Badge>
                        {item.completed && (
                          <CheckCircle className="h-4 w-4 text-success shrink-0" />
                        )}
                        <span className="font-medium truncate">{item.title}</span>
                        {item.documentName && (
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      {selectedTopId === item.id && (
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 ml-2" />
                      )}
                    </div>
                    {item.isAntraegeSection && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        <Vote className="h-3 w-3 mr-1" />
                        {item.antraege?.length || 0} Antrag{item.antraege?.length === 1 ? '' : 'e'}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Selected TOP Details */}
      <div className="col-span-12 lg:col-span-8">
        {selectedTop ? (
          <div className="space-y-6">
            {/* TOP Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">
                        TOP {agendaItems.findIndex(i => i.id === selectedTop.id) + 1}
                      </Badge>
                      {selectedTop.completed && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Abgeschlossen
                        </Badge>
                      )}
                      {selectedTop.documentName && (
                        <Badge variant="secondary" className="gap-1">
                          <FileText className="h-3 w-3" />
                          PDF
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{selectedTop.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {!selectedTop.isAntraegeSection && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleAntraegeSection}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Anträge hinzufügen
                      </Button>
                    )}
                    {selectedTop.isAntraegeSection && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleToggleAntraegeSection}
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        Anträge entfernen
                      </Button>
                    )}
                    {!selectedTop.completed && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleMarkTopComplete}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Als erledigt markieren
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Notizen zu diesem TOP</Label>
                    <Textarea
                      value={selectedTop.notes}
                      onChange={(e) => handleUpdateNotes(e.target.value)}
                      placeholder="Diskussionsnotizen, Anmerkungen..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Anträge Section - Only for designated TOP */}
            {selectedTop.isAntraegeSection && (
              <AntraegeManager
                antraege={selectedTop.antraege || []}
                onUpdate={handleUpdateAntraege}
                eligibleVoters={eligibleVoters}
                isMeetingActive={isMeetingActive}
              />
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">
                Wählen Sie einen Tagesordnungspunkt aus der Liste
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

import { useState } from "react";
import { AgendaItem, Antrag, Participant, Role } from "@/types/sitzung";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, FileText, ChevronRight, Plus } from "lucide-react";
import { AntraegeManager } from "./AntraegeManager";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

  const selectedTop = agendaItems.find(item => item.id === selectedTopId);

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
              <Badge variant="outline">
                {stats.completed}/{stats.total}
              </Badge>
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
                        {item.antraege?.length || 0} Anträge
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
                  {!selectedTop.completed && !selectedTop.isAntraegeSection && (
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

            {/* Anträge Section */}
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

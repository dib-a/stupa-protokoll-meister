import { useState } from "react";
import { Plus, Trash2, FileText, Vote, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AgendaItem } from "@/pages/Index";
import { DefaultTOPsManager } from "./DefaultTOPsManager";

type AgendaManagerProps = {
  agendaItems: AgendaItem[];
  onUpdate: (items: AgendaItem[]) => void;
  eligibleVoters?: number;
  isMeetingActive?: boolean;
};

export const AgendaManager = ({ agendaItems, onUpdate, eligibleVoters = 0, isMeetingActive = false }: AgendaManagerProps) => {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editingVote, setEditingVote] = useState<string | null>(null);
  const [voteData, setVoteData] = useState({ ja: 0, nein: 0, enthaltungen: 0 });

  const addAgendaItem = () => {
    if (newItemTitle.trim()) {
      const newItem: AgendaItem = {
        id: Date.now().toString(),
        title: newItemTitle.trim(),
        votingResult: null,
        notes: "",
        completed: false
      };
      onUpdate([...agendaItems, newItem]);
      setNewItemTitle("");
    }
  };

  const removeAgendaItem = (id: string) => {
    onUpdate(agendaItems.filter(item => item.id !== id));
  };

  const startVoting = (id: string) => {
    const item = agendaItems.find(item => item.id === id);
    if (item?.votingResult) {
      setVoteData(item.votingResult);
    } else {
      setVoteData({ ja: 0, nein: 0, enthaltungen: 0 });
    }
    setEditingVote(id);
  };

  const saveVotingResult = (id: string) => {
    onUpdate(agendaItems.map(item =>
      item.id === id
        ? { ...item, votingResult: voteData, completed: true }
        : item
    ));
    setEditingVote(null);
  };

  const updateNotes = (id: string, notes: string) => {
    onUpdate(agendaItems.map(item =>
      item.id === id ? { ...item, notes } : item
    ));
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    const currentIndex = agendaItems.findIndex(item => item.id === id);
    if (
      (direction === "up" && currentIndex > 0) ||
      (direction === "down" && currentIndex < agendaItems.length - 1)
    ) {
      const newItems = [...agendaItems];
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
      onUpdate(newItems);
    }
  };

  const handleLoadDefaults = (defaultTOPs: Array<{ title: string }>) => {
    const newItems = defaultTOPs.map(top => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: top.title,
      votingResult: null,
      notes: "",
      completed: false
    }));
    onUpdate([...agendaItems, ...newItems]);
  };

  const getVoteResultStatus = (result: AgendaItem["votingResult"]) => {
    if (!result) return null;
    const total = result.ja + result.nein + result.enthaltungen;
    const majority = result.ja > result.nein;
    return { total, majority, ...result };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Tagesordnung</span>
            <Badge variant="outline">
              {agendaItems.filter(item => item.completed).length} von {agendaItems.length} TOPs abgeschlossen
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Neuen Tagesordnungspunkt hinzufügen..."
              onKeyPress={(e) => e.key === "Enter" && addAgendaItem()}
            />
            <Button onClick={addAgendaItem}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
          <div className="flex justify-end">
            <DefaultTOPsManager onLoadDefaults={handleLoadDefaults} />
          </div>
        </CardContent>
      </Card>

      {agendaItems.length > 0 ? (
        <div className="space-y-4">
          {agendaItems.map((item, index) => {
            const voteStatus = getVoteResultStatus(item.votingResult);
            return (
              <Card key={item.id} className={item.completed ? "bg-muted/30" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">TOP {index + 1}</Badge>
                          {item.documentName && (
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              PDF
                            </Badge>
                          )}
                          {item.completed && (
                            <CheckCircle className="h-5 w-5 text-success" />
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mt-2">{item.title}</h3>
                        {item.documentName && (
                          <p className="text-sm text-muted-foreground">
                            Dokument: {item.documentName}
                          </p>
                        )}
                      </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveItem(item.id, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveItem(item.id, "down")}
                        disabled={index === agendaItems.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAgendaItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Voting Section */}
                  {editingVote === item.id ? (
                    <div className="border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center">
                          <Vote className="h-4 w-4 mr-2" />
                          Abstimmungsergebnis erfassen
                        </h4>
                        {eligibleVoters > 0 && (
                          <Badge variant="outline" className="text-sm">
                            {eligibleVoters} stimmberechtigte Teilnehmer
                          </Badge>
                        )}
                      </div>
                      {eligibleVoters > 0 && (voteData.ja + voteData.nein + voteData.enthaltungen) !== eligibleVoters && (
                        <div className="mb-3 p-2 bg-warning/10 border border-warning rounded-md text-sm text-warning">
                          ⚠️ Anzahl der Stimmen ({voteData.ja + voteData.nein + voteData.enthaltungen}) entspricht nicht der Anzahl stimmberechtigter Teilnehmer ({eligibleVoters})
                        </div>
                      )}
                      {!isMeetingActive && (
                        <div className="mb-3 p-2 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                          ⚠️ Die Sitzung muss gestartet sein, um Abstimmungen zu erfassen
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label>Ja-Stimmen</Label>
                          <Input
                            type="number"
                            min="0"
                            value={voteData.ja}
                            onChange={(e) => setVoteData({ ...voteData, ja: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Nein-Stimmen</Label>
                          <Input
                            type="number"
                            min="0"
                            value={voteData.nein}
                            onChange={(e) => setVoteData({ ...voteData, nein: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Enthaltungen</Label>
                          <Input
                            type="number"
                            min="0"
                            value={voteData.enthaltungen}
                            onChange={(e) => setVoteData({ ...voteData, enthaltungen: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => saveVotingResult(item.id)}
                          disabled={
                            !isMeetingActive || 
                            (eligibleVoters > 0 && (voteData.ja + voteData.nein + voteData.enthaltungen) !== eligibleVoters)
                          }
                        >
                          Abstimmung speichern
                        </Button>
                        <Button variant="outline" onClick={() => setEditingVote(null)}>
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {voteStatus ? (
                        <div className="border rounded-lg p-4 bg-success/5">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Abstimmungsergebnis</h4>
                            <Badge variant={voteStatus.majority ? "default" : "destructive"}>
                              {voteStatus.majority ? "Angenommen" : "Abgelehnt"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-success">{voteStatus.ja}</div>
                              <div className="text-muted-foreground">Ja</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-destructive">{voteStatus.nein}</div>
                              <div className="text-muted-foreground">Nein</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-warning">{voteStatus.enthaltungen}</div>
                              <div className="text-muted-foreground">Enthaltung</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">{voteStatus.total}</div>
                              <div className="text-muted-foreground">Gesamt</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startVoting(item.id)}
                            className="mt-3"
                          >
                            Bearbeiten
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => startVoting(item.id)}
                          disabled={!isMeetingActive}
                        >
                          <Vote className="h-4 w-4 mr-2" />
                          Abstimmung erfassen
                        </Button>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Notes Section */}
                  <div>
                    <Label>Notizen (optional)</Label>
                    <Textarea
                      value={item.notes}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      placeholder="Zusätzliche Anmerkungen zu diesem TOP..."
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">Noch keine Tagesordnungspunkte hinzugefügt</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
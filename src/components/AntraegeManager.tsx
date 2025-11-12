import { useState } from "react";
import { Plus, Trash2, Vote, CheckCircle, Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Antrag, AntragType } from "@/types/sitzung";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AntraegeManagerProps = {
  antraege: Antrag[];
  onUpdate: (antraege: Antrag[]) => void;
  eligibleVoters?: number;
  isMeetingActive?: boolean;
};

export const AntraegeManager = ({
  antraege,
  onUpdate,
  eligibleVoters = 0,
  isMeetingActive = false,
}: AntraegeManagerProps) => {
  const [newAntragTitle, setNewAntragTitle] = useState("");
  const [newAntragType, setNewAntragType] = useState<AntragType>("voting");
  const [editingAntragId, setEditingAntragId] = useState<string | null>(null);
  const [voteData, setVoteData] = useState({ ja: 0, nein: 0, enthaltungen: 0 });
  const [inputResult, setInputResult] = useState("");

  const addAntrag = () => {
    if (newAntragTitle.trim()) {
      const newAntrag: Antrag = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: newAntragTitle.trim(),
        type: newAntragType,
        votingResult: null,
        inputResult: "",
        notes: "",
        completed: false,
      };
      onUpdate([...antraege, newAntrag]);
      setNewAntragTitle("");
      setNewAntragType("voting");
    }
  };

  const removeAntrag = (id: string) => {
    onUpdate(antraege.filter(a => a.id !== id));
  };

  const startEditing = (antrag: Antrag) => {
    setEditingAntragId(antrag.id);
    if (antrag.type === "voting" && antrag.votingResult) {
      setVoteData(antrag.votingResult);
    } else if (antrag.type === "input") {
      setInputResult(antrag.inputResult);
    }
  };

  const saveResult = (id: string, type: AntragType) => {
    onUpdate(
      antraege.map(antrag =>
        antrag.id === id
          ? {
              ...antrag,
              votingResult: type === "voting" ? voteData : null,
              inputResult: type === "input" ? inputResult : "",
              completed: true,
            }
          : antrag
      )
    );
    setEditingAntragId(null);
    setVoteData({ ja: 0, nein: 0, enthaltungen: 0 });
    setInputResult("");
  };

  const updateNotes = (id: string, notes: string) => {
    onUpdate(antraege.map(a => (a.id === id ? { ...a, notes } : a)));
  };

  const getVoteStatus = (result: { ja: number; nein: number; enthaltungen: number } | null) => {
    if (!result) return null;
    const total = result.ja + result.nein + result.enthaltungen;
    const majority = result.ja > result.nein;
    return { total, majority, ...result };
  };

  return (
    <div className="space-y-6">
      {/* Add New Antrag */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Eingegangene Anträge</span>
            <Badge variant="outline">
              {antraege.filter(a => a.completed).length} von {antraege.length} erledigt
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newAntragTitle}
                onChange={(e) => setNewAntragTitle(e.target.value)}
                placeholder="Neuen Antrag hinzufügen..."
                onKeyPress={(e) => e.key === "Enter" && addAntrag()}
                className="flex-1"
              />
              <Select value={newAntragType} onValueChange={(v) => setNewAntragType(v as AntragType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voting">
                    <div className="flex items-center gap-2">
                      <Vote className="h-4 w-4" />
                      Abstimmung
                    </div>
                  </SelectItem>
                  <SelectItem value="input">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Eingabefeld
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addAntrag}>
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anträge List */}
      {antraege.length > 0 ? (
        <div className="space-y-4">
          {antraege.map((antrag, index) => {
            const voteStatus = antrag.type === "voting" ? getVoteStatus(antrag.votingResult) : null;
            const isEditing = editingAntragId === antrag.id;

            return (
              <Card key={antrag.id} className={antrag.completed ? "bg-muted/30" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Antrag {index + 1}</Badge>
                        <Badge variant={antrag.type === "voting" ? "default" : "secondary"}>
                          {antrag.type === "voting" ? (
                            <><Vote className="h-3 w-3 mr-1" />Abstimmung</>
                          ) : (
                            <><Type className="h-3 w-3 mr-1" />Eingabefeld</>
                          )}
                        </Badge>
                        {antrag.completed && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Erledigt
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{antrag.title}</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAntrag(antrag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Voting Result Section */}
                  {antrag.type === "voting" && (
                    <>
                      {isEditing ? (
                        <div className="border rounded-lg p-4 bg-muted/20">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium flex items-center">
                              <Vote className="h-4 w-4 mr-2" />
                              Abstimmungsergebnis erfassen
                            </h4>
                            {eligibleVoters > 0 && (
                              <Badge variant="outline">
                                {eligibleVoters} stimmberechtigte Teilnehmer
                              </Badge>
                            )}
                          </div>
                          {!isMeetingActive && (
                            <div className="mb-3 p-2 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                              ⚠️ Die Sitzung muss gestartet sein, um Abstimmungen zu erfassen
                            </div>
                          )}
                          {eligibleVoters > 0 && (voteData.ja + voteData.nein + voteData.enthaltungen) !== eligibleVoters && (
                            <div className="mb-3 p-2 bg-warning/10 border border-warning rounded-md text-sm text-warning">
                              ⚠️ Anzahl der Stimmen ({voteData.ja + voteData.nein + voteData.enthaltungen}) entspricht nicht der Anzahl stimmberechtigter Teilnehmer ({eligibleVoters})
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
                          <div className="flex gap-2">
                            <Button
                              onClick={() => saveResult(antrag.id, "voting")}
                              disabled={
                                !isMeetingActive ||
                                (eligibleVoters > 0 && (voteData.ja + voteData.nein + voteData.enthaltungen) !== eligibleVoters)
                              }
                            >
                              Ergebnis speichern
                            </Button>
                            <Button variant="outline" onClick={() => setEditingAntragId(null)}>
                              Abbrechen
                            </Button>
                          </div>
                        </div>
                      ) : voteStatus ? (
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
                            onClick={() => startEditing(antrag)}
                            className="mt-3"
                          >
                            Bearbeiten
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => startEditing(antrag)} disabled={!isMeetingActive}>
                          <Vote className="h-4 w-4 mr-2" />
                          Abstimmung erfassen
                        </Button>
                      )}
                    </>
                  )}

                  {/* Input Result Section */}
                  {antrag.type === "input" && (
                    <>
                      {isEditing ? (
                        <div className="border rounded-lg p-4 bg-muted/20">
                          <h4 className="font-medium mb-3 flex items-center">
                            <Type className="h-4 w-4 mr-2" />
                            Ergebnis erfassen
                          </h4>
                          {!isMeetingActive && (
                            <div className="mb-3 p-2 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                              ⚠️ Die Sitzung muss gestartet sein, um Ergebnisse zu erfassen
                            </div>
                          )}
                          <div className="space-y-4">
                            <div>
                              <Label>Ergebnis</Label>
                              <Input
                                value={inputResult}
                                onChange={(e) => setInputResult(e.target.value)}
                                placeholder="z.B. Name der gewählten Person"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => saveResult(antrag.id, "input")}
                                disabled={!isMeetingActive || !inputResult.trim()}
                              >
                                Ergebnis speichern
                              </Button>
                              <Button variant="outline" onClick={() => setEditingAntragId(null)}>
                                Abbrechen
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : antrag.inputResult ? (
                        <div className="border rounded-lg p-4 bg-success/5">
                          <h4 className="font-medium mb-2">Ergebnis</h4>
                          <p className="text-lg font-semibold">{antrag.inputResult}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(antrag)}
                            className="mt-3"
                          >
                            Bearbeiten
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => startEditing(antrag)} disabled={!isMeetingActive}>
                          <Type className="h-4 w-4 mr-2" />
                          Ergebnis erfassen
                        </Button>
                      )}
                    </>
                  )}

                  <Separator />

                  {/* Notes Section */}
                  <div>
                    <Label>Notizen (optional)</Label>
                    <Textarea
                      value={antrag.notes}
                      onChange={(e) => updateNotes(antrag.id, e.target.value)}
                      placeholder="Anmerkungen zu diesem Antrag..."
                      rows={2}
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
            <Vote className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">Noch keine Anträge hinzugefügt</p>
            <p className="text-sm text-muted-foreground mt-1">
              Fügen Sie Anträge hinzu, die abgestimmt oder entschieden werden sollen
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

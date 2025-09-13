import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Participant } from "@/pages/Index";

type AttendanceManagerProps = {
  participants: Participant[];
  onUpdate: (participants: Participant[]) => void;
  quorumStatus: { hasQuorum: boolean; present: number; total: number };
};

export const AttendanceManager = ({ participants, onUpdate, quorumStatus }: AttendanceManagerProps) => {
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    role: "" as Participant["role"] | ""
  });

  const addParticipant = () => {
    if (newParticipant.name && newParticipant.role) {
      const participant: Participant = {
        id: Date.now().toString(),
        name: newParticipant.name,
        role: newParticipant.role as Participant["role"],
        present: true
      };
      onUpdate([...participants, participant]);
      setNewParticipant({ name: "", role: "" });
    }
  };

  const removeParticipant = (id: string) => {
    onUpdate(participants.filter(p => p.id !== id));
  };

  const togglePresence = (id: string) => {
    onUpdate(participants.map(p => 
      p.id === id ? { ...p, present: !p.present } : p
    ));
  };

  const getRoleColor = (role: Participant["role"]) => {
    switch (role) {
      case "Stupa-Mitglied": return "bg-primary text-primary-foreground";
      case "Referent*in / AStA": return "bg-accent text-accent-foreground";
      case "Gast": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quorum Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Teilnehmerliste</span>
            <Badge 
              variant={quorumStatus.hasQuorum ? "default" : "destructive"}
              className="border-current"
            >
              {quorumStatus.hasQuorum ? "Beschlussfähig" : "Nicht beschlussfähig"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{participants.filter(p => p.present).length}</div>
              <div className="text-sm text-muted-foreground">Anwesend</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-quorum-met">{quorumStatus.present}</div>
              <div className="text-sm text-muted-foreground">Stupa-Mitglieder</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{participants.length}</div>
              <div className="text-sm text-muted-foreground">Gesamt</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Participant */}
      <Card>
        <CardHeader>
          <CardTitle>Teilnehmer hinzufügen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                placeholder="Vor- und Nachname"
              />
            </div>
            <div>
              <Label>Rolle</Label>
              <Select
                value={newParticipant.role}
                onValueChange={(value) => setNewParticipant({ ...newParticipant, role: value as Participant["role"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stupa-Mitglied">Stupa-Mitglied</SelectItem>
                  <SelectItem value="Referent*in / AStA">Referent*in / AStA</SelectItem>
                  <SelectItem value="Gast">Gast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addParticipant} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>Anwesenheitsliste</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Anwesend</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead className="w-20">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <Checkbox
                        checked={participant.present}
                        onCheckedChange={() => togglePresence(participant.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{participant.name}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(participant.role)}>
                        {participant.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeParticipant(participant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Teilnehmer hinzugefügt</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
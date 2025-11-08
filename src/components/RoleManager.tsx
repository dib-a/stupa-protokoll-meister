import { useState } from "react";
import { Plus, Edit2, Trash2, Settings, Palette } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Role = {
  id: string;
  name: string;
  color: "primary" | "secondary" | "accent" | "success" | "warning" | "destructive" | "muted";
  canVote: boolean;
  isDefault: boolean;
};

type RoleManagerProps = {
  roles: Role[];
  onUpdate: (roles: Role[]) => void;
};

const colorOptions = [
  { value: "primary", label: "Primär (Blau)", className: "bg-primary text-primary-foreground" },
  { value: "secondary", label: "Sekundär (Grün)", className: "bg-secondary text-secondary-foreground" },
  { value: "accent", label: "Akzent (Orange)", className: "bg-accent text-accent-foreground" },
  { value: "success", label: "Erfolg", className: "bg-success text-success-foreground" },
  { value: "warning", label: "Warnung", className: "bg-warning text-warning-foreground" },
  { value: "destructive", label: "Gefahr", className: "bg-destructive text-destructive-foreground" },
  { value: "muted", label: "Gedämpft", className: "bg-muted text-muted-foreground" },
];

export const RoleManager = ({ roles, onUpdate }: RoleManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: "",
    color: "muted" as Role["color"],
    canVote: false
  });

  const ALLOWED_ROLES = ["Mitglied", "Gast"];

  const addRole = () => {
    if (newRole.name.trim()) {
      if (!ALLOWED_ROLES.includes(newRole.name.trim())) {
        toast.error("Nur 'Mitglied' und 'Gast' sind erlaubte Rollen");
        return;
      }
      
      // Check if role already exists
      if (roles.some(r => r.name === newRole.name.trim())) {
        toast.error("Diese Rolle existiert bereits");
        return;
      }
      
      const role: Role = {
        id: Date.now().toString(),
        name: newRole.name.trim(),
        color: newRole.color,
        canVote: newRole.name.trim() === "Mitglied",
        isDefault: false
      };
      onUpdate([...roles, role]);
      setNewRole({ name: "", color: "muted", canVote: false });
    }
  };

  const updateRole = (updatedRole: Role) => {
    if (!ALLOWED_ROLES.includes(updatedRole.name)) {
      toast.error("Nur 'Mitglied' und 'Gast' sind erlaubte Rollen");
      return;
    }
    
    // Force canVote based on role name
    if (updatedRole.name === "Mitglied") {
      updatedRole.canVote = true;
    } else if (updatedRole.name === "Gast") {
      updatedRole.canVote = false;
    }
    
    onUpdate(roles.map(role => role.id === updatedRole.id ? updatedRole : role));
    setEditingRole(null);
  };

  const deleteRole = (id: string) => {
    onUpdate(roles.filter(role => role.id !== id));
  };

  const getRoleClassName = (color: Role["color"]) => {
    const option = colorOptions.find(opt => opt.value === color);
    return option?.className || "bg-muted text-muted-foreground";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="btn-enhanced">
          <Settings className="h-4 w-4 mr-2" />
          Rollen verwalten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Rollen verwalten</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Role */}
          <Card>
            <CardHeader>
              <CardTitle>Neue Rolle hinzufügen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Rollenname</Label>
                  <Select
                    value={newRole.name}
                    onValueChange={(value) => {
                      setNewRole({ 
                        ...newRole, 
                        name: value,
                        canVote: value === "Mitglied"
                      });
                    }}
                  >
                    <SelectTrigger className="input-enhanced">
                      <SelectValue placeholder="Rolle auswählen..." />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover border shadow-medium">
                      <SelectItem value="Mitglied">Mitglied</SelectItem>
                      <SelectItem value="Gast">Gast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Farbe</Label>
                  <Select
                    value={newRole.color}
                    onValueChange={(value) => setNewRole({ ...newRole, color: value as Role["color"] })}
                  >
                    <SelectTrigger className="input-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover border shadow-medium">
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${option.className}`} />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="canVote"
                    checked={newRole.canVote}
                    disabled={true}
                    className="rounded"
                  />
                  <Label htmlFor="canVote" className="text-sm text-muted-foreground">
                    Stimmberechtigt (automatisch)
                  </Label>
                </div>
                <div className="flex items-end">
                  <Button onClick={addRole} className="w-full btn-enhanced">
                    <Plus className="h-4 w-4 mr-2" />
                    Hinzufügen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles List */}
          <Card>
            <CardHeader>
              <CardTitle>Vorhandene Rollen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Stimmberechtigt</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead className="w-32">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <Badge className={getRoleClassName(role.color)}>
                          {role.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {role.canVote ? (
                          <Badge variant="outline" className="text-success border-success">Ja</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Nein</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.isDefault ? "secondary" : "outline"}>
                          {role.isDefault ? "Standard" : "Benutzerdefiniert"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingRole(role)}
                            className="btn-enhanced"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {!role.isDefault && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteRole(role.id)}
                              className="btn-enhanced hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Edit Role Dialog */}
        {editingRole && (
          <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rolle bearbeiten</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rollenname</Label>
                  <Select
                    value={editingRole.name}
                    onValueChange={(value) => {
                      setEditingRole({ 
                        ...editingRole, 
                        name: value,
                        canVote: value === "Mitglied"
                      });
                    }}
                    disabled={editingRole.isDefault}
                  >
                    <SelectTrigger className="input-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover border shadow-medium">
                      <SelectItem value="Mitglied">Mitglied</SelectItem>
                      <SelectItem value="Gast">Gast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Farbe</Label>
                  <Select
                    value={editingRole.color}
                    onValueChange={(value) => setEditingRole({ ...editingRole, color: value as Role["color"] })}
                  >
                    <SelectTrigger className="input-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover border shadow-medium">
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${option.className}`} />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editCanVote"
                    checked={editingRole.canVote}
                    disabled={true}
                    className="rounded"
                  />
                  <Label htmlFor="editCanVote" className="text-sm text-muted-foreground">
                    Stimmberechtigt (automatisch für Mitglied)
                  </Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingRole(null)}>
                    Abbrechen
                  </Button>
                  <Button onClick={() => updateRole(editingRole)} className="btn-enhanced">
                    Speichern
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};
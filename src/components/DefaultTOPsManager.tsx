import { useState, useEffect } from "react";
import { Plus, Trash2, Download, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DefaultTOP = {
  id: string;
  title: string;
};

type DefaultTOPsManagerProps = {
  onLoadDefaults: (tops: Array<{ title: string }>) => void;
};

const STORAGE_KEY = "stupa-default-tops";

export const DefaultTOPsManager = ({ onLoadDefaults }: DefaultTOPsManagerProps) => {
  const [defaultTOPs, setDefaultTOPs] = useState<DefaultTOP[]>([]);
  const [newTOPTitle, setNewTOPTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDefaultTOPs(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load default TOPs");
      }
    }
  }, []);

  const saveToStorage = (tops: DefaultTOP[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tops));
    setDefaultTOPs(tops);
  };

  const addDefaultTOP = () => {
    if (newTOPTitle.trim()) {
      const newTOP: DefaultTOP = {
        id: Date.now().toString(),
        title: newTOPTitle.trim(),
      };
      const updated = [...defaultTOPs, newTOP];
      saveToStorage(updated);
      setNewTOPTitle("");
      toast.success("Standard-TOP hinzugefügt");
    }
  };

  const removeDefaultTOP = (id: string) => {
    const updated = defaultTOPs.filter(top => top.id !== id);
    saveToStorage(updated);
    toast.success("Standard-TOP entfernt");
  };

  const loadDefaults = () => {
    if (defaultTOPs.length === 0) {
      toast.error("Keine Standard-TOPs vorhanden");
      return;
    }
    onLoadDefaults(defaultTOPs.map(top => ({ title: top.title })));
    setIsOpen(false);
    toast.success(`${defaultTOPs.length} Standard-TOPs geladen`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Standard-TOPs laden
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Standard-Tagesordnungspunkte</DialogTitle>
          <DialogDescription>
            Verwalten Sie Ihre Standard-TOPs und laden Sie diese in die aktuelle Sitzung.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newTOPTitle}
              onChange={(e) => setNewTOPTitle(e.target.value)}
              placeholder="Neuen Standard-TOP hinzufügen..."
              onKeyPress={(e) => e.key === "Enter" && addDefaultTOP()}
            />
            <Button onClick={addDefaultTOP}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>

          {defaultTOPs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {defaultTOPs.map((top, index) => (
                <div
                  key={top.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">TOP {index + 1}</Badge>
                    <span className="font-medium">{top.title}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeDefaultTOP(top.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Save className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Standard-TOPs gespeichert</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={loadDefaults} disabled={defaultTOPs.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Standard-TOPs laden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

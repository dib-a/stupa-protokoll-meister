import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SitzungSnapshot } from "@/types/version";
import { Clock, Save, Trash2, RotateCcw, Tag } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshots: SitzungSnapshot[];
  onRestore: (snapshot: SitzungSnapshot) => void;
  onDelete: (snapshotId: string) => void;
  onCreateSnapshot: (label: string) => void;
  lastAutoSave: Date;
}

export const VersionHistoryDialog = ({
  open,
  onOpenChange,
  snapshots,
  onRestore,
  onDelete,
  onCreateSnapshot,
  lastAutoSave,
}: VersionHistoryDialogProps) => {
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [restoreConfirmSnapshot, setRestoreConfirmSnapshot] = useState<SitzungSnapshot | null>(
    null
  );

  const handleCreateSnapshot = () => {
    if (!snapshotLabel.trim()) {
      toast.error("Bitte geben Sie einen Namen für den Snapshot ein");
      return;
    }
    onCreateSnapshot(snapshotLabel);
    setSnapshotLabel("");
    toast.success("Snapshot erstellt");
  };

  const handleRestore = (snapshot: SitzungSnapshot) => {
    setRestoreConfirmSnapshot(snapshot);
  };

  const confirmRestore = () => {
    if (restoreConfirmSnapshot) {
      onRestore(restoreConfirmSnapshot);
      setRestoreConfirmSnapshot(null);
      onOpenChange(false);
      toast.success("Version wiederhergestellt");
    }
  };

  const handleDelete = (snapshotId: string) => {
    onDelete(snapshotId);
    setDeleteConfirmId(null);
    toast.success("Snapshot gelöscht");
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "PPp", { locale: de });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Versionshistorie
            </DialogTitle>
            <DialogDescription>
              Erstellen Sie Snapshots oder stellen Sie frühere Versionen wieder her.
              <br />
              <span className="text-xs">
                Letzter Auto-Save: {format(lastAutoSave, "HH:mm:ss")}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create snapshot */}
            <div className="flex gap-2">
              <Input
                placeholder="Snapshot-Name (z.B. 'Vor Abstimmung TOP 3')"
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateSnapshot();
                  }
                }}
              />
              <Button onClick={handleCreateSnapshot} className="gap-2">
                <Save className="h-4 w-4" />
                Erstellen
              </Button>
            </div>

            {/* Snapshots list */}
            <ScrollArea className="h-[400px] pr-4">
              {snapshots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Noch keine Snapshots vorhanden</p>
                  <p className="text-sm mt-2">
                    Erstellen Sie einen Snapshot, um den aktuellen Stand zu speichern
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {snapshots.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {snapshot.autoSave ? (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Auto
                              </Badge>
                            ) : (
                              <Badge className="gap-1">
                                <Tag className="h-3 w-3" />
                                Manuell
                              </Badge>
                            )}
                            <span className="font-semibold truncate">{snapshot.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatTimestamp(snapshot.timestamp)}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{snapshot.data.participants.length} Teilnehmer</span>
                            <span>{snapshot.data.agendaItems.length} TOPs</span>
                            <span>
                              {
                                snapshot.data.agendaItems.filter((item) => item.completed)
                                  .length
                              }{" "}
                              abgeschlossen
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(snapshot)}
                            className="gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Wiederherstellen
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteConfirmId(snapshot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore confirmation */}
      <AlertDialog
        open={!!restoreConfirmSnapshot}
        onOpenChange={(open) => !open && setRestoreConfirmSnapshot(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Version wiederherstellen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie wirklich zu dieser Version zurückkehren?
              <br />
              <strong>"{restoreConfirmSnapshot?.label}"</strong>
              <br />
              <br />
              Alle nicht gespeicherten Änderungen gehen verloren. Es wird empfohlen, vorher
              einen Snapshot des aktuellen Stands zu erstellen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              Wiederherstellen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Snapshot löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dieser Snapshot wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig
              gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

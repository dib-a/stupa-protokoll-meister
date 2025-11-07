import { useState, useEffect, useCallback } from "react";
import { SitzungSnapshot, VersionHistory } from "@/types/version";
import { Sitzung } from "@/types/sitzung";

const STORAGE_KEY = "sitzung_versions";
const MAX_SNAPSHOTS = 10;
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useVersionHistory = (sitzungId: string, currentData: Sitzung) => {
  const [history, setHistory] = useState<VersionHistory>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${sitzungId}`);
    return stored
      ? JSON.parse(stored)
      : { sitzungId, snapshots: [], maxSnapshots: MAX_SNAPSHOTS };
  });

  const [lastAutoSave, setLastAutoSave] = useState<Date>(new Date());

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${sitzungId}`, JSON.stringify(history));
  }, [history, sitzungId]);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      createSnapshot("Auto-Save", true);
      setLastAutoSave(new Date());
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentData]);

  const createSnapshot = useCallback(
    (label: string, autoSave: boolean = false) => {
      const snapshot: SitzungSnapshot = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        label,
        data: {
          title: currentData.title,
          date: currentData.date,
          time: currentData.time,
          status: currentData.status,
          participants: currentData.participants,
          agendaItems: currentData.agendaItems,
          meetingTimes: currentData.meetingTimes,
          nextMeetingDate: currentData.nextMeetingDate,
          documents: currentData.documents,
          roles: currentData.roles,
        },
        autoSave,
      };

      setHistory((prev) => {
        const newSnapshots = [snapshot, ...prev.snapshots];
        
        // Keep only the latest MAX_SNAPSHOTS
        if (newSnapshots.length > MAX_SNAPSHOTS) {
          // Remove oldest auto-saves first, then oldest manual saves
          const manualSaves = newSnapshots.filter((s) => !s.autoSave);
          const autoSaves = newSnapshots.filter((s) => s.autoSave);
          
          const trimmedAutoSaves = autoSaves.slice(0, Math.floor(MAX_SNAPSHOTS / 2));
          const trimmedManualSaves = manualSaves.slice(
            0,
            MAX_SNAPSHOTS - trimmedAutoSaves.length
          );
          
          return {
            ...prev,
            snapshots: [...trimmedManualSaves, ...trimmedAutoSaves].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            ),
          };
        }
        
        return { ...prev, snapshots: newSnapshots };
      });

      return snapshot.id;
    },
    [currentData]
  );

  const deleteSnapshot = useCallback((snapshotId: string) => {
    setHistory((prev) => ({
      ...prev,
      snapshots: prev.snapshots.filter((s) => s.id !== snapshotId),
    }));
  }, []);

  const getSnapshot = useCallback(
    (snapshotId: string) => {
      return history.snapshots.find((s) => s.id === snapshotId);
    },
    [history]
  );

  const clearHistory = useCallback(() => {
    setHistory({
      sitzungId,
      snapshots: [],
      maxSnapshots: MAX_SNAPSHOTS,
    });
  }, [sitzungId]);

  return {
    snapshots: history.snapshots,
    createSnapshot,
    deleteSnapshot,
    getSnapshot,
    clearHistory,
    lastAutoSave,
  };
};

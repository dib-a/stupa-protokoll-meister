import { useState, useEffect } from "react";
import { Clock, Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MeetingTimes = {
  opening?: string;
  pauses: Array<{ start: string; end?: string }>;
  closing?: string;
};

type MeetingTimeTrackerProps = {
  meetingTimes: MeetingTimes;
  onUpdate: (times: MeetingTimes) => void;
  onMeetingStart?: () => void;
  onMeetingEnd?: () => void;
};

export const MeetingTimeTracker = ({ meetingTimes, onUpdate, onMeetingStart, onMeetingEnd }: MeetingTimeTrackerProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const startMeeting = () => {
    onUpdate({
      ...meetingTimes,
      opening: formatCurrentTime()
    });
    onMeetingStart?.();
  };

  const startPause = () => {
    const newPause = { start: formatCurrentTime() };
    onUpdate({
      ...meetingTimes,
      pauses: [...meetingTimes.pauses, newPause]
    });
    setIsPaused(true);
  };

  const endPause = () => {
    const pauses = [...meetingTimes.pauses];
    const lastPause = pauses[pauses.length - 1];
    if (lastPause && !lastPause.end) {
      lastPause.end = formatCurrentTime();
      onUpdate({ ...meetingTimes, pauses });
    }
    setIsPaused(false);
  };

  const endMeeting = () => {
    // End any active pause first
    let updatedPauses = [...meetingTimes.pauses];
    const lastPause = updatedPauses[updatedPauses.length - 1];
    if (lastPause && !lastPause.end) {
      lastPause.end = formatCurrentTime();
    }

    onUpdate({
      ...meetingTimes,
      pauses: updatedPauses,
      closing: formatCurrentTime()
    });
    setIsPaused(false);
    onMeetingEnd?.();
  };

  const calculateTotalDuration = () => {
    if (!meetingTimes.opening) return "00:00";
    
    const start = new Date(`1970-01-01T${meetingTimes.opening}:00`);
    const end = meetingTimes.closing 
      ? new Date(`1970-01-01T${meetingTimes.closing}:00`)
      : new Date(`1970-01-01T${formatCurrentTime()}:00`);
    
    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Subtract pause times
    meetingTimes.pauses.forEach(pause => {
      const pauseStart = new Date(`1970-01-01T${pause.start}:00`);
      const pauseEnd = pause.end 
        ? new Date(`1970-01-01T${pause.end}:00`)
        : new Date(`1970-01-01T${formatCurrentTime()}:00`);
      totalMinutes -= (pauseEnd.getTime() - pauseStart.getTime()) / (1000 * 60);
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center space-x-2">
        <Clock className="h-4 w-4" />
        <span>Sitzungszeiten</span>
      </h4>

      {/* Time Display */}
      <div className="text-center p-3 bg-muted rounded-lg">
        <div className="text-2xl font-mono font-bold">{formatCurrentTime()}</div>
        <div className="text-sm text-muted-foreground">Aktuelle Zeit</div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-2">
        {!meetingTimes.opening ? (
          <Button onClick={startMeeting} className="w-full" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Sitzung eröffnen
          </Button>
        ) : (
          <div className="space-y-2">
            {!meetingTimes.closing && (
              <>
                {!isPaused ? (
                  <Button onClick={startPause} variant="outline" className="w-full" size="sm">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={endPause} variant="outline" className="w-full" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Pause beenden
                  </Button>
                )}
                <Button onClick={endMeeting} variant="destructive" className="w-full" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  Sitzung beenden
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Time Summary */}
      {meetingTimes.opening && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eröffnung:</span>
            <span className="font-mono">{meetingTimes.opening}</span>
          </div>
          
          {meetingTimes.pauses.length > 0 && (
            <div>
              <div className="text-muted-foreground mb-1">Pausen:</div>
              {meetingTimes.pauses.map((pause, index) => (
                <div key={index} className="flex justify-between text-xs ml-4">
                  <span>Pause {index + 1}:</span>
                  <span className="font-mono">
                    {pause.start} - {pause.end || "läuft"}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {meetingTimes.closing && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Schluss:</span>
              <span className="font-mono">{meetingTimes.closing}</span>
            </div>
          )}
          
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Gesamtdauer:</span>
            <span className="font-mono">{calculateTotalDuration()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
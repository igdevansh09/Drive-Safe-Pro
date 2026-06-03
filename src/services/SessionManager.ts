import { useDriveStore } from "../store/useDriveStore";
import { useHistoryStore } from "../store/useHistoryStore";
import { formatDate } from "../utils/formatters";

export const finalizeDriveSession = () => {
  const { score, events, startTime } = useDriveStore.getState();

  if (!startTime) {
    console.warn("Attempted to finalize a drive that never started.");
    return;
  }

  const endTime = Date.now();

  const sessionSummary = {
    id: `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    startTime,
    endTime,
    totalScore: score,
    eventCount: events.length,
    events: events,
    formattedDate: formatDate(startTime), 
  };

  useHistoryStore.getState().saveSession(sessionSummary);

  useDriveStore.getState().resetSession();
};

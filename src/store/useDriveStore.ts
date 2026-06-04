import { create } from "zustand";
import { TelemetryEvent } from "../services/EventDetector";

interface DriveState {
  isDriving: boolean;
  score: number;
  events: TelemetryEvent[];
  startTime: number | null;

  startDriveSession: () => void;
  endDriveSession: () => void;
  registerEvent: (event: TelemetryEvent) => void;
  resetSession: () => void;
}

export const PENALTIES: Record<TelemetryEvent["type"], number> = {
  HARSH_BRAKING: 5,
  HARSH_ACCELERATION: 5,
  SHARP_TURN: 3, 
  AGGRESSIVE_STEERING: 4,
  EXCESSIVE_MOVEMENT: 3,
  PHONE_HANDLING: 10, 
};

export const useDriveStore = create<DriveState>((set) => ({
  isDriving: false,
  score: 100,
  events: [],
  startTime: null,

  startDriveSession: () =>
    set({
      isDriving: true,
      score: 100,
      events: [],
      startTime: Date.now(),
    }),

  endDriveSession: () =>
    set({
      isDriving: false,
    }),

  registerEvent: (event: TelemetryEvent) =>
    set((state) => {
      const penalty = PENALTIES[event.type] ?? 0;
      const newScore = Math.max(0, state.score - penalty);

      return {
        score: newScore,
        events: [...state.events, event],
      };
    }),

  resetSession: () =>
    set({
      isDriving: false,
      score: 100,
      events: [],
      startTime: null,
    }),
}));

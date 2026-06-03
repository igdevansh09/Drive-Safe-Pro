import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DriveSessionSummary } from "../types/drive.types";

interface HistoryState {
  sessions: DriveSessionSummary[];
  saveSession: (session: DriveSessionSummary) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      sessions: [],

      saveSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),

      clearHistory: () => set({ sessions: [] }),
    }),
    {
      name: "telematics-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

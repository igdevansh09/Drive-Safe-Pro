import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeMode } from "../types/theme.types";

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: "system", 
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "telematics-theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

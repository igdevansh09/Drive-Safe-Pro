import { useColorScheme } from "react-native";
import { useThemeStore } from "../store/useThemeStore";
import { lightTheme, darkTheme } from "../theme/colors";
import { ThemeColors } from "../types/theme.types";

export const useAppTheme = (): { colors: ThemeColors; isDark: boolean } => {
  const { themeMode } = useThemeStore();
  const systemColorScheme = useColorScheme();
  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  return {
    colors: isDark ? darkTheme : lightTheme,
    isDark,
  };
};

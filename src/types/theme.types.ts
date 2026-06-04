export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string; 
  };
  text: {
    primary: string;
    secondary: string;
    inverse: string;
  };
  brand: {
    primary: string;
    accent: string;
  };
  status: {
    excellent: string;
    good: string;
    fair: string;
    poor: string;
  };
  border: {
    default: string;
  };
}

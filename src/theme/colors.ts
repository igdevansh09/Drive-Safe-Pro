import { ThemeColors } from "../types/theme.types";

export const lightTheme: ThemeColors = {
  background: {
    primary: "#fcf9f8",
    secondary: "#ffffff",
  },
  text: {
    primary: "#1c1b1b",
    secondary: "#717786",
    inverse: "#ffffff",
  },
  brand: {
    primary: "#0058bc",
    accent: "#0070eb",
  },
  status: {
    excellent: "#00a572",
    good: "#ca8100",
    fair: "#ba1a1a",
    poor: "#ba1a1a",
  },
  border: {
    default: "#c1c6d7",
  },
};

export const darkTheme: ThemeColors = {
  background: {
    primary: "#131313",
    secondary: "#1c1b1b",
  },
  text: {
    primary: "#e5e2e1",
    secondary: "#8b90a0",
    inverse: "#131313",
  },
  brand: {
    primary: "#adc6ff",
    accent: "#4b8eff",
  },
  status: {
    excellent: "#4edea3",
    good: "#ffb95f",
    fair: "#ca8100",
    poor: "#ffb4ab",
  },
  border: {
    default: "#414755",
  },
};

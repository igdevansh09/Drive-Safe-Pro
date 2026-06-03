// /src/app/_layout.tsx

import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

// Font integration matching your Precision Tech design system
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";

import { useAppTheme } from "../hooks/useAppTheme";
import { useAppStore } from "../store/useAppStore";

// Hold the splash screen visible while fonts and state hydrate
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // 1. Load Custom Fonts
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    Inter_Medium: Inter_500Medium,
    Inter_SemiBold: Inter_600SemiBold,
    Inter_Bold: Inter_700Bold,
    "JetBrains Mono": JetBrainsMono_500Medium,
  });

  // 2. Global State & Theme
  const { hasCompletedOnboarding, hasHydrated } = useAppStore();
  const { colors, isDark } = useAppTheme();

  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // 3. Boot Sequence
  useEffect(() => {
    // If fonts load successfully or fail, we must drop the splash screen to prevent locking the app
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  // 4. Routing Guard (No-Auth Logic) - Only navigate after hydration is complete
  useEffect(() => {
    // Wait for BOTH fonts AND store hydration before routing
    if (!isReady || !hasHydrated) return;

    // Detect if the user is trying to access the main app
    const inTabsGroup = segments[0] === "(tabs)";
    const isDriveScreen = segments[0] === "drive";

    if (!hasCompletedOnboarding && (inTabsGroup || isDriveScreen)) {
      // 4a. Un-onboarded user trying to access the app -> Kick to index (Onboarding)
      router.replace("/");
    } else if (hasCompletedOnboarding && segments[0] === undefined) {
      // 4b. Onboarded user opening the app at the root -> Push directly to dashboard
      router.replace("/(tabs)");
    }
  }, [hasCompletedOnboarding, hasHydrated, segments, isReady]);

  // Loading Fallback (In case splash screen hides slightly before React mounts or store hydrates)
  if (!isReady || !hasHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={colors.background.primary}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: "fade", // Smooth fading between core route changes
        }}
      >
        {/* Entry Point / Onboarding */}
        <Stack.Screen name="index" />

        {/* Main Application */}
        <Stack.Screen name="(tabs)" />

        {/* Full Screen Driving Modal */}
        <Stack.Screen
          name="drive"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom", // Slides up to obscure the tabs while driving
            gestureEnabled: false, // Prevent swiping away by accident while driving
          }}
        />
      </Stack>
    </>
  );
}

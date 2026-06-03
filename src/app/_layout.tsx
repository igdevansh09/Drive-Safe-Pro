import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    Inter_Medium: Inter_500Medium,
    Inter_SemiBold: Inter_600SemiBold,
    Inter_Bold: Inter_700Bold,
    "JetBrains Mono": JetBrainsMono_500Medium,
  });

  const { hasCompletedOnboarding, hasHydrated } = useAppStore();
  const { colors, isDark } = useAppTheme();

  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!isReady || !hasHydrated) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const isDriveScreen = segments[0] === "drive";

    if (!hasCompletedOnboarding && (inTabsGroup || isDriveScreen)) {
      router.replace("/");
    } else if (hasCompletedOnboarding && segments[0] === undefined) {
      router.replace("/(tabs)");
    }

    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 150);

    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding, hasHydrated, segments, isReady]);

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
          animation: "fade", 
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="drive"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom", 
            gestureEnabled: false, 
          }}
        />
      </Stack>
    </>
  );
}

import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../hooks/useAppTheme";
import { useAppStore } from "../store/useAppStore";
import { ThemeColors } from "../types/theme.types";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { completeOnboarding } = useAppStore();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [speed, setSpeed] = useState(62);
  const [sync, setSync] = useState(98);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const syncWidthAnim = useRef(new Animated.Value(65)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const interval = setInterval(() => {
      setSpeed(62 + Math.floor(Math.random() * 5) - 2);
      const newSync = 80 + Math.random() * 20;
      setSync(newSync);

      Animated.timing(syncWidthAnim, {
        toValue: newSync,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      completeOnboarding();
      router.replace("/(tabs)");
    });
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
        <View style={styles.header}>
          <MaterialIcons
            name="security"
            size={24}
            color={colors.brand.primary}
          />
          <Text style={styles.headerTitle}>DRIVESAFE PRO</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            styles.scrollContentGrow,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={[colors.background.secondary, colors.background.primary]}
              style={styles.heroGradient}
            >
              <View style={styles.centerAbsolute}>
                <Animated.View
                  style={[
                    styles.pulseRingOuter,
                    { transform: [{ scale: pulseScale }], opacity: pulseAnim },
                  ]}
                />
                <View style={styles.pulseRingInner} />
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="sensors"
                    size={32}
                    color={colors.brand.primary}
                  />
                </View>
              </View>

              <View style={styles.hudOverlay}>
                <View>
                  <View style={styles.hudRow}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.hudLabel}>LIVE STREAM</Text>
                  </View>
                  <Text style={styles.hudValue}>{speed}</Text>
                </View>

                <View style={styles.syncContainer}>
                  <View style={styles.syncBarTrack}>
                    <Animated.View
                      style={[
                        styles.syncBarFill,
                        {
                          width: syncWidthAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ["0%", "100%"],
                          }),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.hudLabel}>
                    SYNCING... {Math.floor(sync)}%
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.mainTitle}>Master the Road</Text>

          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="speed"
              color={colors.status.excellent}
              title="Real-time Safety Intelligence"
              description="Live feedback based on your driving metrics for maximum awareness."
              styles={styles}
            />
            <FeatureCard
              icon="sensors"
              color={colors.brand.primary}
              title="Advanced Sensor Analysis"
              description="Securely uses device motion to identify events with high precision."
              styles={styles}
            />
            <FeatureCard
              icon="query-stats"
              color={colors.status.good}
              title="Performance Telemetry"
              description="Track detailed metrics like G-force, acceleration, and braking patterns in real-time."
              styles={styles}
            />
          </View>

          <View style={styles.trustIndicator}>
            <MaterialIcons
              name="verified-user"
              size={16}
              color={colors.status.excellent}
            />
            <Text style={styles.trustText}>END-TO-END ENCRYPTED TELEMETRY</Text>
          </View>
        </ScrollView>

        <LinearGradient
          colors={[
            "transparent",
            colors.background.primary,
            colors.background.primary,
          ]}
          style={styles.footer}
        >
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.8}
            onPress={handleGetStarted}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color={colors.text.inverse}
            />
          </TouchableOpacity>
          <Text style={styles.footerDisclaimer}>
            By starting, you agree to our{" "}
            <Text style={styles.linkText}>Privacy Policy</Text> and{" "}
            <Text style={styles.linkText}>Telematics Disclosure</Text>.
          </Text>
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
}

const FeatureCard = ({ icon, color, title, description, styles }: any) => (
  <View style={styles.featureCard}>
    <View style={[styles.featureIconBox, { backgroundColor: `${color}1A` }]}>
      <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{description}</Text>
    </View>
  </View>
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 48,
      gap: 8,
      backgroundColor: colors.background.primary,
      zIndex: 10,
    },
    headerTitle: {
      color: colors.brand.primary,
      fontSize: 14,
      letterSpacing: 2,
      fontWeight: "700",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 140,
      alignItems: "center",
    },
    scrollContentGrow: {
      flexGrow: 1,
    },
    scrollView: {
      flex: 1,
    },
    heroContainer: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 24,
      overflow: "hidden",
      borderColor: colors.border.default,
      borderWidth: 1,
      marginBottom: 24,
    },
    heroGradient: {
      flex: 1,
      position: "relative",
    },
    centerAbsolute: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ translateY: -30 }],
    },
    pulseRingOuter: {
      position: "absolute",
      width: 128,
      height: 128,
      borderRadius: 64,
      borderWidth: 2,
      borderColor: `${colors.brand.primary}66`,
    },
    pulseRingInner: {
      position: "absolute",
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 1,
      borderColor: `${colors.brand.primary}99`,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${colors.brand.primary}1A`,
      alignItems: "center",
      justifyContent: "center",
    },
    hudOverlay: {
      position: "absolute",
      bottom: 16,
      left: 16,
      right: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      backgroundColor: `${colors.background.secondary}E6`,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    hudRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.status.excellent,
    },
    hudLabel: {
      color: colors.text.secondary,
      fontSize: 10,
      letterSpacing: 1,
    },
    hudValue: {
      color: colors.brand.primary,
      fontSize: 24,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
    syncContainer: {
      alignItems: "flex-end",
      gap: 4,
    },
    syncBarTrack: {
      width: 96,
      height: 4,
      backgroundColor: colors.background.primary,
      borderRadius: 2,
      overflow: "hidden",
    },
    syncBarFill: {
      height: "100%",
      backgroundColor: colors.brand.primary,
    },
    mainTitle: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 24,
      textAlign: "center",
    },
    featuresGrid: {
      width: "100%",
      gap: 16,
      marginBottom: 40,
    },
    featureCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    featureIconBox: {
      width: 48,
      height: 48,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    featureTextContainer: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    featureDesc: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    trustIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      marginBottom: 20,
    },
    trustText: {
      color: colors.text.secondary,
      fontSize: 10,
      letterSpacing: 1,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: 3,
    },
    ctaButton: {
      width: "100%",
      height: 64,
      backgroundColor: colors.brand.primary,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 16,
    },
    ctaText: {
      color: colors.text.inverse,
      fontSize: 20,
      fontWeight: "600",
    },
    footerDisclaimer: {
      textAlign: "center",
      fontSize: 12,
      color: colors.text.secondary,
      paddingHorizontal: 16,
    },
    linkText: {
      color: colors.brand.primary,
    },
  });

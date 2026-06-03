// /src/app/drive.tsx

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../hooks/useAppTheme";
import { TelemetryEvent } from "../services/EventDetector";
import { TelemetryEngine as SensorManager } from "../services/SensorManager";
import { finalizeDriveSession } from "../services/SessionManager";
import { useDriveStore } from "../store/useDriveStore";
import { formatDuration, getSafetyRating } from "../utils/formatters";

export default function DriveScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // 1. Global State
  const {
    isDriving,
    score,
    events,
    startTime,
    startDriveSession,
    registerEvent,
  } = useDriveStore();

  // 2. Local State (Low-frequency updates only)
  const [elapsedMs, setElapsedMs] = useState(0);

  // 3. Hardware Engine Reference (Bypasses React Lifecycle)
  const engineRef = useRef<SensorManager | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 4. Initialize Hardware on Mount
  useEffect(() => {
    // The callback injected into the physics engine
    const handleEventDetected = (event: TelemetryEvent) => {
      registerEvent(event);
    };

    engineRef.current = new SensorManager(handleEventDetected);

    // Auto-start the drive as soon as the modal opens
    startDriveSession();
    engineRef.current.startDrive();

    // Start the UI timer (updates once per second, perfectly safe for UI thread)
    timerRef.current = setInterval(() => {
      if (useDriveStore.getState().startTime) {
        setElapsedMs(Date.now() - useDriveStore.getState().startTime!);
      }
    }, 1000);

    // CRITICAL: Cleanup function prevents battery drain if modal is force-closed
    return () => {
      if (engineRef.current) engineRef.current.endDrive();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 5. Finalize Logic
  const handleEndDrive = () => {
    Alert.alert("End Drive", "Are you sure you want to finish this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Trip",
        style: "destructive",
        onPress: () => {
          // Shut down the hardware
          if (engineRef.current) engineRef.current.endDrive();
          if (timerRef.current) clearInterval(timerRef.current);

          // Compile data, save to history, and wipe active store
          finalizeDriveSession();

          // Return to dashboard
          router.back();
        },
      },
    ]);
  };

  const currentRating = getSafetyRating(score);
  const ratingColor = colors.status[currentRating.statusKey];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.recordingIndicator}>
          <View style={[styles.recordingDot, styles.recordingDotSpacing]} />
          <Text style={styles.recordingText}>TELEMETRY ACTIVE</Text>
        </View>
        <Text style={styles.timerText}>{formatDuration(0, elapsedMs)}</Text>
      </View>

      {/* CORE GAUGE */}
      <View style={styles.gaugeContainer}>
        <View style={[styles.gaugeCircle, { borderColor: ratingColor }]}>
          <Text style={[styles.scoreValue, { color: ratingColor }]}>
            {score}
          </Text>
          <Text style={styles.scoreLabel}>SAFETY SCORE</Text>
        </View>
        <Text style={[styles.ratingGrade, { color: ratingColor }]}>
          {currentRating.grade}
        </Text>
      </View>

      {/* EVENT LOG */}
      <View style={styles.logWrapper}>
        <Text style={styles.logTitle}>Trip Events ({events.length})</Text>
        <ScrollView
          style={styles.logScroll}
          showsVerticalScrollIndicator={false}
        >
          {events.length === 0 ? (
            <Text style={styles.emptyLogText}>
              No dangerous events detected. Keep it up.
            </Text>
          ) : (
            // Reversing the array to show the newest events at the top
            [...events].reverse().map((ev, idx) => (
              <View key={idx} style={styles.eventCard}>
                <View
                  style={[
                    styles.eventIcon,
                    { backgroundColor: `${colors.status.poor}1A` },
                  ]}
                >
                  <MaterialIcons
                    name="warning"
                    size={20}
                    color={colors.status.poor}
                  />
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTypeName}>
                    {ev.type.replace("_", " ")}
                  </Text>
                  <Text style={styles.eventForce}>
                    Peak Force: {ev.gForce.toFixed(2)}g
                  </Text>
                </View>
                <Text style={styles.eventPenalty}>
                  - {ev.type === "AGGRESSIVE_MOVEMENT" ? 5 : 3}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* END DRIVE ACTION */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.endButton} onPress={handleEndDrive}>
          <MaterialIcons
            name="stop-circle"
            size={24}
            color={colors.text.inverse}
            style={styles.endButtonIcon}
          />
          <Text style={styles.endButtonText}>End Drive</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Dynamic StyleSheet Factory
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 20,
      marginBottom: 40,
    },
    recordingIndicator: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.status.poor}1A`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${colors.status.poor}40`,
    },
    recordingDotSpacing: {
      marginRight: 8,
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.status.poor,
    },
    recordingText: {
      color: colors.status.poor,
      fontSize: 10,
      fontFamily: "monospace", // Or your JetBrains Mono
      letterSpacing: 1,
    },
    timerText: {
      color: colors.text.primary,
      fontSize: 18,
      fontFamily: "monospace",
      fontWeight: "600",
    },
    gaugeContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 40,
    },
    gaugeCircle: {
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background.secondary,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    },
    scoreValue: {
      fontSize: 72,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    scoreLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      letterSpacing: 2,
      marginTop: -5,
    },
    ratingGrade: {
      fontSize: 20,
      fontWeight: "700",
      marginTop: 24,
      letterSpacing: 1,
    },
    logWrapper: {
      flex: 1,
      paddingHorizontal: 24,
    },
    logTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 16,
    },
    logScroll: {
      flex: 1,
    },
    emptyLogText: {
      color: colors.text.secondary,
      textAlign: "center",
      marginTop: 20,
      fontStyle: "italic",
    },
    eventCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background.secondary,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    eventIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    eventDetails: {
      flex: 1,
    },
    eventTypeName: {
      color: colors.text.primary,
      fontWeight: "600",
      fontSize: 14,
      marginBottom: 4,
    },
    eventForce: {
      color: colors.text.secondary,
      fontSize: 12,
      fontFamily: "monospace",
    },
    eventPenalty: {
      color: colors.status.poor,
      fontSize: 18,
      fontWeight: "700",
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 34,
      paddingTop: 16,
    },
    endButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.status.poor, // Crimson red for destructive stop action
      height: 64,
      borderRadius: 12,
    },
    endButtonIcon: {
      marginRight: 8,
    },
    endButtonText: {
      color: colors.text.inverse,
      fontSize: 20,
      fontWeight: "700",
    },
  });

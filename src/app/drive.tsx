import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { useAppTheme } from "../hooks/useAppTheme";
import { TelemetryEvent } from "../services/EventDetector";
import { SensorManager } from "../services/SensorManager";
import { finalizeDriveSession } from "../services/SessionManager";
import { useDriveStore } from "../store/useDriveStore";
import { getSafetyRating } from "../utils/formatters";

export default function DriveScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { score, events, startDriveSession, registerEvent } = useDriveStore();

  const engineRef = useRef<SensorManager | null>(null);

  const [speed, setSpeed] = useState(45);
  const [peakGForce, setPeakGForce] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(100)).current;

  const handleEventDetected = useCallback(
    (event: TelemetryEvent) => {
      setPeakGForce((prev) => Math.max(prev, event.gForce));
      registerEvent(event);
    },
    [registerEvent],
  );

  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue: score,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [score]);

  useEffect(() => {
    engineRef.current = new SensorManager(handleEventDetected);
    startDriveSession();

    engineRef.current.startDrive();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const speedInterval = setInterval(() => {
      setSpeed((prev) =>
        Math.max(0, prev + (Math.floor(Math.random() * 5) - 2)),
      );
    }, 2000);

    return () => {
      if (engineRef.current) engineRef.current.endDrive();
      clearInterval(speedInterval);
    };
  }, []); 

  useEffect(() => {
    engineRef.current?.updateCallback(handleEventDetected);
  }, [handleEventDetected]);

  const handleEndDrive = () => {
    Alert.alert("End Drive", "Are you sure you want to finish this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Trip",
        style: "destructive",
        onPress: () => {
          if (engineRef.current) engineRef.current.endDrive();
          finalizeDriveSession();
          router.replace("/summary");
        },
      },
    ]);
  };

  const safetyRating = getSafetyRating(score);
  const ratingColor = colors.status[safetyRating.statusKey];

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.avatar}>
            <MaterialIcons
              name="account-circle"
              size={24}
              color={colors.text.primary}
            />
          </View>
          <Text style={styles.appBarTitle}>DriveSafe Pro</Text>
        </View>
        <MaterialIcons
          name="verified-user"
          size={24}
          color={colors.brand.primary}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusWrapper}>
          <View style={styles.statusPill}>
            <Animated.View
              style={[
                styles.recordingDot,
                { opacity: pulseAnim, backgroundColor: colors.status.poor },
              ]}
            />
            <Text style={styles.statusText}>REC :: ACTIVE DRIVE</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SAFETY SCORE</Text>
            <View style={styles.gaugeContainer}>
              <Svg width="160" height="160" viewBox="0 0 140 140">
                <Circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={colors.border.default}
                  strokeWidth="12"
                  fill="none"
                />
                <Circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={ratingColor}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                />
              </Svg>
              <View style={styles.gaugeTextContainer}>
                <Text style={styles.gaugeScoreText}>{score}</Text>
              </View>
            </View>
            <View style={styles.trendRow}>
              <MaterialIcons
                name={
                  score >= 80
                    ? "trending-up"
                    : score >= 60
                      ? "trending-flat"
                      : "trending-down"
                }
                size={16}
                color={ratingColor}
              />
              <Text style={[styles.trendText, { color: ratingColor }]}>
                {safetyRating.grade}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>LIVE METRICS</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Events</Text>
                <Text
                  style={[styles.metricValue, { color: colors.status.poor }]}
                >
                  {events.length}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Peak G-Force</Text>
                <Text
                  style={[styles.metricValue, { color: colors.status.good }]}
                >
                  {peakGForce.toFixed(2)}g
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Score Loss</Text>
                <Text
                  style={[styles.metricValue, { color: colors.brand.primary }]}
                >
                  {100 - score}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>CURRENT SPEED</Text>
            <View style={styles.speedContainer}>
              <Text style={styles.speedValue}>{speed}</Text>
              <Text style={styles.speedUnit}>MPH</Text>
            </View>
            <View style={styles.speedBarBg}>
              <View
                style={[
                  styles.speedBarFill,
                  {
                    width: `${(speed / 100) * 100}%`,
                    backgroundColor: colors.brand.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.speedLabels}>
              <Text style={styles.speedLabelText}>0</Text>
              <Text style={styles.speedLabelText}>50</Text>
              <Text style={styles.speedLabelText}>100</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.telemetryHeader}>
              <Text style={styles.cardLabel}>LIVE TELEMETRY</Text>
              <Text style={styles.syncText}>SYNCING 10Hz</Text>
            </View>

            <View style={styles.chartsGrid}>
              <View style={styles.chartBox}>
                <Text style={styles.chartBoxTitle}>ACCEL (X,Y,Z)</Text>
                <View style={styles.chartArea}>
                  <Svg
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 40"
                  >
                    <Path
                      d="M0 20 Q 10 10, 20 25 T 40 15 T 60 30 T 80 20 T 100 25"
                      fill="none"
                      stroke={colors.brand.primary}
                      strokeWidth="1.5"
                    />
                    <Path
                      d="M0 25 Q 15 35, 30 20 T 50 25 T 70 15 T 90 20 T 100 15"
                      fill="none"
                      stroke={colors.status.excellent}
                      strokeWidth="1"
                    />
                  </Svg>
                  <View
                    style={[
                      styles.chartGradient,
                      { backgroundColor: `${colors.brand.primary}1A` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.chartBox}>
                <Text style={styles.chartBoxTitle}>GYRO (Roll,Pitch)</Text>
                <View style={styles.chartArea}>
                  <Svg
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 40"
                  >
                    <Path
                      d="M0 25 Q 10 30, 25 15 T 45 20 T 65 25 T 85 10 T 100 20"
                      fill="none"
                      stroke={colors.status.good}
                      strokeWidth="1.5"
                    />
                  </Svg>
                  <View
                    style={[
                      styles.chartGradient,
                      { backgroundColor: `${colors.status.good}1A` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.card, styles.eventLogCard]}>
            <View style={styles.telemetryHeader}>
              <Text style={styles.cardLabel}>EVENT LOG</Text>
              <MaterialIcons
                name="filter-list"
                size={16}
                color={colors.text.secondary}
              />
            </View>

            {events.length === 0 ? (
              <View style={styles.emptyLog}>
                <Animated.View style={{ opacity: pulseAnim }}>
                  <MaterialIcons
                    name="radar"
                    size={40}
                    color={colors.text.secondary}
                    style={{ marginBottom: 8 }}
                  />
                </Animated.View>
                <Text style={styles.scanningText}>
                  Scanning for anomalies...
                </Text>
                <Text style={styles.noEventsText}>
                  No critical events detected yet.
                </Text>
              </View>
            ) : (
              <View style={styles.eventList}>
                {[...events].reverse().map((ev, i) => (
                  <View key={i} style={styles.eventRow}>
                    <View
                      style={[
                        styles.eventDot,
                        { backgroundColor: colors.status.poor },
                      ]}
                    />
                    <Text style={styles.eventTypeText}>
                      {ev.type.replace(/_/g, " ")}
                    </Text>
                    <Text style={styles.eventGForce}>
                      {ev.gForce.toFixed(2)}g
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.endButton, { backgroundColor: colors.status.poor }]}
          onPress={handleEndDrive}
        >
          <MaterialIcons
            name="stop-circle"
            size={24}
            color={colors.text.inverse}
          />
          <Text style={[styles.endButtonText, { color: colors.text.inverse }]}>
            END DRIVE
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    appBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      height: 64,
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
      zIndex: 10,
    },
    appBarLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border.default,
      alignItems: "center",
      justifyContent: "center",
    },
    appBarTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    scrollContent: {
      padding: 20,
      paddingTop: 32,
      paddingBottom: 120,
    },
    statusWrapper: {
      alignItems: "center",
      marginBottom: 24,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontFamily: "monospace",
      fontSize: 12,
      color: colors.text.secondary,
    },
    grid: {
      gap: 16,
    },
    card: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 16,
      padding: 24,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text.secondary,
      letterSpacing: 1,
      marginBottom: 16,
    },
    gaugeContainer: {
      alignItems: "center",
      justifyContent: "center",
      height: 160,
    },
    gaugeTextContainer: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    gaugeScoreText: {
      fontSize: 48,
      fontWeight: "700",
      color: colors.text.primary,
    },
    trendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      marginTop: 16,
    },
    trendText: {
      fontSize: 14,
      fontFamily: "monospace",
      fontWeight: "600",
    },
    metricsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 12,
    },
    metricBox: {
      flex: 1,
      backgroundColor: `${colors.brand.primary}10`,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: "center",
      borderWidth: 1,
      borderColor: `${colors.brand.primary}20`,
    },
    metricLabel: {
      fontSize: 11,
      color: colors.text.secondary,
      fontWeight: "500",
      marginBottom: 6,
      textTransform: "uppercase",
    },
    metricValue: {
      fontSize: 20,
      fontWeight: "700",
      fontFamily: "monospace",
    },
    speedContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    speedValue: {
      fontSize: 48,
      fontWeight: "700",
      color: colors.text.primary,
      fontFamily: "monospace",
      letterSpacing: -2,
    },
    speedUnit: {
      fontSize: 14,
      color: colors.text.secondary,
      fontFamily: "monospace",
    },
    speedBarBg: {
      width: "100%",
      height: 4,
      backgroundColor: colors.border.default,
      borderRadius: 2,
      marginTop: 24,
      overflow: "hidden",
    },
    speedBarFill: {
      height: "100%",
      borderRadius: 2,
    },
    speedLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    speedLabelText: {
      fontSize: 10,
      fontFamily: "monospace",
      color: colors.text.secondary,
    },
    telemetryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    syncText: {
      fontSize: 10,
      fontFamily: "monospace",
      color: colors.brand.primary,
    },
    chartsGrid: {
      flexDirection: "row",
      gap: 16,
    },
    chartBox: {
      flex: 1,
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 8,
      padding: 12,
    },
    chartBoxTitle: {
      fontSize: 10,
      fontFamily: "monospace",
      color: colors.text.primary,
      marginBottom: 8,
    },
    chartArea: {
      height: 64,
      width: "100%",
      justifyContent: "flex-end",
    },
    chartGradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: 24,
    },
    eventLogCard: {
      minHeight: 200,
    },
    emptyLog: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.6,
    },
    scanningText: {
      fontSize: 14,
      fontFamily: "monospace",
      color: colors.text.secondary,
      marginBottom: 4,
    },
    noEventsText: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    eventList: {
      marginTop: 8,
    },
    eventRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    eventDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 12,
    },
    eventTypeText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      textTransform: "capitalize",
    },
    eventGForce: {
      fontSize: 14,
      fontFamily: "monospace",
      color: colors.text.secondary,
    },
    footer: {
      position: "absolute",
      bottom: 34,
      left: 20,
      right: 20,
    },
    endButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 64,
      borderRadius: 32,
      gap: 12,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    endButtonText: {
      fontSize: 20,
      fontWeight: "700",
      letterSpacing: 1,
    },
  });

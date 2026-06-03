import React, { useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { useHistoryStore } from "../../store/useHistoryStore";
import { useAppTheme } from "../../hooks/useAppTheme";
import { getSafetyRating, formatDuration } from "../../utils/formatters";

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { sessions } = useHistoryStore();

  const { averageScore, totalDrives, totalDriveTime } = useMemo(() => {
    if (sessions.length === 0)
      return { averageScore: 100, totalDrives: 0, totalDriveTime: 0 };

    const total = sessions.reduce(
      (sum, session) => sum + session.totalScore,
      0,
    );
    const time = sessions.reduce(
      (sum, session) => sum + (session.endTime - session.startTime),
      0,
    );

    return {
      averageScore: Math.round(total / sessions.length),
      totalDrives: sessions.length,
      totalDriveTime: time,
    };
  }, [sessions]);

  const rating = getSafetyRating(averageScore);
  const ratingColor = colors.status[rating.statusKey];

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  const chartData = [
    { day: "M", value: 85 },
    { day: "T", value: 92 },
    { day: "W", value: 70 },
    { day: "T", value: 95 },
    { day: "F", value: 88 },
    { day: "S", value: 78 },
    { day: "S", value: 98 },
  ];

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averageScore / 100) * circumference;

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP APP BAR */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <MaterialIcons
              name="person"
              size={20}
              color={colors.text.secondary}
            />
          </View>
          <Text style={styles.headerTitle}>DriveSafe Pro</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${colors.status.excellent}33` },
          ]}
        >
          <MaterialIcons
            name="verified-user"
            size={16}
            color={colors.status.excellent}
          />
          <Text
            style={[styles.statusBadgeText, { color: colors.status.excellent }]}
          >
            SAFE
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* STATS GRID */}
        <View style={styles.grid}>
          {/* Main Score Card */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreCardTop}>
              <View>
                <Text style={styles.cardLabel}>AVG. SCORE</Text>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLarge}>{averageScore}</Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
              </View>

              {/* Circular SVG Gauge */}
              <View style={styles.gaugeContainer}>
                <Svg width="48" height="48" viewBox="0 0 36 36">
                  <Circle
                    cx="18"
                    cy="18"
                    r={radius}
                    stroke={colors.border.default}
                    strokeWidth="4"
                    fill="none"
                  />
                  <Circle
                    cx="18"
                    cy="18"
                    r={radius}
                    stroke={ratingColor}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </Svg>
              </View>
            </View>
            <View style={styles.trendRow}>
              <MaterialIcons
                name="trending-up"
                size={16}
                color={colors.status.excellent}
              />
              <Text
                style={[styles.trendText, { color: colors.status.excellent }]}
              >
                {sessions.length > 0
                  ? "Tracking active"
                  : "Start driving to track"}
              </Text>
            </View>
          </View>

          {/* Secondary Stats */}
          <View style={styles.secondaryGrid}>
            <View style={styles.miniCard}>
              <View style={styles.miniCardHeader}>
                <MaterialIcons
                  name="directions-car"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.cardLabel}>TOTAL TRIPS</Text>
              </View>
              <Text style={styles.miniCardValue}>{totalDrives}</Text>
            </View>
            <View style={styles.miniCard}>
              <View style={styles.miniCardHeader}>
                <MaterialIcons
                  name="timer"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.cardLabel}>TIME LOGGED</Text>
              </View>
              {/* Using total duration instead of miles to match our engine capabilities */}
              <Text style={styles.miniCardValue}>
                {totalDrives > 0 ? formatDuration(0, totalDriveTime) : "0m"}
              </Text>
            </View>
          </View>
        </View>

        {/* RECENT PERFORMANCE CHART */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Recent Performance</Text>
            <Text style={styles.chartSubtitle}>7 Days</Text>
          </View>

          <View style={styles.barsContainer}>
            {chartData.map((data, index) => (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  {/* Dynamic coloring based on the score value */}
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${data.value}%`,
                        backgroundColor:
                          data.value < 75
                            ? colors.brand.accent
                            : colors.status.excellent,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FLOATING ACTION BUTTON (START DRIVE) */}
      <View style={styles.fabContainer}>
        {/* Animated Pulse Ring */}
        <Animated.View
          style={[
            styles.fabPulse,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseOpacity,
              backgroundColor: colors.brand.accent,
            },
          ]}
        />
        {/* Actual Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.brand.accent }]}
          activeOpacity={0.8}
          onPress={() => router.push("/drive")}
        >
          <MaterialIcons
            name="play-arrow"
            size={32}
            color={colors.text.inverse}
          />
          <Text style={[styles.fabText, { color: colors.text.inverse }]}>
            START
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      height: 64,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.05)",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "monospace",
      letterSpacing: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 160, // Leave room for the FAB and Bottom Nav
    },
    grid: {
      gap: 16,
      marginBottom: 16,
    },
    scoreCard: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 16,
      padding: 24,
    },
    scoreCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text.secondary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    scoreRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    scoreLarge: {
      fontSize: 48,
      fontWeight: "700",
      color: colors.text.primary,
    },
    scoreMax: {
      fontSize: 16,
      color: colors.status.excellent,
      fontFamily: "monospace",
    },
    gaugeContainer: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    trendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    trendText: {
      fontSize: 12,
      fontWeight: "600",
    },
    secondaryGrid: {
      flexDirection: "row",
      gap: 16,
    },
    miniCard: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 16,
      padding: 16,
      height: 120,
      justifyContent: "space-between",
    },
    miniCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    miniCardValue: {
      fontSize: 28,
      fontWeight: "600",
      color: colors.text.primary,
    },
    chartCard: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 16,
      padding: 24,
    },
    chartHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    chartTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
    },
    chartSubtitle: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    barsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      height: 120,
      gap: 8,
    },
    barColumn: {
      flex: 1,
      alignItems: "center",
      gap: 8,
      height: "100%",
    },
    barTrack: {
      width: "100%",
      flex: 1,
      backgroundColor: colors.background.primary,
      borderRadius: 4,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    barFill: {
      width: "100%",
      borderRadius: 4,
    },
    barLabel: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    fabContainer: {
      position: "absolute",
      bottom: 24, // Sits exactly above the layout tab bar
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      width: 96,
      height: 96,
    },
    fabPulse: {
      position: "absolute",
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    fab: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
    },
    fabText: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      marginTop: 2,
    },
  });

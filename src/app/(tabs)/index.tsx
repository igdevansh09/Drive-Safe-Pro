// /src/app/(tabs)/index.tsx

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useHistoryStore } from "../../store/useHistoryStore";
import { useAppTheme } from "../../hooks/useAppTheme";
import { getSafetyRating, formatDuration } from "../../utils/formatters";

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { sessions } = useHistoryStore();

  // Calculate aggregates memoized so it only recalculates when sessions change
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.title}>Driver Overview</Text>
        </View>

        {/* PRIMARY ACTION: How the user gets to drive.tsx */}
        <TouchableOpacity
          style={styles.startDriveBtn}
          activeOpacity={0.9}
          onPress={() => router.push("/drive")} // THIS IS THE ROUTING TRIGGER
        >
          <View style={styles.btnContent}>
            <View style={styles.iconWrapper}>
              <MaterialIcons
                name="directions-car"
                size={32}
                color={colors.brand.primary}
              />
            </View>
            <View style={styles.btnTextWrapper}>
              <Text style={styles.btnTitle}>Start New Drive</Text>
              <Text style={styles.btnSub}>Enable telemetry tracking</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={32}
              color={colors.text.secondary}
            />
          </View>
        </TouchableOpacity>

        {/* METRICS GRID */}
        <View style={styles.metricsGrid}>
          {/* Main Score Card */}
          <View
            style={[
              styles.metricCard,
              styles.mainMetricCard,
              { borderColor: ratingColor },
            ]}
          >
            <Text style={styles.metricLabel}>ALL-TIME SCORE</Text>
            <Text style={[styles.metricValueLarge, { color: ratingColor }]}>
              {averageScore}
            </Text>
            <Text style={[styles.metricGrade, { color: ratingColor }]}>
              {rating.grade}
            </Text>
          </View>

          <View style={styles.secondaryMetrics}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TRIPS</Text>
              <Text style={styles.metricValue}>{totalDrives}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TIME</Text>
              <Text style={styles.metricValue}>
                {formatDuration(0, totalDriveTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* RECENT TRIPS PREVIEW */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="timeline"
                size={48}
                color={colors.border.default}
              />
              <Text style={styles.emptyStateText}>No drives recorded yet.</Text>
            </View>
          ) : (
            sessions.slice(0, 3).map((session) => {
              const sessionRating = getSafetyRating(session.totalScore);
              return (
                <View key={session.id} style={styles.tripCard}>
                  <View style={styles.tripLeft}>
                    <Text style={styles.tripDate}>{session.formattedDate}</Text>
                    <Text style={styles.tripDetails}>
                      {formatDuration(session.startTime, session.endTime)} •{" "}
                      {session.eventCount} events
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.scoreBadge,
                      {
                        backgroundColor: `${colors.status[sessionRating.statusKey]}1A`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreBadgeText,
                        { color: colors.status[sessionRating.statusKey] },
                      ]}
                    >
                      {session.totalScore}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 32,
      marginTop: 16,
    },
    greeting: {
      fontSize: 16,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text.primary,
      letterSpacing: -0.5,
    },
    startDriveBtn: {
      backgroundColor: colors.background.secondary,
      borderRadius: 20,
      padding: 20,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: colors.border.default,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    btnContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconWrapper: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: `${colors.brand.primary}1A`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    btnTextWrapper: {
      flex: 1,
    },
    btnTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 4,
    },
    btnSub: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    metricsGrid: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 32,
    },
    mainMetricCard: {
      flex: 1.5,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
    },
    secondaryMetrics: {
      flex: 1,
      gap: 16,
    },
    metricCard: {
      backgroundColor: colors.background.secondary,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    metricLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      fontWeight: "600",
      letterSpacing: 1,
      marginBottom: 8,
    },
    metricValueLarge: {
      fontSize: 48,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    metricGrade: {
      fontSize: 16,
      fontWeight: "700",
      marginTop: 4,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text.primary,
    },
    recentSection: {
      marginTop: 8,
    },
    recentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 16,
    },
    recentTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    seeAllText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.brand.primary,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderStyle: "dashed",
    },
    emptyStateText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.text.secondary,
    },
    tripCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.background.secondary,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    tripLeft: {
      flex: 1,
    },
    tripDate: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    tripDetails: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    scoreBadge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    scoreBadgeText: {
      fontSize: 20,
      fontWeight: "800",
    },
  });

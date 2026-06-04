import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventTimeline } from "../components/summary/EventTimeline";
import { useAppTheme } from "../hooks/useAppTheme";
import { useHistoryStore } from "../store/useHistoryStore";
import { PENALTIES } from "../store/useDriveStore";
import { formatDuration, getSafetyRating } from "../utils/formatters";

const EVENT_ICON_MAP: Record<string, string> = {
  HARSH_BRAKING: "do-not-disturb",
  HARSH_ACCELERATION: "speed",
  SHARP_TURN: "alt-route",
  AGGRESSIVE_STEERING: "swap-calls",
  EXCESSIVE_MOVEMENT: "screen-rotation",
  PHONE_HANDLING: "phone-iphone",
};

const EVENT_SEVERITY_MAP: Record<string, "poor" | "fair" | "good"> = {
  HARSH_BRAKING: "poor",
  HARSH_ACCELERATION: "poor",
  SHARP_TURN: "fair",
  AGGRESSIVE_STEERING: "fair",
  EXCESSIVE_MOVEMENT: "fair",
  PHONE_HANDLING: "poor",
};

export default function SummaryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { sessions } = useHistoryStore();
  const recentSession = sessions[0];

  if (!recentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>No recent drive data found.</Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.doneBtnText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const rating = getSafetyRating(recentSession.totalScore);
  const ratingColor = colors.status[rating.statusKey];
  const peakForce = recentSession.events
    .reduce((max, ev) => Math.max(max, ev.gForce), 0)
    .toFixed(2);

  const eventBreakdown = recentSession.events.reduce(
    (acc, ev) => {
      if (!acc[ev.type]) {
        acc[ev.type] = { count: 0, penalty: 0 };
      }
      acc[ev.type].count += 1;
      acc[ev.type].penalty += PENALTIES[ev.type] ?? 3;
      return acc;
    },
    {} as Record<string, { count: number; penalty: number }>,
  );

  const getAiInsight = (score: number) => {
    if (score >= 90)
      return "Excellent control. Your anticipation of stops and smooth cornering maximizes both safety and fuel efficiency.";
    if (score >= 75)
      return "Good drive, but try to anticipate stops earlier to avoid harsh braking. Consistent deceleration improves safety scores.";
    return "High number of critical events detected. Focus on maintaining a safer following distance and reducing aggressive maneuvers.";
  };

  return (
    <View style={styles.container}>
      <View style={styles.topAnchor}>
        <LinearGradient
          colors={[colors.brand.primary + "20", colors.background.primary]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView>
          <View style={styles.topBar}>
            <Text style={styles.headerTitle}>Session Summary</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => router.replace("/(tabs)")}
            >
              <MaterialIcons
                name="close"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.scoreBento}>
          <View>
            <Text style={styles.scoreLabel}>Safety Score</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreValue, { color: ratingColor }]}>
                {recentSession.totalScore}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: `${ratingColor}1A`,
                borderColor: `${ratingColor}40`,
              },
            ]}
          >
            <MaterialIcons name="verified" size={18} color={ratingColor} />
            <Text style={[styles.statusChipText, { color: ratingColor }]}>
              {rating.grade.split(" ")[0]}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Metadata Row */}
        <View style={styles.metadataRow}>
          <View style={styles.metaCard}>
            <MaterialIcons
              name="speed"
              size={24}
              color={colors.text.secondary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaValue}>{peakForce}</Text>
            <Text style={styles.metaLabel}>peak (g)</Text>
          </View>
          <View style={styles.metaCard}>
            <MaterialIcons
              name="timer"
              size={24}
              color={colors.text.secondary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaValue}>
              {formatDuration(
                recentSession.startTime,
                recentSession.endTime,
              ).replace("m", "")}
            </Text>
            <Text style={styles.metaLabel}>mins</Text>
          </View>
          <View style={styles.metaCard}>
            <MaterialIcons
              name="warning"
              size={24}
              color={
                recentSession.eventCount > 0
                  ? colors.status.poor
                  : colors.text.secondary
              }
              style={styles.metaIcon}
            />
            <Text style={styles.metaValue}>{recentSession.eventCount}</Text>
            <Text style={styles.metaLabel}>events</Text>
          </View>
        </View>

        <View style={styles.aiCard}>
          <MaterialIcons
            name="psychology"
            size={24}
            color={colors.brand.primary}
            style={{ marginTop: 2 }}
          />
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>AI Insights</Text>
            <Text style={styles.aiBody}>
              {getAiInsight(recentSession.totalScore)}
            </Text>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.timelineTitle}>Event Timeline</Text>
          <EventTimeline
            events={recentSession.events}
            startTime={recentSession.startTime}
            endTime={recentSession.endTime}
            colors={colors}
          />
        </View>

        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Event Breakdown</Text>

          {Object.keys(eventBreakdown).length === 0 ? (
            <View style={styles.emptyBreakdown}>
              <Text style={styles.emptyBreakdownText}>
                Perfect drive. No infractions recorded.
              </Text>
            </View>
          ) : (
            Object.entries(eventBreakdown).map(([type, data], index) => {
              const severityKey = EVENT_SEVERITY_MAP[type] ?? "fair";
              const iconColor = colors.status[severityKey];
              const iconName = EVENT_ICON_MAP[type] ?? "warning";

              return (
                <View key={index} style={styles.eventItem}>
                  <View
                    style={[
                      styles.eventIconBox,
                      { backgroundColor: `${iconColor}20` },
                    ]}
                  >
                    <MaterialIcons
                      name={iconName as any}
                      size={20}
                      color={iconColor}
                    />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>
                      {type.replace(/_/g, " ")}
                    </Text>
                    <Text style={styles.eventCount}>
                      {data.count}{" "}
                      {data.count === 1 ? "occurrence" : "occurrences"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.penaltyBox,
                      { backgroundColor: `${iconColor}20` },
                    ]}
                  >
                    <Text style={[styles.penaltyText, { color: iconColor }]}>
                      -{data.penalty}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <LinearGradient
        colors={[
          "transparent",
          `${colors.background.primary}F2`,
          colors.background.primary,
        ]}
        style={styles.bottomNav}
      >
        <TouchableOpacity
          style={styles.doneBtn}
          activeOpacity={0.9}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    errorState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    errorText: {
      color: colors.text.secondary,
      marginBottom: 20,
    },
    topAnchor: {
      position: "relative",
      height: 280,
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
      zIndex: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
      letterSpacing: -0.5,
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: colors.border.default,
      alignItems: "center",
      justifyContent: "center",
    },
    scoreBento: {
      position: "absolute",
      bottom: -24,
      left: 20,
      right: 20,
      backgroundColor: "rgba(28, 27, 27, 0.95)",
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 24,
      padding: 24,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
      zIndex: 20,
    },
    scoreLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 4,
    },
    scoreRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: "700",
      letterSpacing: -1,
    },
    scoreMax: {
      fontSize: 14,
      fontFamily: "monospace",
      color: colors.text.secondary,
    },
    statusChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    statusChipText: {
      fontSize: 14,
      fontFamily: "monospace",
      fontWeight: "600",
    },
    scrollContent: {
      paddingTop: 48,
      paddingHorizontal: 20,
      paddingBottom: 120,
    },
    metadataRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    metaCard: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    metaIcon: {
      marginBottom: 8,
    },
    metaValue: {
      fontSize: 18,
      fontFamily: "monospace",
      color: colors.text.primary,
      fontWeight: "600",
    },
    metaLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 4,
    },
    aiCard: {
      flexDirection: "row",
      backgroundColor: `${colors.brand.primary}0D`,
      borderWidth: 1,
      borderColor: `${colors.brand.primary}33`,
      borderRadius: 12,
      padding: 20,
      gap: 16,
      marginBottom: 24,
    },
    aiContent: {
      flex: 1,
    },
    aiTitle: {
      fontSize: 12,
      color: colors.brand.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: "600",
      marginBottom: 6,
    },
    aiBody: {
      fontSize: 16,
      color: colors.text.primary,
      lineHeight: 24,
    },
    breakdownSection: {
      marginTop: 8,
    },
    breakdownTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 12,
    },
    emptyBreakdown: {
      padding: 24,
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.default,
      alignItems: "center",
    },
    emptyBreakdownText: {
      color: colors.text.secondary,
      fontStyle: "italic",
    },
    eventItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    eventIconBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    eventInfo: {
      flex: 1,
    },
    eventName: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
      textTransform: "capitalize",
    },
    eventCount: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    penaltyBox: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    penaltyText: {
      fontFamily: "monospace",
      fontWeight: "700",
      fontSize: 14,
    },
    timelineSection: {
      marginVertical: 24,
      paddingBottom: 12,
    },
    timelineTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 12,
    },
    bottomNav: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingBottom: 34,
      paddingTop: 24,
    },
    doneBtn: {
      backgroundColor: colors.brand.primary,
      height: 64,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    doneBtnText: {
      color: colors.text.inverse,
      fontSize: 20,
      fontWeight: "700",
    },
  });

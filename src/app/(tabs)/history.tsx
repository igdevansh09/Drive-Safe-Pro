import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  Circle as SvgCircle,
} from "react-native-svg";

import { useAppTheme } from "../../hooks/useAppTheme";
import { useHistoryStore } from "../../store/useHistoryStore";
import { DriveSessionSummary } from "../../types/drive.types";
import { formatDuration, getSafetyRating } from "../../utils/formatters";

export default function HistoryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { sessions } = useHistoryStore();

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.pageTitles}>
        <Text style={styles.mainTitle}>History & Insights</Text>
        <Text style={styles.subTitle}>Analyze your driving performance.</Text>
      </View>

      {/* LOCAL STANDING CARD */}
      <View style={styles.card}>
        <View style={styles.trophyBg}>
          <MaterialIcons
            name="emoji-events"
            size={120}
            color={colors.status.excellent}
          />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcons
              name="leaderboard"
              size={24}
              color={colors.status.excellent}
            />
            <Text style={styles.cardHeaderText}>Local Standing</Text>
          </View>
          <Text
            style={[styles.displayLarge, { color: colors.status.excellent }]}
          >
            Top 15%
          </Text>
          <Text style={styles.bodyText}>
            of drivers in your area based on safety score.
          </Text>
        </View>
      </View>

      {/* IMPROVEMENT AREAS */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRowSpace}>
          <Text style={styles.cardHeaderText}>Improvement Areas</Text>
          <MaterialIcons
            name="lightbulb-outline"
            size={24}
            color={colors.status.good}
          />
        </View>

        <View style={styles.improvementList}>
          {/* Item 1: High Priority (Red) */}
          <View style={styles.improvementItem}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${colors.status.poor}20` },
              ]}
            >
              <MaterialIcons
                name="smartphone"
                size={20}
                color={colors.status.poor}
              />
            </View>
            <View style={styles.improvementDetails}>
              <Text style={styles.improvementTitle}>Phone Distraction</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: "45%", backgroundColor: colors.status.poor },
                  ]}
                />
              </View>
            </View>
            <Text
              style={[
                styles.improvementSeverity,
                { color: colors.status.poor },
              ]}
            >
              High
            </Text>
          </View>

          {/* Item 2: Medium Priority (Amber) */}
          <View style={styles.improvementItem}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${colors.status.good}20` },
              ]}
            >
              <MaterialIcons
                name="alt-route"
                size={20}
                color={colors.status.good}
              />
            </View>
            <View style={styles.improvementDetails}>
              <Text style={styles.improvementTitle}>Turn Smoothness</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: "65%", backgroundColor: colors.status.good },
                  ]}
                />
              </View>
            </View>
            <Text
              style={[
                styles.improvementSeverity,
                { color: colors.status.good },
              ]}
            >
              Med
            </Text>
          </View>
        </View>
      </View>

      {/* TRENDS CHART */}
      <View style={[styles.card, styles.chartCard]}>
        <View style={styles.cardHeaderRowSpace}>
          <Text style={styles.cardHeaderText}>Monthly Trend</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Last 30 Days</Text>
          </View>
        </View>

        <View style={styles.chartWrapper}>
          <Svg
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <Defs>
              <LinearGradient
                id="chartGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <Stop
                  offset="0%"
                  stopColor={colors.status.excellent}
                  stopOpacity="0.2"
                />
                <Stop
                  offset="100%"
                  stopColor={colors.status.excellent}
                  stopOpacity="0"
                />
              </LinearGradient>
            </Defs>
            <Path
              d="M0,100 L0,50 Q20,30 40,60 T80,20 T100,10 L100,100 Z"
              fill="url(#chartGradient)"
            />
            <Path
              d="M0,50 Q20,30 40,60 T80,20 T100,10"
              fill="none"
              stroke={colors.status.excellent}
              strokeLinecap="round"
              strokeWidth="2"
            />
            <SvgCircle
              cx="40"
              cy="60"
              r="3"
              fill={colors.background.secondary}
              stroke={colors.status.excellent}
              strokeWidth="1.5"
            />
            <SvgCircle
              cx="80"
              cy="20"
              r="3"
              fill={colors.background.secondary}
              stroke={colors.status.excellent}
              strokeWidth="1.5"
            />
          </Svg>

          <View style={styles.yAxis}>
            <Text style={styles.axisText}>100</Text>
            <Text style={styles.axisText}>75</Text>
            <Text style={styles.axisText}>50</Text>
          </View>
        </View>
        <View style={styles.xAxis}>
          <Text style={styles.axisText}>Oct 1</Text>
          <Text style={styles.axisText}>Oct 15</Text>
          <Text style={styles.axisText}>Oct 31</Text>
        </View>
      </View>

      {/* COMPARISON BUTTON */}
      <TouchableOpacity
        style={[
          styles.comparisonBtn,
          { backgroundColor: `${colors.brand.primary}15` },
        ]}
        onPress={() => router.push("/comparison")}
      >
        <MaterialIcons
          name="compare-arrows"
          size={20}
          color={colors.brand.primary}
        />
        <Text
          style={[styles.comparisonBtnText, { color: colors.brand.primary }]}
        >
          Compare Drives
        </Text>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={colors.brand.primary}
        />
      </TouchableOpacity>

      {/* RECENT DRIVES HEADER */}
      <View style={styles.recentDrivesHeader}>
        <Text style={styles.cardHeaderText}>Recent Drives</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Filter</Text>
          <MaterialIcons
            name="filter-list"
            size={16}
            color={colors.brand.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSessionCard = ({ item }: { item: DriveSessionSummary }) => {
    const rating = getSafetyRating(item.totalScore);
    const ratingColor = colors.status[rating.statusKey];

    const timeString = new Date(item.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const peakG = item.events.reduce((max, ev) => Math.max(max, ev.gForce), 0);

    return (
      <TouchableOpacity activeOpacity={0.7} style={styles.driveCard}>
        <View style={styles.driveCardTop}>
          <View>
            <Text style={styles.driveTitle}>Recorded Trip</Text>
            <View style={styles.driveDateRow}>
              <MaterialIcons
                name="calendar-today"
                size={14}
                color={colors.text.secondary}
              />
              <Text style={styles.driveDate}>
                {item.formattedDate}, {timeString}
              </Text>
            </View>
          </View>

          {/* Dynamic Score Ring */}
          <View
            style={[
              styles.scoreRing,
              { borderColor: ratingColor, backgroundColor: `${ratingColor}1A` },
            ]}
          >
            <Text style={[styles.scoreRingText, { color: ratingColor }]}>
              {item.totalScore}
            </Text>
          </View>
        </View>

        <View style={styles.driveCardGrid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Peak Force</Text>
            <Text style={styles.gridValue}>
              {peakG > 0 ? `${peakG.toFixed(2)}g` : "0.0g"}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Duration</Text>
            <Text style={styles.gridValue}>
              {formatDuration(item.startTime, item.endTime)}
            </Text>
          </View>
          <View style={styles.gridItemRight}>
            <Text style={styles.gridLabel}>Events</Text>
            <Text style={[styles.gridValue, { color: ratingColor }]}>
              {item.eventCount} {item.eventCount === 1 ? "Alert" : "Alerts"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP APP BAR */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.avatar}>
            <MaterialIcons
              name="person"
              size={16}
              color={colors.brand.primary}
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

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderSessionCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.bodyText}>No drives recorded yet.</Text>
          </View>
        )}
      />
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
      backgroundColor: "rgba(28, 27, 27, 0.9)", // surface-container-low matching mockup
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.05)",
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
      backgroundColor: `${colors.brand.primary}33`,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${colors.border.default}33`,
    },
    appBarTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 120, // Padding for floating tab bar
    },
    headerSection: {
      marginBottom: 8,
    },
    pageTitles: {
      marginBottom: 24,
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    subTitle: {
      fontSize: 16,
      color: colors.text.secondary,
    },
    card: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
      overflow: "hidden",
    },
    trophyBg: {
      position: "absolute",
      top: -20,
      right: -20,
      opacity: 0.1,
    },
    cardContent: {
      position: "relative",
      zIndex: 10,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },
    cardHeaderRowSpace: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    cardHeaderText: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
    },
    displayLarge: {
      fontSize: 48,
      fontWeight: "700",
      marginBottom: 4,
      letterSpacing: -1,
    },
    bodyText: {
      fontSize: 16,
      color: colors.text.secondary,
    },
    improvementList: {
      gap: 12,
    },
    improvementItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor: colors.background.primary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(193, 198, 215, 0.1)",
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    improvementDetails: {
      flex: 1,
    },
    improvementTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
      marginBottom: 8,
    },
    progressBarBg: {
      width: "100%",
      height: 6,
      backgroundColor: colors.border.default,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 3,
    },
    improvementSeverity: {
      fontSize: 14,
      fontWeight: "500",
      fontFamily: "monospace",
      marginLeft: 16,
    },
    chartCard: {
      minHeight: 250,
      display: "flex",
    },
    chip: {
      backgroundColor: colors.border.default,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(193, 198, 215, 0.2)",
    },
    chipText: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    chartWrapper: {
      flex: 1,
      minHeight: 120,
      position: "relative",
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
      paddingBottom: 24,
    },
    yAxis: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 24,
      justifyContent: "space-between",
      opacity: 0.5,
    },
    xAxis: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 12,
    },
    axisText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontFamily: "monospace",
    },
    comparisonBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginVertical: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: `${colors.brand.primary}30`,
    },
    comparisonBtnText: {
      fontSize: 14,
      fontWeight: "600",
    },
    recentDrivesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      marginBottom: 16,
    },
    filterBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    filterText: {
      color: colors.brand.primary,
      fontSize: 12,
      fontWeight: "500",
    },
    driveCard: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    driveCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    driveTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
      marginBottom: 4,
    },
    driveDateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    driveDate: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    scoreRing: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    scoreRingText: {
      fontSize: 14,
      fontFamily: "monospace",
      fontWeight: "600",
    },
    driveCardGrid: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
      paddingTop: 12,
    },
    gridItem: {
      flex: 1,
    },
    gridItemRight: {
      flex: 1,
      alignItems: "flex-end",
    },
    gridLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    gridValue: {
      fontSize: 14,
      color: colors.text.primary,
      fontFamily: "monospace",
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: "center",
    },
  });

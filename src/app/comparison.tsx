import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../hooks/useAppTheme";
import { useHistoryStore } from "../store/useHistoryStore";
import { formatDuration, getSafetyRating } from "../utils/formatters";

export default function ComparisonScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { sessions } = useHistoryStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(true);

  const driveA = selectedIds[0]
    ? sessions.find((s) => s.id === selectedIds[0])
    : null;
  const driveB = selectedIds[1]
    ? sessions.find((s) => s.id === selectedIds[1])
    : null;

  const handleSelectDrive = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setShowPicker(true);
  };

  const improvement =
    driveA && driveB ? driveB.totalScore - driveA.totalScore : 0;

  if (sessions.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compare Drives</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <MaterialIcons
            name="history"
            size={64}
            color={colors.text.secondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            Need at least 2 drives
          </Text>
          <Text
            style={[styles.emptySubtitle, { color: colors.text.secondary }]}
          >
            Complete more driving sessions to compare performance
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showPicker && selectedIds.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Drives</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
            Select 2 drives to compare
          </Text>
          <FlatList
            data={sessions}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedIds.includes(item.id);
              const rating = getSafetyRating(item.totalScore);
              const ratingColor = colors.status[rating.statusKey];

              return (
                <TouchableOpacity
                  style={[
                    styles.driveCard,
                    {
                      backgroundColor: isSelected
                        ? `${colors.brand.primary}15`
                        : colors.background.secondary,
                      borderColor: isSelected
                        ? colors.brand.primary
                        : colors.border.default,
                    },
                  ]}
                  onPress={() => handleSelectDrive(item.id)}
                >
                  <View style={styles.driveCardContent}>
                    <View>
                      <Text
                        style={[
                          styles.driveDate,
                          { color: colors.text.primary },
                        ]}
                      >
                        {item.formattedDate}
                      </Text>
                      <Text
                        style={[
                          styles.driveDetails,
                          { color: colors.text.secondary },
                        ]}
                      >
                        {formatDuration(item.startTime, item.endTime)} •{" "}
                        {item.eventCount} events
                      </Text>
                    </View>
                    <View style={styles.scoreChip}>
                      <Text style={[styles.scoreText, { color: ratingColor }]}>
                        {item.totalScore}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color={colors.brand.primary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </ScrollView>
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={[
              styles.compareBtn,
              {
                backgroundColor:
                  selectedIds.length === 2
                    ? colors.brand.primary
                    : colors.text.secondary + "40",
              },
            ]}
            disabled={selectedIds.length !== 2}
            onPress={() => setShowPicker(false)}
          >
            <Text style={styles.compareBtnText}>
              Compare {selectedIds.length}/2
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Drives</Text>
        <TouchableOpacity onPress={handleClearSelection}>
          <MaterialIcons name="edit" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {improvement > 0 && (
          <View
            style={[
              styles.improvementBanner,
              { backgroundColor: `${colors.status.excellent}15` },
            ]}
          >
            <MaterialIcons
              name="trending-up"
              size={20}
              color={colors.status.excellent}
            />
            <Text
              style={[
                styles.improvementText,
                { color: colors.status.excellent },
              ]}
            >
              +{improvement} point improvement!
            </Text>
          </View>
        )}

        {improvement < 0 && (
          <View
            style={[
              styles.improvementBanner,
              { backgroundColor: `${colors.status.poor}15` },
            ]}
          >
            <MaterialIcons
              name="trending-down"
              size={20}
              color={colors.status.poor}
            />
            <Text
              style={[styles.improvementText, { color: colors.status.poor }]}
            >
              {improvement} points
            </Text>
          </View>
        )}

        <View style={styles.comparisonGrid}>
          <ComparisonMetric
            label="Safety Score"
            valueA={driveA?.totalScore || 0}
            valueB={driveB?.totalScore || 0}
            suffix=""
            colors={colors}
          />
          <ComparisonMetric
            label="Events"
            valueA={driveA?.eventCount || 0}
            valueB={driveB?.eventCount || 0}
            suffix=""
            colors={colors}
            lowerIsBetter
          />
          <ComparisonMetric
            label="Duration"
            valueA={
              Math.round(
                (driveA ? (driveA.endTime - driveA.startTime) / 60000 : 0) * 10,
              ) / 10
            }
            valueB={
              Math.round(
                (driveB ? (driveB.endTime - driveB.startTime) / 60000 : 0) * 10,
              ) / 10
            }
            suffix="m"
            colors={colors}
          />
          <ComparisonMetric
            label="Date"
            valueA={driveA?.formattedDate || "-"}
            valueB={driveB?.formattedDate || "-"}
            suffix=""
            isText
            colors={colors}
          />
        </View>

        {driveA && driveB && (
          <View style={styles.eventComparison}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Event Comparison
            </Text>

            <View style={styles.comparisonRow}>
              <View style={styles.comparisonColumn}>
                <Text
                  style={[styles.columnLabel, { color: colors.text.secondary }]}
                >
                  {driveA.formattedDate}
                </Text>
                {(() => {
                  const eventTypesA = Object.entries(
                    driveA.events.reduce(
                      (acc, ev) => {
                        acc[ev.type] = (acc[ev.type] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>,
                    ),
                  );
                  return eventTypesA.map(([type, count]) => (
                    <View key={type} style={styles.eventRow}>
                      <Text
                        style={[
                          styles.eventName,
                          { color: colors.text.primary },
                        ]}
                      >
                        {type.replace("_", " ")}
                      </Text>
                      <Text
                        style={[
                          styles.eventCount,
                          { color: colors.text.secondary },
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  ));
                })()}
              </View>

              <View style={styles.comparisonColumn}>
                <Text
                  style={[styles.columnLabel, { color: colors.text.secondary }]}
                >
                  {driveB.formattedDate}
                </Text>
                {(() => {
                  const eventTypesB = Object.entries(
                    driveB.events.reduce(
                      (acc, ev) => {
                        acc[ev.type] = (acc[ev.type] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>,
                    ),
                  );
                  return eventTypesB.map(([type, count]) => (
                    <View key={type} style={styles.eventRow}>
                      <Text
                        style={[
                          styles.eventName,
                          { color: colors.text.primary },
                        ]}
                      >
                        {type.replace("_", " ")}
                      </Text>
                      <Text
                        style={[
                          styles.eventCount,
                          { color: colors.text.secondary },
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  ));
                })()}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ComparisonMetricProps {
  label: string;
  valueA: number | string;
  valueB: number | string;
  suffix: string;
  colors: any;
  lowerIsBetter?: boolean;
  isText?: boolean;
}

function ComparisonMetric({
  label,
  valueA,
  valueB,
  suffix,
  colors,
  lowerIsBetter,
  isText,
}: ComparisonMetricProps) {
  let winner: "a" | "b" | null = null;

  if (!isText && typeof valueA === "number" && typeof valueB === "number") {
    if (valueA > valueB && !lowerIsBetter) winner = "a";
    if (valueB > valueA && !lowerIsBetter) winner = "b";
    if (valueA < valueB && lowerIsBetter) winner = "a";
    if (valueB < valueA && lowerIsBetter) winner = "b";
  }

  return (
    <View style={createStyles(colors).metricCard}>
      <Text style={[createStyles(colors).metricLabel, { color: colors.text.secondary }]}>
        {label}
      </Text>
      <View style={createStyles(colors).metricValues}>
        <View
          style={[
            createStyles(colors).metricValue,
            {
              backgroundColor:
                winner === "a"
                  ? `${colors.status.excellent}20`
                  : colors.background.tertiary,
            },
          ]}
        >
          <Text style={[createStyles(colors).metricNumber, { color: colors.text.primary }]}>
            {valueA}
            <Text style={{ color: colors.text.secondary }}>{suffix}</Text>
          </Text>
        </View>
        <View
          style={[
            createStyles(colors).metricValue,
            {
              backgroundColor:
                winner === "b"
                  ? `${colors.status.excellent}20`
                  : colors.background.tertiary,
            },
          ]}
        >
          <Text style={[createStyles(colors).metricNumber, { color: colors.text.primary }]}>
            {valueB}
            <Text style={{ color: colors.text.secondary }}>{suffix}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: 100,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      marginTop: 8,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 12,
    },
    driveCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
    },
    driveCardContent: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    driveDate: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    driveDetails: {
      fontSize: 12,
    },
    scoreChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    scoreText: {
      fontSize: 14,
      fontWeight: "700",
      fontFamily: "monospace",
    },
    checkmark: {
      marginLeft: 12,
    },
    bottomAction: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background.primary,
    },
    compareBtn: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    compareBtnText: {
      color: colors.text.inverse,
      fontSize: 16,
      fontWeight: "700",
    },
    improvementBanner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginBottom: 20,
      gap: 8,
    },
    improvementText: {
      fontSize: 14,
      fontWeight: "600",
    },
    comparisonGrid: {
      gap: 12,
      marginBottom: 24,
    },
    metricCard: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 12,
      padding: 16,
    },
    metricLabel: {
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    metricValues: {
      flexDirection: "row",
      gap: 12,
    },
    metricValue: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    metricNumber: {
      fontSize: 18,
      fontWeight: "700",
      fontFamily: "monospace",
    },
    eventComparison: {
      marginVertical: 16,
    },
    comparisonRow: {
      flexDirection: "row",
      gap: 12,
    },
    comparisonColumn: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    columnLabel: {
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    eventRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6,
      marginBottom: 4,
    },
    eventName: {
      fontSize: 13,
      fontWeight: "500",
    },
    eventCount: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "monospace",
    },
  });

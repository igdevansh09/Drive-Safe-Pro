// /src/app/(tabs)/history.tsx

import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useHistoryStore } from "../../store/useHistoryStore";
import { DriveSessionSummary } from "../../types/drive.types";
import { formatDuration, getSafetyRating } from "../../utils/formatters";

export default function HistoryScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { sessions, clearHistory } = useHistoryStore();

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Drive Logs",
      "Are you sure you want to permanently delete all driving history from this device?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => clearHistory(),
        },
      ],
    );
  };

  const renderSessionCard = ({ item }: { item: DriveSessionSummary }) => {
    const rating = getSafetyRating(item.totalScore);
    const ratingColor = colors.status[rating.statusKey];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateWrapper}>
            <MaterialIcons
              name="calendar-today"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.dateText}>{item.formattedDate}</Text>
          </View>
          <View
            style={[styles.scoreBadge, { backgroundColor: `${ratingColor}1A` }]}
          >
            <Text style={[styles.scoreText, { color: ratingColor }]}>
              {item.totalScore}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialIcons
              name="timer"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={[styles.statText, styles.statTextSpacing]}>
              {formatDuration(item.startTime, item.endTime)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons
              name="warning-amber"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={[styles.statText, styles.statTextSpacing]}>
              {item.eventCount} Infractions
            </Text>
          </View>
        </View>

        {/* Render a breakdown of the specific events if any occurred */}
        {item.events.length > 0 && (
          <View style={styles.eventBreakdown}>
            {item.events.slice(0, 3).map((ev, index) => (
              <View key={index} style={styles.miniEventRow}>
                <View
                  style={[
                    styles.eventDot,
                    { backgroundColor: colors.status.poor },
                  ]}
                />
                <Text style={styles.miniEventText}>
                  {ev.type.replace("_", " ")}
                </Text>
                <Text style={styles.miniEventForce}>
                  {ev.gForce.toFixed(2)}g
                </Text>
              </View>
            ))}
            {item.events.length > 3 && (
              <Text style={styles.moreEventsText}>
                + {item.events.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drive Logs</Text>
        {sessions.length > 0 && (
          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.clearBtn}
          >
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSessionCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="inbox"
              size={48}
              color={colors.border.default}
            />
            <Text style={styles.emptyTitle}>No History</Text>
            <Text style={styles.emptySub}>
              Your completed drives will appear here.
            </Text>
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text.primary,
      letterSpacing: -0.5,
    },
    clearBtn: {
      padding: 8,
      marginRight: -8,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    dateWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    dateText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginLeft: 8,
    },
    scoreBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
    },
    scoreText: {
      fontSize: 18,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    statsRow: {
      flexDirection: "row",
      marginBottom: 16,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    statText: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: "500",
    },
    statTextSpacing: {
      marginLeft: 6,
    },
    eventBreakdown: {
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
      paddingTop: 12,
      marginTop: 12,
    },
    miniEventRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    eventDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 8,
    },
    miniEventText: {
      flex: 1,
      fontSize: 12,
      color: colors.text.secondary,
      textTransform: "capitalize",
    },
    miniEventForce: {
      fontSize: 12,
      color: colors.text.primary,
      fontFamily: "monospace",
    },
    moreEventsText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontStyle: "italic",
      marginTop: 4,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySub: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: "center",
    },
  });

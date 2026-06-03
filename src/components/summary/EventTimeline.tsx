import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TelemetryEvent } from "../../services/EventDetector";

interface EventTimelineProps {
  events: TelemetryEvent[];
  startTime: number;
  endTime: number;
  colors: any;
}

export function EventTimeline({
  events,
  startTime,
  endTime,
  colors,
}: EventTimelineProps) {
  const totalDuration = endTime - startTime;

  const eventIconMap: Record<string, string> = {
    HARSH_BRAKING: "braking-stop",
    HARSH_ACCELERATION: "speed",
    SHARP_TURN: "alt-route",
    AGGRESSIVE_STEERING: "zig-zag-up",
    EXCESSIVE_MOVEMENT: "screen-rotation",
    PHONE_HANDLING: "phone-iphone",
  };

  const eventColorMap: Record<string, string> = {
    HARSH_BRAKING: colors.status.poor,
    HARSH_ACCELERATION: colors.status.poor,
    SHARP_TURN: colors.status.fair,
    AGGRESSIVE_STEERING: colors.status.fair,
    EXCESSIVE_MOVEMENT: colors.status.fair,
    PHONE_HANDLING: colors.status.poor,
  };

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.timestamp - b.timestamp),
    [events],
  );

  if (sortedEvents.length === 0) {
    return (
      <View style={styles.emptyTimeline}>
        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
          No events recorded
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.timelineTrack}>
        <View
          style={[
            styles.timelineBar,
            { backgroundColor: colors.background.tertiary },
          ]}
        />

        {sortedEvents.map((event, index) => {
          const relativeTime = event.timestamp - startTime;
          const positionPercent = (relativeTime / totalDuration) * 100;
          const iconName = eventIconMap[event.type] || "alert-circle";
          const eventColor = eventColorMap[event.type] || colors.text.secondary;

          return (
            <View
              key={`${event.timestamp}-${index}`}
              style={[
                styles.eventMarker,
                {
                  left: `${positionPercent}%`,
                },
              ]}
            >
              <View
                style={[
                  styles.eventDot,
                  {
                    backgroundColor: eventColor,
                    borderColor: colors.background.primary,
                  },
                ]}
              >
                <MaterialIcons name={iconName} size={12} color="white" />
              </View>

              <View
                style={[
                  styles.eventLabel,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: eventColor,
                  },
                ]}
              >
                <Text
                  style={[styles.eventType, { color: eventColor }]}
                  numberOfLines={1}
                >
                  {event.type.replace("_", " ")}
                </Text>
                <Text
                  style={[styles.eventForce, { color: colors.text.secondary }]}
                >
                  {event.gForce.toFixed(2)}g
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.timelineScale}>
        <Text style={[styles.timeLabel, { color: colors.text.secondary }]}>
          Start
        </Text>
        <Text style={[styles.timeLabel, { color: colors.text.secondary }]}>
          End
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  timelineTrack: {
    position: "relative",
    height: 120,
    marginBottom: 32,
  },
  timelineBar: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    height: 2,
  },
  eventMarker: {
    position: "absolute",
    alignItems: "center",
    width: 48,
    transform: [{ translateX: -24 }],
  },
  eventDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  eventLabel: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  eventType: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  eventForce: {
    fontSize: 9,
    marginTop: 2,
    fontFamily: "monospace",
  },
  timelineScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  emptyTimeline: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },
});

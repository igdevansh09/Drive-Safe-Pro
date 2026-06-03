import React from "react";
import { Text, View } from "react-native";

export default function DriveCard({ summary }: any) {
  return (
    <View>
      <Text>Drive Summary — {summary?.id ?? "id"}</Text>
    </View>
  );
}

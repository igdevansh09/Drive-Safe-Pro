import React from "react";
import { Text, View } from "react-native";

export default function DriveChart({ data }: any) {
  return (
    <View>
      <Text>Chart — points: {Array.isArray(data) ? data.length : 0}</Text>
    </View>
  );
}

import React from "react";
import { Text, View } from "react-native";

export default function GForceGauge({ g = 0 }: { g?: number }) {
  return (
    <View>
      <Text>G: {g.toFixed(2)}</Text>
    </View>
  );
}

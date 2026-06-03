import React from "react";
import { Text, View } from "react-native";

export default function ScoreDial({ score = 0 }: { score?: number }) {
  return (
    <View>
      <Text>Score: {score}</Text>
    </View>
  );
}

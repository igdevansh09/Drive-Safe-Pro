import React from "react";
import { StyleSheet, View } from "react-native";

export default function Card({ children }: any) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({ card: { padding: 12 } });

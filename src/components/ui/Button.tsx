import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Button({ title, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn}>
      <Text style={styles.txt}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 10 },
  txt: { fontSize: 16 },
});

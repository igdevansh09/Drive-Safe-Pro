import React from "react";
import { TextInput as RNTextInput, StyleSheet } from "react-native";

export default function TextInput(props: any) {
  return <RNTextInput style={styles.input} {...props} />;
}

const styles = StyleSheet.create({ input: { padding: 8, borderWidth: 1 } });

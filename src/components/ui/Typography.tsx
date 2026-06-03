import React from "react";
import { Text, TextProps } from "react-native";

export function H1(props: TextProps) {
  return <Text {...props} style={[{ fontSize: 20 }, props.style]} />;
}
export function Body(props: TextProps) {
  return <Text {...props} style={[{ fontSize: 14 }, props.style]} />;
}

export default Body;

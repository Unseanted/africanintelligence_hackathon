import React from "react";
import { Text, TextProps } from "react-native";

// Color Constants
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#9CA3AF";
const PRIMARY = "#3B82F6";

interface ThemedTextProps extends TextProps {
  type?: "default" | "primary" | "secondary" | "accent";
  size?: "small" | "medium" | "large";
}

export function ThemedText({
  style,
  type = "default",
  size = "medium",
  ...props
}: ThemedTextProps) {
  const getTextColor = () => {
    switch (type) {
      case "primary":
        return PRIMARY;
      case "secondary":
        return TEXT_SECONDARY;
      case "accent":
        return PRIMARY;
      default:
        return TEXT_PRIMARY;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return 12;
      case "large":
        return 18;
      default:
        return 14;
    }
  };

  return (
    <Text
      style={[
        {
          color: getTextColor(),
          fontSize: getTextSize(),
        },
        style,
      ]}
      {...props}
    />
  );
}
export default ThemedText
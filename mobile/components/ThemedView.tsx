import React from "react";
import { View, ViewProps } from "react-native";

// Color Constants
const BACKGROUND = "#111827";
const CARD_BACKGROUND = "rgba(255, 255, 255, 0.05)";
const BORDER_COLOR = "rgba(255, 255, 255, 0.1)";
const PRIMARY = "#3B82F6";

interface ThemedViewProps extends ViewProps {
  type?: "default" | "card" | "header";
}

export function ThemedView({
  style,
  type = "default",
  ...props
}: ThemedViewProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case "card":
        return CARD_BACKGROUND;
      case "header":
        return PRIMARY;
      default:
        return BACKGROUND;
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderColor: type === "card" ? BORDER_COLOR : "transparent",
          borderWidth: type === "card" ? 1 : 0,
        },
        style,
      ]}
      {...props}
    />
  );
}

export default ThemedView;

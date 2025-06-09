import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedText({ style, lightColor, darkColor, ...otherProps }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? darkColor : lightColor;

  return (
    <Text
      style={[
        styles.text,
        { color },
        style,
      ]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});

export default ThemedText; 
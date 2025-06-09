import { View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  gradient?: boolean;
  gradientColors?: string[];
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  gradient = false,
  gradientColors,
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');

  if (gradient) {
    const colors = gradientColors || [backgroundColor, accentColor, primaryColor];
    return (
      <LinearGradient
        colors={colors}
        style={[{ flex: 1 }, style]}
        {...otherProps}
      />
    );
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

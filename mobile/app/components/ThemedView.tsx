import React from 'react';
import { View, ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ children, style, ...props }) => {
  return (
    <View style={[{ backgroundColor: '#111827' }, style]} {...props}>
      {children}
    </View>
  );
};

export default ThemedView; 
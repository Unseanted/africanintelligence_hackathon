import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
}

export const IconSymbol: React.FC<IconSymbolProps> = ({ name, size = 24, color = '#ffffff' }) => {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
};

export default IconSymbol; 
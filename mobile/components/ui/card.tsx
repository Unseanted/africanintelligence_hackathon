import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      {...props}
    />
  );
}

export default Card;
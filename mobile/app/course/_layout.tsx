import React from 'react';
import { Stack } from 'expo-router';
import { TourLMSProvider } from '../contexts/TourLMSContext';

export default function CourseLayout() {
  return (
    <TourLMSProvider>
      <Stack>
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </TourLMSProvider>
  );
} 
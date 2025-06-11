import React from 'react';
import { TourLMSProvider } from '../contexts/TourLMSContext';
import Forum from '../../src/pages/student/Forum';

export default function ForumScreen() {
  return (
    <TourLMSProvider>
      <Forum />
    </TourLMSProvider>
  );
} 
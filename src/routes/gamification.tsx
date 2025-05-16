import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProgressDashboard } from '../components/gamification/ProgressDashboard';
import { Leaderboard } from '../components/gamification/Leaderboard';
import { Achievements } from '../components/gamification/Achievements';
import { GamificationService } from '../services/gamificationService';

// Mock user stats for demonstration
const mockUserStats = {
  userId: '1',
  totalXp: 1500,
  currentStreak: 7,
  longestStreak: 10,
  lastActivityDate: new Date(),
  achievements: [],
  courseProgress: {
    'course-1': {
      courseId: 'course-1',
      xp: 500,
      completedLessons: ['lesson-1', 'lesson-2'],
      currentStreak: 3,
      lastActivityDate: new Date(),
    },
  },
};

export const GamificationRoutes = () => {
  return (
    <Routes>
      {/* Main progress dashboard */}
      <Route
        path="/progress"
        element={<ProgressDashboard userStats={mockUserStats} />}
      />

      {/* Course-specific progress */}
      <Route
        path="/courses/:courseId/progress"
        element={<ProgressDashboard userStats={mockUserStats} courseId="course-1" />}
      />

      {/* Global leaderboard */}
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* Course-specific leaderboard */}
      <Route path="/courses/:courseId/leaderboard" element={<Leaderboard courseId="course-1" />} />

      {/* Achievements page */}
      <Route
        path="/achievements"
        element={<Achievements achievements={mockUserStats.achievements} />}
      />
    </Routes>
  );
}; 
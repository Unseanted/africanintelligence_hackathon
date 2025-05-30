import React, { createContext, useContext, useState, useCallback } from 'react';
import { xpService } from '@/services/xp';
import { badgeService } from '@/services/badges';
import XPNotification from '@/components/xp/XPNotification';
import { useTourLMS } from '@/contexts/TourLMSContext';

const XPContext = createContext();

export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
};

export const XPProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [userXP, setUserXP] = useState(null);
  const { user } = useTourLMS();

  const awardXP = useCallback(async (userId, action, metadata = {}) => {
    try {
      const result = await xpService.awardXP(userId, action, metadata);
      setUserXP(result);

      // Check for new badges
      const newBadges = await badgeService.checkAndAwardBadges(userId, action, metadata);

      // Add notification for XP
      const points = xpService.xpActions[action] || 0;
      const message = getActionMessage(action, metadata);
      
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now(),
          points,
          message
        }
      ]);

      // Add notifications for new badges
      newBadges.forEach(badge => {
        setNotifications(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            points: badge.xpReward,
            message: `Earned badge: ${badge.title}`,
            isBadge: true,
            badge
          }
        ]);
      });

      return result;
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const getActionMessage = (action, metadata) => {
    const messages = {
      COMPLETE_LESSON: `Completed lesson: ${metadata.lessonTitle}`,
      COMPLETE_QUIZ: `Completed quiz: ${metadata.quizTitle}`,
      POST_COMMENT: 'Posted a comment',
      RECEIVE_LIKE: 'Received a like on your comment',
      GIVE_LIKE: 'Liked a comment',
      DAILY_LOGIN: 'Logged in today',
      COMPLETE_COURSE: `Completed course: ${metadata.courseTitle}`,
      ACHIEVE_STREAK: `Achieved a ${metadata.streakDays}-day streak!`,
      EARN_ACHIEVEMENT: `Earned achievement: ${metadata.achievementTitle}`
    };

    return messages[action] || 'Earned XP';
  };

  // Load user XP when user changes
  React.useEffect(() => {
    const loadUserXP = async () => {
      if (user?._id) {
        try {
          const xpData = await xpService.getUserXP(user._id);
          setUserXP(xpData);
        } catch (error) {
          console.error('Error loading user XP:', error);
        }
      }
    };

    loadUserXP();
  }, [user?._id]);

  const value = {
    userXP,
    awardXP,
    notifications
  };

  return (
    <XPContext.Provider value={value}>
      {children}
      {notifications.map(notification => (
        <XPNotification
          key={notification.id}
          points={notification.points}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
          isBadge={notification.isBadge}
          badge={notification.badge}
        />
      ))}
    </XPContext.Provider>
  );
};

export default XPContext; 
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { xpService } from '@/services/xp';
import { badgeService } from '@/services/badges';
import { useTourLMS } from '@/contexts/TourLMSContext';
import XPNotification from '@/components/xp/XPNotification';

const XPContext = createContext();

export const XPProvider = ({ children }) => {
  const { user } = useTourLMS();
  const [state, setState] = useState({
    xpData: null,
    notifications: [],
    badges: [],
    recentActivity: []
  });

  const loadUserData = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const [xpData, badges, activity] = await Promise.all([
        xpService.getUserXP(user._id),
        badgeService.getUserBadges(user._id),
        xpService.getRecentActivity(user._id)
      ]);
      
      setState(prev => ({
        ...prev,
        xpData: xpService.enrichXPData(xpData),
        badges,
        recentActivity: activity
      }));
    } catch (error) {
      console.error('Error loading user XP data:', error);
    }
  }, [user?._id]);

  const awardXP = useCallback(async (action, metadata = {}) => {
    if (!user?._id) return;

    try {
      const [xpResult, newBadges] = await Promise.all([
        xpService.awardXP(user._id, action, metadata),
        badgeService.checkAndAwardBadges(user._id, action, metadata)
      ]);

      setState(prev => ({
        ...prev,
        xpData: xpResult,
        badges: [...prev.badges, ...newBadges],
        notifications: [
          ...prev.notifications,
          createNotification('xp', action, metadata, xpResult.points),
          ...newBadges.map(badge => createNotification('badge', badge))
        ]
      }));

      return xpResult;
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  }, [user?._id]);

  const createNotification = (type, data, metadata, points) => {
    const id = Date.now() + Math.random();
    
    if (type === 'xp') {
      return {
        id,
        type: 'xp',
        points,
        action: data,
        message: getXPMessage(data, metadata),
        metadata
      };
    }
    
    if (type === 'badge') {
      return {
        id,
        type: 'badge',
        badge: data,
        message: `Unlocked badge: ${data.title}`,
        points: data.xpReward
      };
    }
    
    if (type === 'level') {
      return {
        id,
        type: 'level',
        level: data,
        message: `Level Up! Reached Level ${data}`,
        points: metadata?.points
      };
    }
  };

  const getXPMessage = (action, metadata) => {
    const messages = {
      COMPLETE_LESSON: `Completed lesson: ${metadata.lessonTitle} (+{points} XP)`,
      QUIZ_PASS: `Passed quiz with ${metadata.score}% (+{points} XP)`,
      CHALLENGE_COMPLETE: `Completed challenge: ${metadata.challengeName} (+{points} XP)`,
      DAILY_STREAK: `${metadata.streakDays}-day streak! (+{points} XP)`
    };
    
    return messages[action] || `Earned ${points} XP`;
  };

  const removeNotification = useCallback((id) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return (
    <XPContext.Provider value={{
      ...state,
      awardXP,
      removeNotification,
      calculateLevel: xpService.calculateLevel,
      calculateDynamicXP: xpService.calculateDynamicXP
    }}>
      {children}
      {state.notifications.map(notification => (
        <XPNotification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </XPContext.Provider>
  );
};

export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) throw new Error('useXP must be used within XPProvider');
  return context;
};
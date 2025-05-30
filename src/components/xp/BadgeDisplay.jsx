import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';
import { badgeService } from '@/services/badges';
import { useSocket } from '@/services/socketService';
import { useXP } from '@/contexts/XPContext';

const BadgeDisplay = ({ userId }) => {
  const [badges, setBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState({});
  const [newBadge, setNewBadge] = useState(null);
  const socket = useSocket();
  const { awardXP } = useXP();

  useEffect(() => {
    const loadBadges = async () => {
      const [userBadges, progress] = await Promise.all([
        badgeService.getUserBadges(userId),
        badgeService.getBadgeProgress(userId)
      ]);
      setBadges(userBadges);
      setBadgeProgress(progress);
    };

    if (userId) {
      loadBadges();
    }
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('badge:earned', async (data) => {
      const badge = badgeService.getBadgeById(data.badgeId);
      if (badge) {
        setNewBadge(badge);
        // Award XP for the badge
        await awardXP(userId, 'EARN_ACHIEVEMENT', {
          achievementTitle: badge.title,
          points: badge.xpReward
        });
        // Update badges list
        setBadges(prev => [...prev, badge]);
      }
    });

    socket.on('badge:progress', (progress) => {
      setBadgeProgress(prev => ({ ...prev, ...progress }));
    });

    return () => {
      socket.off('badge:earned');
      socket.off('badge:progress');
    };
  }, [socket, userId, awardXP]);

  const badgeTypes = {
    PROGRESS: 'Learning Progress',
    STREAK: 'Learning Streaks',
    COMMUNITY: 'Community Engagement',
    SPECIAL: 'Special Achievements'
  };

  return (
    <div className="space-y-6">
      {/* New Badge Notification */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50"
            onAnimationComplete={() => setTimeout(() => setNewBadge(null), 3000)}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{newBadge.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">New Badge Earned!</p>
                <p className="text-sm text-gray-600">{newBadge.title}</p>
                <p className="text-xs text-blue-600">+{newBadge.xpReward} XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badges by Category */}
      {Object.entries(badgeTypes).map(([type, title]) => (
        <Card key={type} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badgeService.getBadgesByType(type).map((badge) => {
              const isEarned = badges.some(b => b.id === badge.id);
              const progress = badgeProgress[badge.id] || 0;

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border ${
                    isEarned
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <h4 className="font-medium text-sm">{badge.title}</h4>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                  {!isEarned && progress > 0 && (
                    <div className="mt-2">
                      <Progress value={progress} className="h-1" />
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(progress)}% Complete
                      </p>
                    </div>
                  )}
                  {isEarned && (
                    <Badge variant="outline" className="mt-2 text-green-600 border-green-200">
                      Earned
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BadgeDisplay; 
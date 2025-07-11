import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Award, Star, TrendingUp } from 'lucide-react';

const iconMap = {
  xp: <TrendingUp className="text-amber-500" />,
  badge: <Award className="text-blue-500" />,
  level: <Star className="text-purple-500" />,
  streak: <Zap className="text-yellow-500" />,
  challenge: <Trophy className="text-green-500" />
};

export const XPNotification = ({ notification, onClose }) => {
  const getNotificationClass = () => {
    switch (notification.type) {
      case 'badge':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800';
      case 'level':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800';
      default:
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg border shadow-lg flex items-start gap-3 w-80 ${getNotificationClass()}`}
      >
        <div className="mt-0.5">
          {iconMap[notification.type] || iconMap.xp}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {notification.message}
          </h3>
          {notification.type === 'badge' && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {notification.badge.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          &times;
        </button>
        
        {notification.points && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full"
          >
            +{notification.points}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
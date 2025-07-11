import React, { useState, useEffect } from "react";
import { BADGES, BADGE_CATEGORIES, getBadgeProgress } from "../../data/badges";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from '@/services/socketService';
import { motion, AnimatePresence } from "framer-motion";
import { badgeService } from '@/services/badgeService';

// Helper components
const BadgeProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
    <div 
      className="bg-blue-500 h-1.5 rounded-full" 
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

const BadgeTierIndicator = ({ tier }) => {
  if (!tier || tier < 2) return null;
  return (
    <span className="absolute -top-1 -right-1 text-xs">
      {tier === 2 ? '②' : tier === 3 ? '③' : ''}
    </span>
  );
};

const BadgeStatusLabel = ({ unlocked, progress }) => (
  <span className={`text-[10px] mt-1 ${unlocked ? 'text-green-600' : 'text-gray-500'}`}>
    {unlocked ? 'Unlocked' : `${Math.round(progress)}% complete`}
  </span>
);

const BadgeDetailsPanel = ({ badge, show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-2 p-2 bg-white border rounded text-xs text-center"
      >
        {badge.description}
        {badge.exclusive && (
          <div className="text-yellow-600 mt-1">Exclusive Badge</div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

const CategoryFilter = ({ categories, activeCategory, onChange }) => (
  <div className="flex flex-wrap gap-2 mb-6">
    {categories.map(category => (
      <button
        key={category}
        onClick={() => onChange(category)}
        className={`px-3 py-1 text-sm rounded-full ${
          activeCategory === category 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        {category}
      </button>
    ))}
  </div>
);

const ProgressHeader = ({ unlockedCount, totalBadges }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">
      Badges Progress: {unlockedCount}/{totalBadges}
    </h2>
    <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-green-500 h-2.5 rounded-full" 
        style={{ width: `${Math.min(100, Math.max(0, (unlockedCount / totalBadges) * 100))}%` }}
      />
    </div>
  </div>
);

export const Badges = ({ stats = {} }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showDetails, setShowDetails] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState(new Set());
  const [currentStats, setCurrentStats] = useState(badgeService.getStats());
  const { toast } = useToast();
  const socket = useSocket();

  // Derived values
  const categories = ['All', ...Object.values(BADGE_CATEGORIES)];
  const filteredBadges = activeCategory === 'All' 
    ? BADGES 
    : BADGES.filter(badge => badge.category === activeCategory);
  const unlockedCount = BADGES.filter(badge => badge.unlock(currentStats)).length;
  const totalBadges = BADGES.length;

  // Initialize badge service with socket
  useEffect(() => {
    if (socket) {
      badgeService.initialize(socket);
    }
  }, [socket]);

  // Update stats in badge service and local state
  useEffect(() => {
    badgeService.updateStats(stats);
    setCurrentStats(badgeService.getStats());
  }, [stats]);

  // Check for newly unlocked badges
  useEffect(() => {
    const checkNewBadges = () => {
      BADGES.forEach(badge => {
        if (badge.unlock(currentStats) && !unlockedBadges.has(badge.id)) {
          setUnlockedBadges(prev => new Set([...prev, badge.id]));
          showBadgeUnlockToast(badge);
        }
      });
    };

    checkNewBadges();
  }, [currentStats, unlockedBadges]);

  // Listen for real-time badge updates
  useEffect(() => {
    if (!socket) return;

    const handleBadgeUnlock = (badgeId) => {
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge && !unlockedBadges.has(badgeId)) {
        setUnlockedBadges(prev => new Set([...prev, badgeId]));
        setCurrentStats(badgeService.getStats());
        showBadgeUnlockToast(badge);
      }
    };

    socket.on('badge:unlocked', handleBadgeUnlock);
    return () => socket.off('badge:unlocked', handleBadgeUnlock);
  }, [socket, unlockedBadges]);

  // Check time-based badges periodically
  useEffect(() => {
    const interval = setInterval(() => {
      badgeService.checkTimeBasedBadges();
      setCurrentStats(badgeService.getStats());
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const showBadgeUnlockToast = (badge) => {
    toast({
      title: "New Badge Unlocked! 🎉",
      description: `${badge.name}: ${badge.description}`,
      duration: 5000,
    });
  };

  const handleBadgeClick = (badgeId) => {
    setShowDetails(prev => prev === badgeId ? null : badgeId);
  };

  return (
    <div className="space-y-4">
      <ProgressHeader 
        unlockedCount={unlockedCount} 
        totalBadges={totalBadges} 
      />

      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {filteredBadges.map(badge => {
            const unlocked = badge.unlock(currentStats);
            const progress = getBadgeProgress(badge, currentStats);
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleBadgeClick(badge.id)}
                className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  unlocked 
                    ? "border-green-400 bg-green-50 hover:bg-green-100" 
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                } ${badge.exclusive ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <span className="text-3xl relative">
                  {badge.icon}
                  <BadgeTierIndicator tier={badge.tier} />
                </span>
                
                <span className="text-xs font-semibold mt-1 text-center">
                  {badge.name}
                </span>
                
                <BadgeProgressBar progress={progress} />
                <BadgeStatusLabel unlocked={unlocked} progress={progress} />
                
                <BadgeDetailsPanel 
                  badge={badge} 
                  show={showDetails === badge.id} 
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
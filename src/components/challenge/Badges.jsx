// Badges.jsx (enhanced component)
import React, { useState } from "react";
import { BADGES, BADGE_CATEGORIES, getBadgeProgress } from "../../data/badges";

export const Badges = ({ stats = { 
  currentStreak: 0, 
  coursesCompleted: 0, 
  totalXp: 0, 
  weeklyRank: null,
  isEarlyAdopter: false,
  perfectWeeks: 0,
  communityContributions: 0
} }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showDetails, setShowDetails] = useState(null);

  const categories = ['All', ...Object.values(BADGE_CATEGORIES)];
  
  const filteredBadges = activeCategory === 'All' 
    ? BADGES 
    : BADGES.filter(badge => badge.category === activeCategory);

  const unlockedCount = BADGES.filter(badge => badge.unlock(stats)).length;
  const totalBadges = BADGES.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Badges Progress: {unlockedCount}/{totalBadges}
        </h2>
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full" 
            style={{ width: `${(unlockedCount / totalBadges) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredBadges.map(badge => {
          const unlocked = badge.unlock(stats);
          const progress = getBadgeProgress(badge, stats);
          
          return (
            <div
              key={badge.id}
              onClick={() => setShowDetails(badge.id === showDetails ? null : badge.id)}
              className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                unlocked 
                  ? "border-green-400 bg-green-50 hover:bg-green-100" 
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              } ${badge.exclusive ? 'ring-2 ring-yellow-400' : ''}`}
            >
              <span className="text-3xl relative">
                {badge.icon}
                {badge.tier === 2 && <span className="absolute -top-1 -right-1 text-xs">②</span>}
                {badge.tier === 3 && <span className="absolute -top-1 -right-1 text-xs">③</span>}
              </span>
              
              <span className="text-xs font-semibold mt-1 text-center">
                {badge.name}
              </span>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              {unlocked ? (
                <span className="text-green-600 text-[10px] mt-1">Unlocked</span>
              ) : (
                <span className="text-gray-500 text-[10px] mt-1">
                  {Math.round(progress)}% complete
                </span>
              )}
              
              {showDetails === badge.id && (
                <div className="mt-2 p-2 bg-white border rounded text-xs text-center">
                  {badge.description}
                  {badge.exclusive && <div className="text-yellow-600 mt-1">Exclusive Badge</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
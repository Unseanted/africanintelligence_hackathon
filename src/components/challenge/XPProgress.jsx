// XPProgress.jsx (enhanced)
import React from "react";

export const XPProgress = ({ currentXp, nextLevelXp, level = 1 }) => {
  const percent = Math.min((currentXp / nextLevelXp) * 100, 100);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border shadow-sm">
      <div className="relative h-14 w-14">
        <svg className="h-full w-full" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="#f59e0b"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 24 24)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-amber-600">{level}</span>
        </div>
      </div>
      <div>
        <div className="font-medium text-gray-800">Level {level}</div>
        <div className="text-xs text-gray-500">
          {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className="bg-amber-500 h-1.5 rounded-full"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
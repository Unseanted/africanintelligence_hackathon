import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Award, BarChart2, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GamificationNavProps {
  courseId?: string;
}

export const GamificationNav: React.FC<GamificationNavProps> = ({ courseId }) => {
  const location = useLocation();
  const basePath = courseId ? `/courses/${courseId}` : '';

  const navItems = [
    {
      name: 'Progress',
      href: `${basePath}/progress`,
      icon: BarChart2,
    },
    {
      name: 'Achievements',
      href: `${basePath}/achievements`,
      icon: Trophy,
    },
    {
      name: 'Leaderboard',
      href: `${basePath}/leaderboard`,
      icon: Award,
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center text-sm font-medium transition-colors hover:text-primary',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}; 
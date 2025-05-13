
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface Stat {
  number: string;
  label: string;
}

interface StatsSectionProps {
  stats: Stat[];
  isVisible: {
    features: boolean;
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats, isVisible }) => {
  return (
    <section className="bg-gradient-to-r from-red-600 to-red-800 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.p 
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0.8 }}
                animate={isVisible.features ? { scale: 1 } : {}}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  delay: 0.5 + (index * 0.1) 
                }}
              >
                {stat.number}
              </motion.p>
              <p className="text-lg opacity-90">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;


import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, Users, Play } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  features: Feature[];
  isVisible: {
    features: boolean;
  };
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features, isVisible }) => {
  return (
    <section className="py-20 px-6">
      <motion.div 
        className="max-w-7xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Why Choose Our Smart Tourism & Hospitality LMS?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our platform delivers cutting-edge learning experiences tailored for the emerging digital tourism landscape in Plateau State
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10 }}
          >
            <div className="bg-red-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;

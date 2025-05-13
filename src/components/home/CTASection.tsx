
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  isVisible: {
    cta: boolean;
  };
}

const CTASection: React.FC<CTASectionProps> = ({ isVisible }) => {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 opacity-90"></div>
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1563237739-e42da07697ce?auto=format&fit=crop&w=1920" 
          alt="Plateau State Landscape" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      <motion.div 
        className="max-w-4xl mx-auto text-center relative z-10 text-white"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isVisible.cta ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Transform Your Tourism & Hospitality Career Today
        </h2>
        <p className="text-xl md:text-2xl mb-10 opacity-90">
          Join thousands of students learning the latest digital skills for the tourism industry
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8">
              Get Started Now
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;

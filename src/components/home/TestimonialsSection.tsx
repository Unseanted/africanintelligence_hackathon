
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  text: string;
  name: string;
  role: string;
  image: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  isVisible: {
    testimonials: boolean;
  };
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials, isVisible }) => {
  return (
    <section className="py-20 px-6">
      <motion.div 
        className="max-w-7xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible.testimonials ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          What Our Students Say
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Success stories from tourism professionals who transformed their careers
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="bg-white p-8 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible.testimonials ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="inline-block w-5 h-5 text-yellow-500 fill-current" />
              ))}
            </div>
            <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
            <div className="flex items-center">
              <img 
                src={testimonial.image} 
                alt={testimonial.name} 
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />
              <div>
                <h4 className="font-semibold">{testimonial.name}</h4>
                <p className="text-gray-600 text-sm">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;

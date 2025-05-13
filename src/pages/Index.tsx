
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Cpu, 
  BookOpen, 
  Users, 
  Award, 
  Play, 
  Globe, 
  Shield, 
  Heart, 
  Sprout, 
  School, 
  Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1280",
      title: "African Intelligence Learning Initiative",
      description: "Empowering Africa through advanced education, AI learning, and technological innovation."
    },
    {
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1280",
      title: "AI-Powered Learning Experience",
      description: "Merging cutting-edge technology with African wisdom to create the future leaders of tomorrow."
    },
    {
      image: "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1280",
      title: "Education Without Barriers",
      description: "Accessible quality education that transcends geographical limitations across the continent."
    }
  ];

  useEffect(() => {
    // Auto-rotate slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const features = [
    { icon: <BookOpen className="h-10 w-10 text-red-600" />, title: "Expert-Led Learning", description: "Courses created and taught by industry experts and academic professionals in AI and technology." },
    { icon: <Award className="h-10 w-10 text-red-600" />, title: "Recognized Certifications", description: "Earn industry-recognized certificates to boost your career prospects and opportunities." },
    { icon: <Users className="h-10 w-10 text-red-600" />, title: "Collaborative Community", description: "Join a vibrant network of learners and facilitators pushing the boundaries of innovation." },
    { icon: <Play className="h-10 w-10 text-red-600" />, title: "Interactive Content", description: "Engage with dynamic learning materials, including video lectures, interactive assignments, and hands-on projects." },
  ];

  const stats = [
    { number: "30+", label: "AI Courses" },
    { number: "15,000+", label: "Learners" },
    { number: "70+", label: "Partners" },
    { number: "97%", label: "Success Rate" },
  ];

  const topCourses = [
    { id: 1, title: "African AI: Foundations and Applications", instructor: "Dr. Nnamdi Azikiwe", image: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800", rating: 4.9, students: 600 },
    { id: 2, title: "Machine Learning for African Development", instructor: "Prof. Amina Mohammed", image: "https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=800", rating: 4.8, students: 750 },
    { id: 3, title: "Data Science: African Case Studies", instructor: "Dr. Kofi Annan", image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800", rating: 4.7, students: 520 },
  ];

  const testimonials = [
    { text: "The AI course transformed my career! I now lead a tech team developing solutions for agricultural challenges in East Africa.", name: "Makena Ochieng", role: "Data Scientist, Kenya", image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100" },
    { text: "The personalized learning approach and community support made complex AI concepts accessible and applicable to our local challenges.", name: "Fatima Diallo", role: "AI Developer, Senegal", image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100" },
    { text: "This platform bridges theory with practical application. I've implemented what I learned to improve healthcare delivery in my community.", name: "Emmanuel Nkosi", role: "Health Tech Innovator, South Africa", image: "https://images.pexels.com/photos/3748221/pexels-photo-3748221.jpeg?auto=compress&cs=tinysrgb&w=100" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans">
      {/* Hero Section */}
      <section className="relative h-[85vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 flex items-center z-20 px-6 md:px-20 max-w-7xl mx-auto">
              <motion.div 
                className="text-white max-w-2xl"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => navigate("/register")} size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
                    Get Started
                  </Button>
                  <Button onClick={() => navigate("/login")} variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        ))}

        {/* Slide indicators */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                currentSlide === index ? "bg-red-500" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            African Intelligence aims to transform education across Africa from 0 to 100, 
            leveraging AI learning and cutting-edge technologies. We provide carefully structured courses 
            with highly skilled facilitators, making it easier for learners to master complex subjects and skills.
          </p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="py-6">
                <motion.p 
                  className="text-4xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.p>
                <p className="text-red-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Featured Courses</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mb-12">
            Discover our most popular courses designed to equip you with the skills needed for the future.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">Instructor: {course.instructor}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span>{course.rating}</span>
                      <span className="text-gray-500">({course.students} students)</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => navigate("/login")}
                    >
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Success Stories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mb-12">
            Hear from our learners who have transformed their careers and made an impact across Africa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Start Your Learning Journey Today</h2>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Join thousands of learners across Africa who are mastering AI, technology, and innovation to solve local challenges and build a better future.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/register")}
              className="bg-white text-red-600 hover:bg-gray-100 px-8"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/courses")}
              className="border-white text-white hover:bg-white/10"
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4">
                <Cpu className="h-6 w-6 text-red-500 mr-2" />
                <span className="font-bold text-xl">AFRICAN INTELLIGENCE</span>
              </div>
              <p className="text-gray-400">
                Empowering Africa through education, innovation, and technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Courses</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">AI & Machine Learning</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Data Science</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Web Development</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mobile Development</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500">© {new Date().getFullYear()} African Intelligence LMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

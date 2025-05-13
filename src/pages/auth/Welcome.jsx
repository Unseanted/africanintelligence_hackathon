import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass, Award, Backpack, Globe, ChevronRight, Cpu } from "lucide-react";
import confetti from "canvas-confetti";
import { useTourLMS } from "../../contexts/TourLMSContext";

const Welcome = () => {
  const { user } = useTourLMS();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Redirect if no user is authenticated
  useEffect(() => {
    setTimeout(() => {
      if (!user) navigate("/login");
    }, 3000);
  }, [user, navigate]);
  
  // Trigger confetti effect
  useEffect(() => {
    if (showConfetti) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const confettiInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(confettiInterval);
          setShowConfetti(false);
          return;
        }
        
        confetti({
          particleCount: 2,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { y: 0.6 },
          colors: ["#e25822", "#f9a826", "#3498db", "#2ecc71", "#9b59b6"],
        });
      }, 250);
      
      return () => clearInterval(confettiInterval);
    }
  }, [showConfetti]);

  function handleContinue(){
    const courseId=localStorage.getItem('waitingCourse');
    if(courseId&&user.role=='student'){
      localStorage.removeItem('waitingCourse');
      navigate(`/student/courses/${courseId}`)
    }else{navigate(role === "facilitator" ? "/facilitator" : "/student");}
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600 mb-6">
            <Cpu className="h-10 w-10 text-white" /> {/* Swapped Award for Cpu */}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Welcome to the African Intelligence Tribe!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Greetings, {user.name}! You’ve joined the tribe where Africa’s mind ignites the world—your ascent begins now.
          </p>
        </div>
        
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="h-48 bg-cover bg-center" 
               style={{ backgroundImage: "url('https://images.pexels.com/photos/614494/pexels-photo-614494.jpeg?auto=compress&cs=tinysrgb&w=2000')" }}>
            <div className="h-full bg-gradient-to-r from-red-600/80 to-red-900/80 flex items-center px-8">
              <div className="text-white max-w-lg">
                <h2 className="text-3xl font-bold mb-2">Your Tribal Quest Awaits</h2>
                <p>A griot’s welcome has been sent to your inbox—unveil the secrets to launch your journey!</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Next steps in the tribe:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-red-50 rounded-xl p-6">
                <Compass className="h-10 w-10 text-red-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Seek Tribal Wisdom</h4>
                <p className="text-gray-600 mb-4">Dive into griot-led courses forging Africa’s tech and tourism future.</p>
                <Link to={user.role === "student" ? "/student/courses" : "/facilitator/courses"}>
                  <Button variant="link" className="text-red-600 p-0 h-auto">
                    Unveil Courses <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <Backpack className="h-10 w-10 text-blue-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Craft Your Mark</h4>
                <p className="text-gray-600 mb-4">Etch your tribal identity to amplify your place in the ascent.</p>
                <Link to={`/${user.role}/account`}>
                  <Button variant="link" className="text-blue-600 p-0 h-auto">
                    Shape Profile <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <Globe className="h-10 w-10 text-green-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Unite with the Tribe</h4>
                <p className="text-gray-600 mb-4">Forge bonds with warriors and griots in our digital council.</p>
                <Link to={`/${user.role}/forum`}>
                  <Button variant="link" className="text-green-600 p-0 h-auto">
                    Join Council <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 h-auto text-lg"
                onClick={() => handleContinue()}
              >
                Enter Tribal Hub
              </Button>
            </div>
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Voices from the tribe</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-center mb-4">
                <img 
                  src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100" 
                  alt="Amina S." 
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              <p className="text-gray-600 italic mb-4">"African Intelligence turned my Rift Valley tours into a VR empire—clients worldwide now!"</p>
              <p className="font-semibold">Amina S.</p>
              <p className="text-sm text-gray-500">Tribal Trailblazer</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-center mb-4">
                <img 
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100" 
                  alt="Tunde O." 
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              <p className="text-gray-600 italic mb-4">"As a griot, I wield this platform to pass Africa’s tech fire to the next warriors."</p>
              <p className="font-semibold">Tunde O.</p>
              <p className="text-sm text-gray-500">Tribal Griot</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md md:hidden lg:block">
              <div className="flex justify-center mb-4">
                <img 
                  src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100" 
                  alt="Zara N." 
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              <p className="text-gray-600 italic mb-4">"The tribal council here links me to Africa’s boldest minds—unstoppable energy!"</p>
              <p className="font-semibold">Zara N.</p>
              <p className="text-sm text-gray-500">Tribal Navigator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
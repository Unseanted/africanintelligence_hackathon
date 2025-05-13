import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Compass, Cpu, Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTourLMS } from "@/contexts/TourLMSContext";
import { image_01 } from "../../js/Data";
import { GoogleLogin } from '@react-oauth/google';
import { clg } from "../../lib/basic";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, API_URL } = useTourLMS();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login({ email, password, role });
      const courseId = localStorage.getItem('waitingCourse');
      
      if (result.success) {
        toast({
          title: "Access Granted!",
          description: `Welcome back, ${result.user.name}, to African Intelligence!`,
        });
        if (courseId && role === 'student') {
          localStorage.removeItem('waitingCourse');
          navigate(`/student/courses/${courseId}`);
        } else {
          navigate(role === "facilitator" ? "/facilitator" : "/student");
        }
      } else {
        toast({
          title: "Access Denied",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Access Denied",
        description: "Something went wrong. Verify your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
          role,
        }),
      });

      const result = await response.json();
      if (response.ok && result.user && result.token) {
        const loginResult = await login({
          email: result.user.email,
          password: '',
          role: result.user.role,
          user: result.user,
          token: result.token,
        });

        if (loginResult.success) {
          toast({
            title: "Access Granted!",
            description: `Welcome back, ${result.user.name}, to African Intelligence!`,
          });
          const courseId = localStorage.getItem('waitingCourse');
          if (courseId && role === 'student') {
            localStorage.removeItem('waitingCourse');
            navigate(`/student/courses/${courseId}`);
          } else {
            navigate(role === "facilitator" ? "/facilitator" : "/student");
          }
        } else {
          throw new Error('Failed to process Google login');
        }
      } else {
        throw new Error(result.message || 'Google login failed');
      }
    } catch (error) {
      console.error("Google Login error:", error);
      toast({
        title: "Access Denied",
        description: error.message || "Failed to login with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="w-full md:w-1/2 bg-cover bg-center relative hidden md:block"
        style={{
          backgroundImage: `url(${image_01})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center px-12">
          <div className="max-w-md">
            <p className="text-xl text-amber-300 mb-8">
              Unleash the genius of Africa’s mind—where tourism meets technology, and knowledge fuels ascendancy.
            </p>
            <div className="flex flex-col space-y-6">
              <div className="flex items-center">
                <div className="bg-amber-500/30 p-2 rounded-full mr-4">
                  <Compass className="text-amber-100 h-6 w-6" />
                </div>
                <div>
                  <p className="text-amber-100 font-medium">Griot-Guided Paths</p>
                  <p className="text-amber-300 text-sm">Wisdom from Africa’s tech pioneers</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-amber-500/30 p-2 rounded-full mr-4">
                  <MapPin className="text-amber-100 h-6 w-6" />
                </div>
                <div>
                  <p className="text-amber-100 font-medium">Pan-African Vision</p>
                  <p className="text-amber-300 text-sm">Insights rooted in our continent</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-amber-500/30 p-2 rounded-full mr-4">
                  <Cpu className="text-amber-100 h-6 w-6" />
                </div>
                <div>
                  <p className="text-amber-100 font-medium">Smart Innovation</p>
                  <p className="text-amber-300 text-sm">AI shaping Africa’s future</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-black">
        <div className="w-full max-w-md relative">
          <Card className="bg-slate-900/50 border border-gold-300/20 backdrop-blur-xl shadow-2xl shadow-amber-500/20 rounded-2xl overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/20 rounded-full animate-pulse"></div>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Link to="/">
                    <div className="rounded-full bg-amber-500 p-3 animate-bounce shadow-lg shadow-amber-500/50 cursor-pointer hover:bg-amber-600 transition-colors">
                      <Cpu className="h-8 w-8 text-white" />
                    </div>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-amber-100">African Intelligence Login</h1>
                <p className="text-amber-300 mt-2">Reclaim your place in Africa’s digital ascent</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-amber-100 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@africanintelligence.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-slate-800 border-gold-300/20 text-amber-100 placeholder-gold-400 focus:ring-2 focus:ring-amber-500 transition-all duration-300 shadow-inner hover:bg-amber-500/10"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-amber-100 font-medium">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-slate-800 border-gold-300/20 text-amber-100 placeholder-gold-400 focus:ring-2 focus:ring-amber-500 transition-all duration-300 shadow-inner hover:bg-amber-500/10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-amber-100 font-medium">I am a</Label>
                  <Select value={role} onValueChange={setRole} disabled={isLoading}>
                    <SelectTrigger className="bg-slate-800 border-gold-300/20 text-amber-100 focus:ring-2 focus:ring-amber-500 shadow-inner hover:bg-amber-500/10 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-gold-300/20 text-amber-100 backdrop-blur-md">
                      <SelectItem value="facilitator" className="hover:bg-amber-500/30">Facilitator</SelectItem>
                      <SelectItem value="student" className="hover:bg-amber-500/30">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Entering...
                    </>
                  ) : (
                    "Enter African Intelligence"
                  )}
                </Button>

                <div className="w-full">
                  <div className="w-full h-12 rounded-lg overflow-hidden">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => {
                        toast({
                          title: "Google Login Failed",
                          description: "Unable to authenticate with Google. Please try again.",
                          variant: "destructive",
                        });
                        setIsLoading(false);
                      }}
                      width="100%"
                      theme="filled_black"
                      text="continue_with"
                      disabled={isLoading}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </form>

              <p className="text-center mt-6 text-amber-300">
                New to the tribe?{" "}
                <Link to="/register" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                  Join Now
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
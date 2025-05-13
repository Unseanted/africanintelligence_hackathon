import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Compass, Cpu, Check, Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTourLMS } from "@/contexts/TourLMSContext";
import { image_02 } from "../../js/Data";
import { GoogleLogin } from '@react-oauth/google';
import { clg } from "../../lib/basic";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, API_URL } = useTourLMS();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Ensure your passwords align, warrior.",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreeTerms) {
      toast({
        title: "Tribal Pact",
        description: "Accept the tribe’s code to join the ascent.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = { name, email, password, role };
      const result = await register(userData);
      
      if (result.success) {
        toast({
          title: "Tribe Welcomes You!",
          description: "You’ve joined African Intelligence. Onward to greatness!",
        });
        navigate("/welcome");
      } else {
        toast({
          title: "Entry Denied",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Entry Denied",
        description: "The tribe couldn’t forge your path. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    setIsLoading(true);
    clg('google signup credentials --- ', credentialResponse);
    if (!agreeTerms) {
      toast({
        title: "Tribal Pact",
        description: "Accept the tribe’s code to join the ascent.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

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
        const registerResult = await register({
          name: result.user.name,
          email: result.user.email,
          password: '',
          role: result.user.role,
          user: result.user,
          token: result.token,
        });

        if (registerResult.success) {
          toast({
            title: "Tribe Welcomes You!",
            description: "You’ve joined African Intelligence. Onward to greatness!",
          });
          navigate("/welcome");
        } else {
          throw new Error('Failed to process Google signup');
        }
      } else {
        throw new Error(result.message || 'Google signup failed');
      }
    } catch (error) {
      console.error("Google Signup error:", error);
      toast({
        title: "Entry Denied",
        description: error.message || "Failed to signup with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        <div className="w-full relative z-10">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full filter blur-3xl animate-pulse delay-700" />

          <Card className="bg-slate-900/50 w-full border border-gold-300/20 backdrop-blur-xl shadow-2xl shadow-amber-500/20 rounded-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Link to="/">
                    <div className="rounded-full bg-amber-500 p-3 animate-bounce shadow-lg shadow-amber-500/50 cursor-pointer hover:bg-amber-600 transition-colors">
                      <Cpu className="h-8 w-8 text-white" />
                    </div>
                  </Link>
                </div>
                <h1 className="text-4xl font-bold text-amber-200 tracking-tight">Join African Intelligence</h1>
                <p className="text-amber-400 mt-2 text-sm">Forge your path in the tribe’s ascent</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-amber-100 font-medium">Tribal Name</Label>
                  <Input
                    id="name"
                    placeholder="Akin Zulu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-slate-800 border-gold-300/20 text-amber-100 placeholder-gold-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 shadow-inner hover:shadow-amber-500/30"
                  />
                </div>

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
                    className="bg-slate-800 border-gold-300/20 text-amber-100 placeholder-gold-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 shadow-inner hover:shadow-amber-500/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-amber-100 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="bg-slate-800 border-gold-300/20 text-amber-100 placeholder-gold-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 shadow-inner hover:shadow-amber-500/30 pr-10"
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
                  <Label htmlFor="confirmPassword" className="text-amber-100 font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-slate-800 border-gold-300/20 text-amber-100 placeholder-gold-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 shadow-inner hover:shadow-amber-500/30 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-amber-100 font-medium">I join as a</Label>
                  <Select value={role} onValueChange={setRole} disabled={isLoading}>
                    <SelectTrigger className="bg-slate-800 border-gold-300/20 text-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-inner hover:shadow-amber-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 border-gold-300/20 text-amber-100 backdrop-blur-md">
                      <SelectItem value="facilitator" className="hover:bg-amber-500/30">Griot (Facilitator)</SelectItem>
                      <SelectItem value="student" className="hover:bg-amber-500/30">Warrior (Student)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gold-300/30 rounded bg-slate-800"
                  />
                  <label htmlFor="terms" className="text-sm text-amber-400">
                    I pledge to the{" "}
                    <a href="/terms" className="text-amber-500 hover:text-amber-400 transition-colors">Tribal Code</a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-amber-500 hover:text-amber-400 transition-colors">Sacred Pact</a>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40 transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Forging Your Path...
                    </>
                  ) : (
                    "Join the Tribe"
                  )}
                </Button>

                <div className="w-full">
                  <div className="w-full h-12 rounded-lg overflow-hidden">
                    <GoogleLogin
                      onSuccess={handleGoogleSignup}
                      onError={() => {
                        toast({
                          title: "Google Signup Failed",
                          description: "Unable to authenticate with Google. Please try again.",
                          variant: "destructive",
                        });
                        setIsLoading(false);
                      }}
                      width="100%"
                      theme="filled_black"
                      text="signup_with"
                      disabled={isLoading}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </form>

              <p className="text-center mt-6 text-amber-400">
                Already in the tribe?{" "}
                <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                  Enter Now
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div
        className="w-full md:w-1/2 bg-cover bg-center relative hidden md:block"
        style={{
          backgroundImage: `url(${image_02})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent flex flex-col justify-center px-12">
          <div className="max-w-md ml-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-200 mb-4">African Intelligence LMS</h1>
            <p className="text-xl text-amber-400 mb-8">Join the tribe where Africa’s mind ignites the world—tech, tourism, and triumph.</p>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gold-300/20">
              <h3 className="text-xl font-semibold text-gold-300 mb-4">Why Join the Tribe?</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="text-amber-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-amber-400">Master AI with griot-led wisdom</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-amber-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-amber-400">Shape tourism’s future, African-style</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-amber-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-amber-400">Earn badges of tribal honor</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-amber-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-amber-400">Rise with Africa’s digital vanguard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
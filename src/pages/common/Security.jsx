
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Lock, Shield, AlertTriangle, Check, X, AlertCircle, Key, EyeOff, Eye } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Security = () => {
  const { toast } = useToast();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strengthCheck, setStrengthCheck] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    
    if (name === 'newPassword') {
      setStrengthCheck({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value)
      });
    }
  };
  
  const toggleShowPassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please ensure that your passwords match."
      });
      return;
    }
    
    // Check password strength
    const passwordStrength = Object.values(strengthCheck).filter(Boolean).length;
    if (passwordStrength < 4) {
      toast({
        variant: "destructive",
        title: "Weak password",
        description: "Please ensure your password meets the strength requirements."
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }, 1500);
  };
  
  const enableTwoFactor = () => {
    // This would show a 2FA setup process in a real app
    setTwoFactorEnabled(true);
    toast({
      title: "Two-factor authentication enabled",
      description: "Your account is now more secure."
    });
  };
  
  const getPasswordStrengthColor = () => {
    const strength = Object.values(strengthCheck).filter(Boolean).length;
    if (strength <= 2) return "bg-red-500";
    if (strength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Security Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => toggleShowPassword('current')}
                    >
                      {showPassword.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => toggleShowPassword('new')}
                    >
                      {showPassword.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {passwordForm.newPassword && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Password Strength</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrengthColor()}`}
                          style={{ 
                            width: `${(Object.values(strengthCheck).filter(Boolean).length / 5) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        {strengthCheck.length ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {strengthCheck.uppercase ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span>Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {strengthCheck.lowercase ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span>Lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {strengthCheck.number ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span>Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {strengthCheck.special ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => toggleShowPassword('confirm')}
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {passwordForm.newPassword && 
                   passwordForm.confirmPassword && 
                   passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4" />
                      Passwords don't match
                    </p>
                  )}
                </div>
                
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Key className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Successful login</p>
                      <p className="text-sm text-gray-500">Today at 10:23 AM • San Francisco, CA</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Key className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Successful login</p>
                      <p className="text-sm text-gray-500">Yesterday at 3:45 PM • San Francisco, CA</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 rounded-full p-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Password changed</p>
                      <p className="text-sm text-gray-500">June 15, 2023 at 2:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor">Enable 2FA</Label>
                <Switch
                  id="two-factor"
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      enableTwoFactor();
                    } else {
                      setTwoFactorEnabled(false);
                      toast({
                        title: "Two-factor authentication disabled",
                        description: "Your account is now less secure."
                      });
                    }
                  }}
                />
              </div>
              
              <Alert className={twoFactorEnabled ? "bg-green-50" : "bg-yellow-50"}>
                <AlertTitle className="flex items-center gap-2">
                  {twoFactorEnabled ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span>2FA is enabled</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>2FA is not enabled</span>
                    </>
                  )}
                </AlertTitle>
                <AlertDescription>
                  {twoFactorEnabled 
                    ? "Your account is protected with two-factor authentication."
                    : "We strongly recommend enabling two-factor authentication for additional security."}
                </AlertDescription>
              </Alert>
              
              {twoFactorEnabled && (
                <Button variant="outline" className="w-full" onClick={() => setTwoFactorEnabled(false)}>
                  Disable 2FA
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-gray-500">San Francisco, CA</p>
                  </div>
                  <div className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1 h-fit">
                    Active Now
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Chrome on MacOS</p>
                    <p className="text-sm text-gray-500">San Francisco, CA</p>
                  </div>
                  <div className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-1 h-fit">
                    5 days ago
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Log out all other sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Security;

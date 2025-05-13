import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Phone, Mail, Briefcase, Book, Loader2, CheckCircle, XCircle, Upload, PlusCircle, Trash2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { useToast } from "@/hooks/use-toast";
import { ocn } from '../../lib/basic';

// For demo purposes - replace with your Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2FybGR3b3JsZCIsImEiOiJjbTl5cjd5azUwZGtzMmpzaG56YXVwaWt6In0.9VykK-o_WVHRnHj-G67yDQ'; // Replace with your Mapbox token

const UserAccount = ({ userType }) => {
  const { user, setUser, API_URL, token } = useTourLMS();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    bio: user?.bio,
    occupation: user?.occupation,
    address: user?.address,
    specialization: user?.specialization,
    experience: user?.experience,
    profilePicture: user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=f59e0b&color=fff`,
    certifications: user?.certifications || [],
    education: user?.education || [],
  });

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState([-122.431297, 37.773972]); // San Francisco default
  const [markers, setMarkers] = useState([
    { id: 1, position: [-122.431297, 37.773972], title: "Your Location", type: "user" },
    { id: 2, position: [-122.421297, 37.783972], title: "Sarah Wilson - Plumbing Instructor", type: "facilitator" },
    { id: 3, position: [-122.441297, 37.763972], title: "David Chen - Electrical Instructor", type: "facilitator" },
    { id: 4, position: [-122.411297, 37.793972], title: "Jessica Brown - HVAC Instructor", type: "facilitator" },
    { id: 5, position: [-122.451297, 37.753972], title: "Robert Kim - Carpentry Instructor", type: "facilitator" },
  ]);

  // Handle live location tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    // Initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const newLocation = [longitude, latitude];
        setUserLocation(newLocation);
        setMarkers((prevMarkers) =>
          prevMarkers.map((m) =>
            m.type === 'user' ? { ...m, position: newLocation } : m
          )
        );
      },
      (error) => {
        toast({
          title: "Location Access Denied",
          description: "Please allow location access to use this feature.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true }
    );

    // Watch for location updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const newLocation = [longitude, latitude];
        setUserLocation(newLocation);
        setMarkers((prevMarkers) =>
          prevMarkers.map((m) =>
            m.type === 'user' ? { ...m, position: newLocation } : m
          )
        );
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  useEffect(()=>{
    if(!ocn(user))return;
    setFormData({
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      bio: user?.bio,
      occupation: user?.occupation,
      address: user?.address,
      specialization: user?.specialization,
      experience: user?.experience,
      profilePicture: user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=f59e0b&color=fff`,
      certifications: user?.certifications || [],
      education: user?.education || [],
    })
  },[user])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCertificationChange = (index, field, value) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications[index][field] = value;
    setFormData({ ...formData, certifications: updatedCertifications });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, { title: '', verified: false }],
    });
  };

  const removeCertification = (index) => {
    const updatedCertifications = formData.certifications.filter((_, i) => i !== index);
    setFormData({ ...formData, certifications: updatedCertifications });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData({ ...formData, education: updatedEducation });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', years: '' }],
    });
  };

  const removeEducation = (index) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: updatedEducation });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/auth/update-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Update context with new user data
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        occupation: formData.occupation,
        address: formData.address,
        specialization: formData.specialization,
        experience: formData.experience,
        profilePicture: formData.profilePicture,
        certifications: formData.certifications,
        education: formData.education,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
        className: "bg-green-600 text-white border-amber-500",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update your profile. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@example.com',
      phone: user?.phone || '+1 (555) 123-4567',
      bio: user?.bio || 'Experienced trade instructor with over 10 years in the electrical field. Passionate about teaching the next generation of skilled workers.',
      occupation: user?.occupation || (userType === 'facilitator' ? 'Senior Electrical Instructor' : 'Electrical Apprentice'),
      address: user?.address || '123 Main Street, Anytown, CA 94123',
      specialization: user?.specialization || 'Electrical Engineering',
      experience: user?.experience || '10 years',
      profilePicture: user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=f59e0b&color=fff`,
      certifications: user?.certifications || [
        { title: 'Master Electrician License', verified: true },
        { title: 'Safety Training Certification', verified: true },
      ],
      education: user?.education || [
        { degree: 'B.S. Electrical Engineering', institution: 'University of California', years: '2010-2014' },
        { degree: 'Technical Training Program', institution: 'Trade Institute', years: '2008-2010' },
      ],
    });
    setIsEditing(false);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File",
        description: "Please upload an image (JPEG, PNG, or GIF).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if(user.profilePicture)formData.append('xfileUrl',user.profilePicture)
      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      const imageUrl = uploadResult.fileUrl;

      const profilePictureResponse = await fetch(`${API_URL}/auth/profilepicture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ profilePicture: imageUrl }),
      });
      const profilePictureResult = await profilePictureResponse.json();

      if (!profilePictureResponse.ok) {
        throw new Error(profilePictureResult.error || 'Failed to update profile picture');
      }

      setFormData({ ...formData, profilePicture: imageUrl });
      setUser(prev => ({ ...prev, profilePicture: imageUrl }));
      localStorage.setItem('user', { ...user, profilePicture: imageUrl });
      toast({
        title: "Profile Picture Updated",
        description: "Your new profile picture has been set!",
        className: "bg-green-600 text-white border-amber-500",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload your profile picture. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v11',
        center: userLocation,
        zoom: 12
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        setMapLoaded(true);
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [userLocation]); // Add userLocation as a dependency to reinitialize map when location changes

  // Add markers when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const markerElements = document.querySelectorAll('.mapboxgl-marker');
    markerElements.forEach(el => el.remove());

    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '50px';
      el.style.height = '50px';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';
      
      if (marker.type === 'user') {
        el.style.backgroundImage = 'url("https://www.svgrepo.com/show/303108/user-icon.svg")';
        el.style.filter = 'hue-rotate(40deg) drop-shadow(0 0 8px rgba(255, 191, 0, 0.8))';
      } else {
        el.style.backgroundImage = 'url("https://www.svgrepo.com/show/303107/teacher-icon.svg")';
        el.style.filter = 'hue-rotate(200deg) drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))';
      }
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<div class="p-3 bg-gradient-to-br from-gray-800 to-gray-900 text-amber-300 border border-amber-400 rounded-lg shadow-lg"><strong>${marker.title}</strong></div>`);
      
      new mapboxgl.Marker(el)
        .setLngLat(marker.position)
        .setPopup(popup)
        .addTo(map.current);
    });

    // Recenter map on user location
    map.current.setCenter(userLocation);

    map.current.on('click', (e) => {
      if (userType === 'student') {
        const newLocation = [e.lngLat.lng, e.lngLat.lat];
        setUserLocation(newLocation);
        setMarkers(markers.map(m => 
          m.type === 'user' 
            ? { ...m, position: newLocation }
            : m
        ));
        toast({
          title: "Location Updated",
          description: "Your location has been updated!",
          variant: "default",
        });
      }
    });
  }, [mapLoaded, markers, userType, userLocation]); // Add userLocation to dependencies to re-render markers when location changes

  const handleEditClick = () => {
    console.log("Edit button clicked");
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-amber-100/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-amber-900/30 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20 dark:opacity-20"></div>
          <h1 className="text-5xl font-extrabold text-amber-300 tracking-wide animate-fade-in">
            Your Account Dashboard
          </h1>
          <p className="text-amber-400 mt-3 text-lg animate-fade-in-delayed">
            Manage your profile and settings
          </p>
        </div>

        {/* Profile Picture and Core Info */}
        <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-amber-400/50 rounded-3xl p-8 shadow-2xl shadow-amber-400/30 animate-slide-up">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10 rounded-3xl"></div>
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <Avatar className="h-40 w-40 border-4 border-amber-400/70 shadow-xl shadow-amber-400/40 transition-transform group-hover:scale-105">
                <AvatarImage src={formData.profilePicture} />
                <AvatarFallback className="bg-amber-400 text-gray-900 text-2xl">{user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute bottom-2 right-2 bg-amber-400 text-gray-900 p-3 rounded-full cursor-pointer shadow-lg hover:bg-amber-300 transition-all z-10">
                  <Upload className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                  <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
                </div>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-amber-300">{formData.name}</h2>
              <p className="text-amber-400">{formData.occupation}</p>
            </div>

            <div className="flex space-x-4 z-10">
              {!isEditing ? (
                <Button
                  onClick={handleEditClick}
                  className="bg-amber-400 text-gray-900 font-semibold hover:bg-amber-300 transition-all duration-300 relative z-10"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCancel}
                    className="bg-red-600/80 text-white hover:bg-red-500 transition-all duration-300 relative z-10"
                    disabled={isSaving}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600/80 text-white hover:bg-green-500 transition-all duration-300 relative z-10"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/60 border border-amber-400/40 rounded-2xl p-6 shadow-lg shadow-amber-400/20 animate-slide-up-delayed">
            <h3 className="text-xl font-semibold text-amber-300 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-amber-200">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 bg-gray-700/50 border-amber-400/50 text-amber-200 focus:ring-amber-400 transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-amber-200">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 bg-gray-700/50 border-amber-400/50 text-amber-200 focus:ring-amber-400 transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-amber-200">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 bg-gray-700/50 border-amber-400/50 text-amber-200 focus:ring-amber-400 transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-amber-200">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 bg-gray-700/50 border-amber-400/50 text-amber-200 focus:ring-amber-400 min-h-[120px] transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 border border-amber-400/40 rounded-2xl p-6 shadow-lg shadow-amber-400/20 animate-slide-up-delayed">
            <h3 className="text-xl font-semibold text-amber-300 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Professional Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="occupation" className="text-amber-200">
                  {userType === 'facilitator' ? 'Job Title' : 'Occupation'}
                </Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 bg-gray-700/50 border-amber-400/50 text-amber-200 focus:ring-amber-400 transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-amber-200">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 bg-gray-700/50 border-amber-400/50 text-amber-200 focus:ring-amber-400 transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="specialization" className="text-amber-200">Specialization</Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1 bg-gray-700/50 border-amber-400/50 text-amber-200 focus:ring-amber-400 transition-all duration-300">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-amber-400/50 text-amber-200">
                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Carpentry">Carpentry</SelectItem>
                    <SelectItem value="Welding">Welding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {userType === 'facilitator' && (
                <div>
                  <Label htmlFor="experience" className="text-amber-200">Years of Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 bg-gray-700/50 border-amber-400/50 text-amber-200 focus:ring-amber-400 transition-all duration-300"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Facilitator Credentials */}
        {userType === 'facilitator' && (
          <div className="bg-gray-800/60 border border-amber-400/40 rounded-2xl p-6 shadow-lg shadow-amber-400/20 animate-slide-up-delayed">
            <h3 className="text-xl font-semibold text-amber-300 mb-4 flex items-center">
              <Book className="h-5 w-5 mr-2" />
              Professional Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-amber-200 font-medium">Certifications</h4>
                <div className="bg-gray-700/50 border border-amber-400/50 rounded-lg p-4 space-y-3">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between">
                      {isEditing ? (
                        <div className="flex items-center space-x-2 w-full">
                          <Input
                            value={cert.title}
                            onChange={(e) => handleCertificationChange(index, 'title', e.target.value)}
                            placeholder="Certification title"
                            className="bg-gray-600/50 border-amber-400/50 text-amber-200 focus:ring-amber-400"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertification(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-amber-300">{cert.title}</span>
                          <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {cert.verified ? 'Verified' : 'Not Verified'}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCertification}
                      className="mt-2 text-amber-300 border-amber-400/50 hover:bg-amber-400/20"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Certification
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-amber-200 font-medium">Education</h4>
                <div className="bg-gray-700/50 border border-amber-400/50 rounded-lg p-4 space-y-3">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="space-y-2">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            placeholder="Degree"
                            className="bg-gray-600/50 border-amber-400/50 text-amber-200 focus:ring-amber-400"
                          />
                          <Input
                            value={edu.institution}
                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                            placeholder="Institution"
                            className="bg-gray-600/50 border-amber-400/50 text-amber-200 focus:ring-amber-400"
                          />
                          <Input
                            value={edu.years}
                            onChange={(e) => handleEducationChange(index, 'years', e.target.value)}
                            placeholder="Years (e.g., 2010-2014)"
                            className="bg-gray-600/50 border-amber-400/50 text-amber-200 focus:ring-amber-400"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-amber-300">{edu.degree}</div>
                          <div className="text-sm text-amber-400">{edu.institution}, {edu.years}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addEducation}
                      className="mt-2 text-amber-300 border-amber-400/50 hover:bg-amber-400/20"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Section */}
        {/* <div className="bg-gray-800/60 border border-amber-400/40 rounded-2xl p-6 shadow-lg shadow-amber-400/20 animate-slide-up-delayed">
          <h3 className="text-xl font-semibold text-amber-300 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location
          </h3>
          {userType === 'student' && (
            <p className="text-amber-400 text-sm mb-4">
              Click on the map to update your location.
            </p>
          )}
          <div ref={mapContainer} className="w-full h-[400px] rounded-lg border border-amber-400/50 shadow-inner" />
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-400 shadow shadow-amber-400/50"></div>
              <span className="text-sm text-amber-300">Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow shadow-blue-500/50"></div>
              <span className="text-sm text-amber-300">Facilitators Nearby</span>
            </div>
          </div>
        </div> */}

        {/* Preferences Section */}
        <div className="bg-gray-800/60 border border-amber-400/40 rounded-2xl p-6 shadow-lg shadow-amber-400/20 animate-slide-up-delayed">
          <h3 className="text-xl font-semibold text-amber-300 mb-4 flex items-center">
            <Book className="h-5 w-5 mr-2" />
            Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-amber-200 font-medium">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="text-amber-300">Email Notifications</Label>
                  <input
                    type="checkbox"
                    id="email-notifications"
                    defaultChecked
                    className="h-5 w-5 text-amber-400 focus:ring-amber-400 border-amber-400/50 rounded bg-gray-700/50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="course-updates" className="text-amber-300">Course Updates</Label>
                  <input
                    type="checkbox"
                    id="course-updates"
                    defaultChecked
                    className="h-5 w-5 text-amber-400 focus:ring-amber-400 border-amber-400/50 rounded bg-gray-700/50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="forum-notifications" className="text-amber-300">Forum Activity</Label>
                  <input
                    type="checkbox"
                    id="forum-notifications"
                    defaultChecked
                    className="h-5 w-5 text-amber-400 focus:ring-amber-400 border-amber-400/50 rounded bg-gray-700/50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="assessment-reminders" className="text-amber-300">Assessment Reminders</Label>
                  <input
                    type="checkbox"
                    id="assessment-reminders"
                    defaultChecked
                    className="h-5 w-5 text-amber-400 focus:ring-amber-400 border-amber-400/50 rounded bg-gray-700/50"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-amber-200 font-medium">Privacy</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="profile-visibility" className="text-amber-300">Profile Visibility</Label>
                  <Select defaultValue="public">
                    <SelectTrigger className="w-[180px] bg-gray-700/50 border-amber-400/50 text-amber-300 focus:ring-amber-400 transition-all duration-300">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-amber-400/50 text-amber-300">
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="facilitators">Facilitators Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-activity" className="text-amber-300">Show Activity Status</Label>
                  <input
                    type="checkbox"
                    id="show-activity"
                    defaultChecked
                    className="h-5 w-5 text-amber-400 focus:ring-amber-400 border-amber-400/50 rounded bg-gray-700/50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="location-sharing" className="text-amber-300">Location Sharing</Label>
                  <input
                    type="checkbox"
                    id="location-sharing"
                    defaultChecked
                    className="h-5 w-5 text-amber-400 focus:ring-amber-400 border-amber-400/50 rounded bg-gray-700/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Target, PlusCircle, X, CheckCircle2, Loader2, Upload, Trash2 } from 'lucide-react';
import CourseModuleEditor from '@/components/course/CourseModuleEditor';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { getCourseById, updateCourse } from '@/api/courseService';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { clg, ocn } from '../../lib/basic';
import { useDropzone } from 'react-dropzone';

const EditCourse = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token, facilitatorCourses, setFacilitatorCourses, Categories, API_URL } = useTourLMS();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [prerequisites, setPrerequisites] = useState(['']);
  const [learningOutcomes, setLearningOutcomes] = useState(['']);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailError, setThumbnailError] = useState("");
  const [thumbnailMode, setThumbnailMode] = useState("upload");
  const [courseData, setCourseData] = useState({
    title: '',
    category: '',
    shortDescription: '',
    fullDescription: '',
    level: '',
    duration: '',
    prerequisites: [],
    learningOutcomes: [],
    thumbnail: '',
    modules: []
  });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!ocn(facilitatorCourses)) return;
      let courseDetails = facilitatorCourses.find(crs => (crs.key == id));

      if (!courseDetails) {
        try {
          courseDetails = await getCourseById(id, token);
        } catch (error) {
          console.error('Error fetching course:', error);
          toast({
            title: "Error loading course",
            description: "Failed to load course details for editing",
            variant: "destructive"
          });
          navigate('/facilitator/courses');
        }
      }

      if (courseDetails) {
        setIsLoading(false);
        setCourseData({
          title: courseDetails.title || '',
          category: courseDetails.category || '',
          shortDescription: courseDetails.shortDescription || '',
          fullDescription: courseDetails.fullDescription || '',
          level: courseDetails.level || '',
          duration: courseDetails.duration || '',
          prerequisites: courseDetails.prerequisites || [],
          learningOutcomes: courseDetails.learningOutcomes || [],
          thumbnail: courseDetails.thumbnail || '',
          modules: courseDetails.modules || []
        });

        setThumbnailUrl(courseDetails.thumbnail || '');
        setThumbnailMode(courseDetails.thumbnail ? "url" : "upload");

        setPrerequisites(
          courseDetails.prerequisites?.length
            ? courseDetails.prerequisites
            : ['']
        );

        setLearningOutcomes(
          courseDetails.learningOutcomes?.length
            ? courseDetails.learningOutcomes
            : ['']
        );
      }
    };

    fetchCourseDetails();
  }, [facilitatorCourses, navigate, id, token]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      toast({
        title: "Too many files",
        description: "Please upload only one file for the thumbnail.",
        variant: "destructive",
      });
      return;
    }

    const file = acceptedFiles[0];
    setThumbnailFile(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", "image");
    if (courseData.thumbnail) {
      formData.append("xfileUrl", courseData.thumbnail);
    }

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      setThumbnailUrl(result.fileUrl);
      setCourseData((prev) => ({
        ...prev,
        thumbnail: result.fileUrl,
      }));
      setThumbnailError("");
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast({
        title: "Error uploading thumbnail",
        description: "Failed to upload the thumbnail image. Please try again.",
        variant: "destructive",
      });
      setThumbnailFile(null);
      setThumbnailUrl("");
    } finally {
      setIsUploading(false);
    }
  }, [API_URL, courseData.thumbnail, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailUrl("");
    setCourseData((prev) => ({
      ...prev,
      thumbnail: "",
    }));
  };

  const handleChange = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPrerequisite = (e) => {
    e?.preventDefault();
    setPrerequisites([...prerequisites, '']);
  };

  const updatePrerequisite = (index, value) => {
    const newPrerequisites = [...prerequisites];
    newPrerequisites[index] = value;
    setPrerequisites(newPrerequisites);
    handleChange('prerequisites', newPrerequisites.filter(p => p.trim() !== ''));
  };

  const removePrerequisite = (e, index) => {
    e?.preventDefault();
    const newPrerequisites = prerequisites.filter((_, i) => i !== index);
    setPrerequisites(newPrerequisites.length ? newPrerequisites : ['']);
    handleChange('prerequisites', newPrerequisites.filter(p => p.trim() !== ''));
  };

  const addLearningOutcome = (e) => {
    e?.preventDefault();
    setLearningOutcomes([...learningOutcomes, '']);
  };

  const updateLearningOutcome = (index, value) => {
    const newLearningOutcomes = [...learningOutcomes];
    newLearningOutcomes[index] = value;
    setLearningOutcomes(newLearningOutcomes);
    handleChange('learningOutcomes', newLearningOutcomes.filter(lo => lo.trim() !== ''));
  };

  const removeLearningOutcome = (e, index) => {
    e?.preventDefault();
    const newLearningOutcomes = learningOutcomes.filter((_, i) => i !== index);
    setLearningOutcomes(newLearningOutcomes.length ? newLearningOutcomes : ['']);
    handleChange('learningOutcomes', newLearningOutcomes.filter(lo => lo.trim() !== ''));
  };

  const validateForm = () => {
    const requiredFields = ['title', 'category', 'shortDescription', 'level', 'thumbnail'];
    const missingFields = requiredFields.filter(field => !courseData[field]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in the following fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    if (courseData.modules.length === 0) {
      toast({
        title: "No modules added",
        description: "Please add at least one module to your course",
        variant: "destructive"
      });
      return false;
    }

    const modulesWithoutQuiz = courseData.modules
      .map((module, index) => (!module.quiz ? index + 1 : null))
      .filter((index) => index !== null);

    if (modulesWithoutQuiz.length > 0) {
      toast({
        title: "Missing quizzes",
        description: `Please add a quiz to the following modules: ${modulesWithoutQuiz.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    let contentValidationFailed = false;
    courseData.modules.forEach((module, moduleIndex) => {
      if (module.content && module.content.length > 0) {
        module.content.forEach((content, contentIndex) => {
          if (!content.title || content.title.trim() === "") {
            toast({
              title: "Missing content title",
              description: `Content ${contentIndex + 1} in Module ${moduleIndex + 1} is missing a title`,
              variant: "destructive",
            });
            contentValidationFailed = true;
          }
          if (!content.description || content.description.trim() === "") {
            toast({
              title: "Missing content description",
              description: `Content ${contentIndex + 1} in Module ${moduleIndex + 1} is missing a description`,
              variant: "destructive",
            });
            contentValidationFailed = true;
          }
          if (!content.url || content.url.trim() === "") {
            toast({
              title: "Missing content URL",
              description: `Content ${contentIndex + 1} in Module ${moduleIndex + 1} is missing a URL (upload a file or enter a URL)`,
              variant: "destructive",
            });
            contentValidationFailed = true;
          }
        });
      }
    });

    if (contentValidationFailed) {
      return false;
    }

    let quizValidationFailed = false;
    courseData.modules.forEach((module, moduleIndex) => {
      const quiz = module.quiz;

      if (!quiz.title || quiz.title.trim() === "") {
        toast({
          title: "Missing quiz title",
          description: `Quiz in Module ${moduleIndex + 1} is missing a title`,
          variant: "destructive",
        });
        quizValidationFailed = true;
      }

      if (!quiz.questions || quiz.questions.length === 0) {
        toast({
          title: "Missing quiz questions",
          description: `Quiz in Module ${moduleIndex + 1} has no questions`,
          variant: "destructive",
        });
        quizValidationFailed = true;
      } else {
        quiz.questions.forEach((question, questionIndex) => {
          if (!question.text || question.text.trim() === "") {
            toast({
              title: "Missing question text",
              description: `Question ${questionIndex + 1} in Module ${moduleIndex + 1} quiz is missing question text`,
              variant: "destructive",
            });
            quizValidationFailed = true;
          }

          if (question.type === "multiple-choice") {
            if (!question.options || question.options.length < 2) {
              toast({
                title: "Insufficient options",
                description: `Question ${questionIndex + 1} in Module ${moduleIndex + 1} quiz must have at least 2 options`,
                variant: "destructive",
              });
              quizValidationFailed = true;
            } else {
              question.options.forEach((option, optionIndex) => {
                if (!option.text || option.text.trim() === "") {
                  toast({
                    title: "Missing option text",
                    description: `Option ${optionIndex + 1} in Question ${questionIndex + 1} of Module ${moduleIndex + 1} quiz is missing text`,
                    variant: "destructive",
                  });
                  quizValidationFailed = true;
                }
              });

              const correctOptions = question.options.filter((option) => option.isCorrect);
              if (correctOptions.length !== 1) {
                toast({
                  title: "Invalid correct answer",
                  description: `Question ${questionIndex + 1} in Module ${moduleIndex + 1} quiz must have exactly one correct answer selected`,
                  variant: "destructive",
                });
                quizValidationFailed = true;
              }
            }
          } else if (question.type === "true-false") {
            if (question.answer !== "true" && question.answer !== "false") {
              toast({
                title: "Missing true/false answer",
                description: `Question ${questionIndex + 1} in Module ${moduleIndex + 1} quiz must have a True or False answer selected`,
                variant: "destructive",
              });
              quizValidationFailed = true;
            }
          } else if (question.type === "short-answer") {
            if (!question.answer || question.answer.trim() === "") {
              toast({
                title: "Missing sample answer",
                description: `Question ${questionIndex + 1} in Module ${moduleIndex + 1} quiz must have a sample answer`,
                variant: "destructive",
              });
              quizValidationFailed = true;
            }
          }
        });
      }
    });

    if (quizValidationFailed) {
      return false;
    }

    let prereqValidationFailed = false;
    const finalPrerequisites = prerequisites.filter(p => p.trim() !== '');
    if (finalPrerequisites.length === 0) {
      toast({
        title: "Missing prerequisites",
        description: "Please add at least one prerequisite",
        variant: "destructive",
      });
      prereqValidationFailed = true;
    }

    if (prereqValidationFailed) {
      return false;
    }

    let learningOutcomeValidationFailed = false;
    const finalLearningOutcomes = learningOutcomes.filter(lo => lo.trim() !== '');
    if (finalLearningOutcomes.length === 0) {
      toast({
        title: "Missing learning outcomes",
        description: "Please add at least one learning outcome",
        variant: "destructive",
      });
      learningOutcomeValidationFailed = true;
    }

    if (learningOutcomeValidationFailed) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) {
      toast({
        title: "Upload in progress",
        description: "Please wait for the file to finish uploading before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const finalPrerequisites = prerequisites.filter(p => p.trim() !== '');
      const finalLearningOutcomes = learningOutcomes.filter(lo => lo.trim() !== '');

      const updatePayload = {
        ...courseData,
        prerequisites: finalPrerequisites,
        learningOutcomes: finalLearningOutcomes,
        status: 'published'
      };
      clg(updatePayload);
      let data = await updateCourse(id, updatePayload, token);
      clg(data);
      if (data.key) {
        await setFacilitatorCourses(prev => {
          return prev.map(course => course.key === data.key ? data : course);
        });
      }

      toast({
        title: "Course updated successfully!",
        description: `Your course "${courseData.title}" has been updated`,
        variant: "default"
      });

      navigate(-1);
    } catch (error) {
      console.error('Error updating course:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update course';

      toast({
        title: "Error updating course",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async (e) => {
    e.preventDefault();
    if (isUploading) {
      toast({
        title: "Upload in progress",
        description: "Please wait for the file to finish uploading before saving as draft.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const finalPrerequisites = prerequisites.filter(p => p.trim() !== '');
      const finalLearningOutcomes = learningOutcomes.filter(lo => lo.trim() !== '');

      const updatePayload = {
        ...courseData,
        prerequisites: finalPrerequisites,
        learningOutcomes: finalLearningOutcomes,
        status: 'draft'
      };

      let data = await updateCourse(id, updatePayload, token);
      if (data.key) {
        await setFacilitatorCourses(prev => {
          return prev.map(course => course.key === data.key ? data : course);
        });
      }

      toast({
        title: "Course saved as draft",
        description: `Your changes to "${courseData.title}" have been saved as draft`,
        variant: "default"
      });

      navigate(-1);
    } catch (error) {
      console.error('Error saving course draft:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save course draft';

      toast({
        title: "Error saving draft",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-red-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold-200 !important" style={{ color: '#faf089' }} />
          <p className="text-gold-200 !important" style={{ color: '#faf089' }}>Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-red-900 text-gold-300 !important py-8 px-4 sm:px-6 lg:px-8" style={{ color: '#f6e05e' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-200 to-yellow-300">
              Edit Course
            </span>
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gold-400 !important" style={{ color: '#ecc94b' }}>
            Refine your course to inspire and educate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          <Card className="p-4 sm:p-6 md:p-8 backdrop-blur-lg bg-gray-800/50 border border-red-800 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-gold-300/20">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-gold-300 !important" style={{ color: '#f6e05e' }} />
              <h2 className="text-xl sm:text-2xl font-semibold text-gold-300 !important" style={{ color: '#f6e05e' }}>Basic Information</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gold-400 !important font-medium text-sm sm:text-base" style={{ color: '#ecc94b' }}>Course Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter course title"
                  value={courseData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300 transition-all duration-200 text-sm sm:text-base"
                  style={{ color: '#f6e05e' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gold-400 !important font-medium text-sm sm:text-base" style={{ color: '#ecc94b' }}>Category *</Label>
                <Select onValueChange={(value) => handleChange('category', value)} value={courseData.category}>
                  <SelectTrigger className="bg-gray-700/50 border-red-800 text-gold-300 !important focus:ring-gold-300 focus:border-gold-300 text-sm sm:text-base" style={{ color: '#f6e05e' }}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-red-800 text-gold-300 !important" style={{ color: '#f6e05e' }}>
                    {Categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="hover:bg-gray-700 text-sm sm:text-base" style={{ color: '#f6e05e' }}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="shortDescription" className="text-gold-400 !important font-medium text-sm sm:text-base" style={{ color: '#ecc94b' }}>Short Description *</Label>
                <Input
                  id="shortDescription"
                  placeholder="Brief overview of the course"
                  value={courseData.shortDescription}
                  onChange={(e) => handleChange('shortDescription', e.target.value)}
                  className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300 transition-all duration-200 text-sm sm:text-base"
                  style={{ color: '#f6e05e' }}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullDescription" className="text-gold-400 !important font-medium text-sm sm:text-base" style={{ color: '#ecc94b' }}>Full Description</Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Detailed description of the course"
                  className="h-24 sm:h-32 bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300 transition-all duration-200 text-sm sm:text-base"
                  value={courseData.fullDescription}
                  onChange={(e) => handleChange('fullDescription', e.target.value)}
                  style={{ color: '#f6e05e' }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 md:p-8 backdrop-blur-lg bg-gray-800/50 border border-red-800 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-gold-300/20">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-gold-300 !important" style={{ color: '#f6e05e' }} />
              <h2 className="text-xl sm:text-2xl font-semibold text-gold-300 !important" style={{ color: '#f6e05e' }}>Course Details</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level" className="text-gold-400 !important font-medium text-sm sm:text-base" style={{ color: '#ecc94b' }}>Difficulty Level *</Label>
                <Select onValueChange={(value) => handleChange('level', value)} value={courseData.level}>
                  <SelectTrigger className="bg-gray-700/50 border-red-800 text-gold-300 !important focus:ring-gold-300 focus:border-gold-300 text-sm sm:text-base" style={{ color: '#f6e05e' }}>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-red-800 text-gold-300 !important" style={{ color: '#f6e05e' }}>
                    <SelectItem value="beginner" className="hover:bg-gray-700 text-sm sm:text-base" style={{ color: '#f6e05e' }}>Beginner</SelectItem>
                    <SelectItem value="intermediate" className="hover:bg-gray-700 text-sm sm:text-base" style={{ color: '#f6e05e' }}>Intermediate</SelectItem>
                    <SelectItem value="advanced" className="hover:bg-gray-700 text-sm sm:text-base" style={{ color: '#f6e05e' }}>Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gold-400 !important font-medium text-sm sm:text-base" style={{ color: '#ecc94b' }}>Duration (weeks)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Estimated completion time in weeks"
                  value={courseData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300 transition-all duration-200 text-sm sm:text-base"
                  style={{ color: '#f6e05e' }}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-gold-400 !important font-medium text-sm sm:text-base" style={{ color: '#ecc94b' }}>Thumbnail Image * (Upload or Enter URL)</Label>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
                  <Button
                    type="button"
                    variant={thumbnailMode === "upload" ? "default" : "outline"}
                    onClick={() => setThumbnailMode("upload")}
                    className={thumbnailMode === "upload" ? "w-full sm:w-auto bg-gradient-to-r from-red-700 to-gold-200 hover:from-red-600 hover:to-gold-100" : "w-full sm:w-auto border-red-800 text-gold-400 hover:bg-gray-700"}
                    style={{ color: thumbnailMode === "upload" ? '#ffffff' : '#ecc94b' }}
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={thumbnailMode === "url" ? "default" : "outline"}
                    onClick={() => setThumbnailMode("url")}
                    className={thumbnailMode === "url" ? "w-full sm:w-auto bg-gradient-to-r from-red-700 to-gold-200 hover:from-red-600 hover:to-gold-100" : "w-full sm:w-auto border-red-800 text-gold-400 hover:bg-gray-700"}
                    style={{ color: thumbnailMode === "url" ? '#ffffff' : '#ecc94b' }}
                  >
                    Enter URL
                  </Button>
                </div>

                {thumbnailMode === "upload" ? (
                  <div className="w-full">
                    {thumbnailFile ? (
                      <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg">
                        <img
                          src={URL.createObjectURL(thumbnailFile)}
                          alt="Thumbnail Preview"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p className="text-gold-300 !important text-sm sm:text-base" style={{ color: '#f6e05e' }}>{thumbnailFile.name}</p>
                          <p className="text-xs sm:text-sm text-gold-400 !important" style={{ color: '#ecc94b' }}>{(thumbnailFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeThumbnail}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    ) : thumbnailUrl ? (
                      <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg">
                        <img
                          src={thumbnailUrl}
                          alt="Thumbnail Preview"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p className="text-gold-300 !important text-sm sm:text-base" style={{ color: '#f6e05e' }}>Current Thumbnail</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeThumbnail}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${
                          isDragActive ? "border-gold-300 bg-gold-300/10" : "border-red-800"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gold-400 !important mb-2" style={{ color: '#ecc94b' }} />
                        <p className="text-gold-300 !important text-sm sm:text-base" style={{ color: '#f6e05e' }}>
                          Drag & drop a thumbnail image here, or click to select a file
                        </p>
                        <p className="text-xs sm:text-sm text-gold-400 !important mt-1" style={{ color: '#ecc94b' }}>
                          (Only image files are accepted, max 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 w-full">
                    <Input
                      placeholder="Enter image URL"
                      value={courseData.thumbnail}
                      onChange={(e) => {
                        setCourseData((prev) => ({
                          ...prev,
                          thumbnail: e.target.value,
                        }));
                        setThumbnailUrl(e.target.value);
                      }}
                      className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300 transition-all duration-200 text-sm sm:text-base"
                      style={{ color: '#f6e05e' }}
                    />
                    {thumbnailUrl && (
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail Preview"
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md mt-2"
                        onError={() => setThumbnailError("Invalid URL or image not accessible")}
                      />
                    )}
                    {thumbnailError && (
                      <p className="text-red-600 text-xs sm:text-sm">{thumbnailError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-gold-400 !important font-medium text-sm sm:text-base" style={{ color: '#ecc94b' }}>Prerequisites *</Label>
                <div className="space-y-3">
                  {prerequisites.map((prerequisite, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        placeholder={`Prerequisite ${index + 1}`}
                        value={prerequisite}
                        onChange={(e) => updatePrerequisite(index, e.target.value)}
                        className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300 transition-all duration-200 text-sm sm:text-base"
                        style={{ color: '#f6e05e' }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => removePrerequisite(e, index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto border-red-800 text-gold-400 hover:bg-gray-700"
                    style={{ color: '#ecc94b' }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Prerequisite
                  </Button>
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-gold-400 !important font-medium text-sm sm:text-base" style={{ color: '#ecc94b' }}>Learning Outcomes *</Label>
                <div className="space-y-3">
                  {learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        placeholder={`Learning Outcome ${index + 1}`}
                        value={outcome}
                        onChange={(e) => updateLearningOutcome(index, e.target.value)}
                        className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300 transition-all duration-200 text-sm sm:text-base"
                        style={{ color: '#f6e05e' }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => removeLearningOutcome(e, index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto border-red-800 text-gold-400 hover:bg-gray-700"
                    style={{ color: '#ecc94b' }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Learning Outcome
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <CourseModuleEditor
            modules={courseData.modules}
            onChange={(modules) => handleChange('modules', modules)}
            setIsUploading={setIsUploading}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 sm:mt-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/facilitator/courses/${id}`)}
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto border-red-800 text-gold-400 hover:bg-gray-700"
              style={{ color: '#ecc94b' }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={saveDraft}
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto border-red-800 text-gold-400 hover:bg-gray-700"
              style={{ color: '#ecc94b' }}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto bg-gradient-to-r from-red-700 to-gold-200 hover:from-red-600 hover:to-gold-100 text-white font-semibold transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Update Course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
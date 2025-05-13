import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Target,
  GraduationCap,
  X,
  PlusCircle,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Trash2,
} from "lucide-react";
import CourseModuleEditor from "@/components/course/CourseModuleEditor";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTourLMS } from "@/contexts/TourLMSContext";
import { createCourse } from "@/api/courseService";
import { cleaname, clg, ocn } from "../../lib/basic";
import { useDropzone } from 'react-dropzone';

const CreateCourse = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token, setFacilitatorCourses, Categories, API_URL } = useTourLMS();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [prerequisites, setPrerequisites] = useState([""]);
  const [learningOutcomes, setLearningOutcomes] = useState([""]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailError, setThumbnailError] = useState("");
  const [thumbnailMode, setThumbnailMode] = useState("upload");
  const [courseData, setCourseData] = useState({
    title: "",
    category: "",
    shortDescription: "",
    fullDescription: "",
    level: "",
    duration: "",
    prerequisites: [],
    learningOutcomes: [],
    thumbnail: "",
    modules: [],
  });

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
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addPrerequisite = (e) => {
    if (e) e.preventDefault();
    setPrerequisites([...prerequisites, ""]);
  };

  const updatePrerequisite = (index, value) => {
    const newPrerequisites = [...prerequisites];
    newPrerequisites[index] = value;
    setPrerequisites(newPrerequisites);
    handleChange(
      "prerequisites",
      newPrerequisites.filter((p) => p.trim() !== "")
    );
  };

  const removePrerequisite = (e, index) => {
    if (e) e.preventDefault();
    const newPrerequisites = prerequisites.filter((_, i) => i !== index);
    setPrerequisites(newPrerequisites.length ? newPrerequisites : [""]);
    handleChange(
      "prerequisites",
      newPrerequisites.filter((p) => p.trim() !== "")
    );
  };

  const addLearningOutcome = (e) => {
    if (e) e.preventDefault();
    setLearningOutcomes([...learningOutcomes, ""]);
  };

  const updateLearningOutcome = (index, value) => {
    const newLearningOutcomes = [...learningOutcomes];
    newLearningOutcomes[index] = value;
    setLearningOutcomes(newLearningOutcomes);
    handleChange(
      "learningOutcomes",
      newLearningOutcomes.filter((lo) => lo.trim() !== "")
    );
  };

  const removeLearningOutcome = (e, index) => {
    if (e) e.preventDefault();
    const newLearningOutcomes = learningOutcomes.filter((_, i) => i !== index);
    setLearningOutcomes(newLearningOutcomes.length ? newLearningOutcomes : [""]);
    handleChange(
      "learningOutcomes",
      newLearningOutcomes.filter((lo) => lo.trim() !== "")
    );
  };

  const validateForm = () => {
    // Check top-level required fields
    const requiredFields = ["title", "category", "shortDescription", "level", "thumbnail"];
    const missingFields = requiredFields.filter((field) => !courseData[field]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in the following fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    // Check if there are any modules
    if(!ocn(courseData.prerequisites.filter(p => p.trim() !== ''))){
      toast({
        title:"Empty Prerequisite",
        description:"Please enter at least one prerequisite",
        variant:"destructive"
      });
      return false;
    }
    if(!ocn(courseData.learningOutcomes.filter(p => p.trim() !== ''))){
      toast({
        title:"Empty Learning Outcome",
        description:"Please enter at least one learning outcome.",
        variant:"destructive"
      });
      return false;
    }
    if (courseData.modules.length === 0) {
      toast({
        title: "No modules added",
        description: "Please add at least one module to your course",
        variant: "destructive",
      });
      return false;
    }

    // Check that all modules have a quiz
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

    // Check that all content items have non-empty title, description, and URL
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

    // Validate quizzes
    let quizValidationFailed = false;
    courseData.modules.forEach((module, moduleIndex) => {
      const quiz = module.quiz;

      // Check if quiz has a title
      if (!quiz.title || quiz.title.trim() === "") {
        toast({
          title: "Missing quiz title",
          description: `Quiz in Module ${moduleIndex + 1} is missing a title`,
          variant: "destructive",
        });
        quizValidationFailed = true;
      }

      // Check if quiz has at least one question
      if (!quiz.questions || quiz.questions.length === 0) {
        toast({
          title: "Missing quiz questions",
          description: `Quiz in Module ${moduleIndex + 1} has no questions`,
          variant: "destructive",
        });
        quizValidationFailed = true;
      } else {
        // Validate each question
        quiz.questions.forEach((question, questionIndex) => {
          // Check question text
          if (!question.text || question.text.trim() === "") {
            toast({
              title: "Missing question text",
              description: `Question ${questionIndex + 1} in Module ${moduleIndex + 1} quiz is missing question text`,
              variant: "destructive",
            });
            quizValidationFailed = true;
          }

          if (question.type === "multiple-choice") {
            // Check if there are at least 2 options
            if (!question.options || question.options.length < 2) {
              toast({
                title: "Insufficient options",
                description: `Question ${questionIndex + 1} in Module ${moduleIndex + 1} quiz must have at least 2 options`,
                variant: "destructive",
              });
              quizValidationFailed = true;
            } else {
              // Check each option for text
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

              // Check if exactly one option is marked as correct
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
            // Check if answer is either "true" or "false"
            if (question.answer !== "true" && question.answer !== "false") {
              toast({
                title: "Missing true/false answer",
                description: `Question ${questionIndex + 1} in Module ${moduleIndex + 1} quiz must have a True or False answer selected`,
                variant: "destructive",
              });
              quizValidationFailed = true;
            }
          } else if (question.type === "short-answer") {
            // Check if sample answer is provided
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

    return true;
  };

  const createCourseHandler = async (status) => {
    try {
      setIsSubmitting(true);

      const finalPrerequisites = prerequisites.filter((p) => p.trim() !== "");
      const finalLearningOutcomes = learningOutcomes.filter((lo) => lo.trim() !== "");

      const coursePayload = {
        ...courseData,
        prerequisites: finalPrerequisites,
        learningOutcomes: finalLearningOutcomes,
        status,
      };
      coursePayload.title = cleaname(coursePayload.title);

      // clg('course payload ---- ',coursePayload);

      
      const response = await createCourse(coursePayload, token);
      if (response.title) {
        await setFacilitatorCourses((prev) => [...prev, response]);
        toast({
          title: status === "draft" ? "Course saved as draft" : "Course created successfully!",
          description: `Your course "${courseData.title}" has been ${status === "draft" ? "saved as draft" : "created"}`,
          variant: "default",
        });

        navigate(status === "draft" ? "/facilitator/drafts" : "/facilitator/courses");
      } else {
        toast({
          title: "New Course Error",
          description: response.error,
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      const errorMessage = error.response?.data?.message || "Failed to create course";

      toast({
        title: "Error creating course",
        description: errorMessage || "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUploading) {
      toast({
        title: "Upload in progress",
        description: "Please wait for the file to finish uploading before submitting.",
        variant: "destructive",
      });
      return;
    }
    clg('submit called...')
    if (!validateForm()) return;
    createCourseHandler("published");
  };

  const saveDraft = (e) => {
    e.preventDefault();
    if (isUploading) {
      toast({
        title: "Upload in progress",
        description: "Please wait for the file to finish uploading before saving as draft.",
        variant: "destructive",
      });
      return;
    }
   
    createCourseHandler("draft");
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-600">
              Create a New Course
            </span>
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-300">
            Craft an engaging learning experience for your students.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          <Card className="p-4 sm:p-6 md:p-8 backdrop-blur-lg bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-red-500/20">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-100">Basic Information</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300 font-medium text-sm sm:text-base">Course Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter course title"
                  value={courseData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300 font-medium text-sm sm:text-base">Category *</Label>
                <Select
                  onValueChange={(value) => handleChange("category", value)}
                  value={courseData.category}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:ring-red-500 focus:border-red-500 text-sm sm:text-base">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {Categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="hover:bg-gray-700 text-sm sm:text-base">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="shortDescription" className="text-gray-300 font-medium text-sm sm:text-base">Short Description *</Label>
                <Input
                  id="shortDescription"
                  placeholder="Brief overview of the course"
                  value={courseData.shortDescription}
                  onChange={(e) => handleChange("shortDescription", e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullDescription" className="text-gray-300 font-medium text-sm sm:text-base">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Detailed description of the course"
                  className="h-24 sm:h-32 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
                  value={courseData.fullDescription}
                  onChange={(e) => handleChange("fullDescription", e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 md:p-8 backdrop-blur-lg bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-red-500/20">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-100">Course Details</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level" className="text-gray-300 font-medium text-sm sm:text-base">Difficulty Level *</Label>
                <Select
                  onValueChange={(value) => handleChange("level", value)}
                  value={courseData.level}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:ring-red-500 focus:border-red-500 text-sm sm:text-base">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="beginner" className="hover:bg-gray-700 text-sm sm:text-base">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="hover:bg-gray-700 text-sm sm:text-base">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="hover:bg-gray-700 text-sm sm:text-base">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-300 font-medium text-sm sm:text-base">Duration (weeks)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Estimated completion time in weeks"
                  value={courseData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-gray-300 font-medium text-sm sm:text-base">Thumbnail Image * (Upload or Enter URL)</Label>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
                  <Button
                    type="button"
                    variant={thumbnailMode === "upload" ? "default" : "outline"}
                    onClick={() => setThumbnailMode("upload")}
                    className={thumbnailMode === "upload" ? "w-full sm:w-auto bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700" : "w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700"}
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={thumbnailMode === "url" ? "default" : "outline"}
                    onClick={() => setThumbnailMode("url")}
                    className={thumbnailMode === "url" ? "w-full sm:w-auto bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700" : "w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700"}
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
                          <p className="text-gray-300 text-sm sm:text-base">{thumbnailFile.name}</p>
                          <p className="text-xs sm:text-sm text-gray-400">{(thumbnailFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeThumbnail}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${
                          isDragActive ? "border-red-500 bg-red-500/10" : "border-gray-600"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-300 text-sm sm:text-base">
                          Drag & drop a thumbnail image here, or click to select a file
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
                      className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
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
                      <p className="text-red-500 text-xs sm:text-sm">{thumbnailError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-gray-300 font-medium text-sm sm:text-base">Prerequisites</Label>
                <div className="space-y-3">
                  {prerequisites.map((prerequisite, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        placeholder={`Prerequisite ${index + 1}`}
                        value={prerequisite}
                        onChange={(e) => updatePrerequisite(index, e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => removePrerequisite(e, index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={addPrerequisite}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Prerequisite
                  </Button>
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-gray-300 font-medium text-sm sm:text-base">Learning Outcomes</Label>
                <div className="space-y-3">
                  {learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        placeholder={`Learning Outcome ${index + 1}`}
                        value={outcome}
                        onChange={(e) => updateLearningOutcome(index, e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => removeLearningOutcome(e, index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={addLearningOutcome}
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
            onChange={(modules) => handleChange("modules", modules)}
            setIsUploading={setIsUploading}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 sm:mt-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/facilitator")}
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={saveDraft}
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
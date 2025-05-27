/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BookOpen, 
  Award, 
  Clock, 
  Target, 
  Users, 
  TrendingUp, 
  ChevronRight,
  Trophy,
  Flame,
  Star,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  FileText,
  Video,
  HelpCircle,
  Lightbulb,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  PlayCircle,
  ArrowRight,
  ArrowLeft,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

const InteractiveLessonSystem = () => {
  const [activeTab, setActiveTab] = useState("student-view");
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [lessonProgress, setLessonProgress] = useState({});
  const [lessons, setLessons] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    estimatedTime: 30,
    steps: []
  });

  // Sample lesson data
  const sampleLessons = [
    {
      id: 'ai-fundamentals-1',
      title: 'Understanding AI Decision Making',
      description: 'Learn how AI systems make decisions through hands-on problem solving',
      category: 'Machine Learning',
      difficulty: 'beginner',
      estimatedTime: 45,
      progress: 75,
      completedSteps: 3,
      totalSteps: 4,
      lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000),
      steps: [
        {
          id: 'problem-intro',
          type: 'problem',
          title: 'The Recommendation Challenge',
          content: `
**Real-World Problem**: You're building a music recommendation system for a streaming service. Users are complaining that they're getting the same type of music recommendations over and over.

**Your Challenge**: Design a solution that balances user preferences with discovery of new content.

**Context**: 
- 10M active users
- 50M songs in catalog
- Current system has 60% user satisfaction
- Goal: Increase to 80% satisfaction
          `,
          question: {
            type: 'multiple-choice',
            prompt: 'What should be the PRIMARY factor in improving recommendations?',
            options: [
              'Add more user data collection',
              'Implement diversity algorithms',
              'Use collaborative filtering only',
              'Recommend only popular songs'
            ],
            correct: 1,
            explanation: 'Diversity algorithms help balance familiarity with discovery, addressing the core complaint about repetitive recommendations.'
          }
        },
        {
          id: 'solution-design',
          type: 'interactive',
          title: 'Design Your Algorithm',
          content: `
Now let's design the recommendation algorithm step by step.

**Key Components to Consider**:
1. User preference weights
2. Diversity factors  
3. Freshness penalties
4. Social signals
          `,
          question: {
            type: 'code',
            prompt: 'Write pseudocode for a balanced recommendation function:',
            placeholder: `function recommendSongs(user, preferences) {
  // Your algorithm here
  return recommendations;
}`,
            solution: `function recommendSongs(user, preferences) {
  familiar_songs = getByPreferences(user, preferences) * 0.7;
  diverse_songs = getByDiversity(user) * 0.2;
  trending_songs = getTrending() * 0.1;
  
  return combine(familiar_songs, diverse_songs, trending_songs);
}`,
            hints: [
              'Consider weighting familiar vs new content',
              'Think about temporal factors',
              'Balance multiple recommendation sources'
            ]
          }
        },
        {
          id: 'implementation',
          type: 'simulation',
          title: 'Test Your Algorithm',
          content: `
Let's simulate your recommendation algorithm with real user data.

**Test Scenario**: 
- User likes: Rock (80%), Jazz (15%), Electronic (5%)
- Recently played: 20 rock songs, 2 jazz songs
- Goal: Recommend 10 songs
          `,
          simulation: {
            userProfile: {
              preferences: { rock: 0.8, jazz: 0.15, electronic: 0.05 },
              recentHistory: ['rock', 'rock', 'jazz', 'rock', 'rock'],
              satisfactionScore: 6.2
            },
            availableSongs: {
              rock: 1000,
              jazz: 500,
              electronic: 300,
              pop: 800
            }
          }
        },
        {
          id: 'reflection',
          type: 'reflection',
          title: 'Real-World Application',
          content: `
**Results from your algorithm**:
- User satisfaction increased to 7.8/10
- Discovery rate: 25% (up from 10%)
- User retention: +15%

**Reflection Questions**:
          `,
          question: {
            type: 'essay',
            prompt: 'How would you adapt this approach for different domains (e.g., news recommendations, e-commerce)?',
            wordLimit: 200,
            rubric: [
              'Identifies domain-specific challenges',
              'Adapts algorithm principles appropriately',
              'Considers ethical implications',
              'Provides concrete examples'
            ]
          }
        }
      ]
    },
    {
      id: 'data-ethics-1',
      title: 'Bias Detection in AI Systems',
      category: 'AI Ethics',
      difficulty: 'intermediate',
      estimatedTime: 60,
      progress: 30,
      completedSteps: 1,
      totalSteps: 5,
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      steps: [
        {
          id: 'bias-scenario',
          type: 'problem',
          title: 'The Hiring Algorithm Dilemma',
          content: `
**Problem**: A tech company's AI hiring system is showing concerning patterns in candidate selection.

**Data**: 
- 1000 applications processed
- 60% male candidates hired vs 30% female candidates
- Similar qualifications across gender lines
- Company claims "algorithm is objective"
          `,
          question: {
            type: 'multiple-choice',
            prompt: 'What is the most likely cause of this bias?',
            options: [
              'Women are less qualified on average',
              'Historical training data contains bias',
              'The algorithm has a bug',
              'This is normal statistical variation'
            ],
            correct: 1
          }
        }
      ]
    }
  ];

  useEffect(() => {
    setLessons(sampleLessons);
    // Load progress from storage (would be API in real app)
    const savedProgress = {};
    sampleLessons.forEach(lesson => {
      savedProgress[lesson.id] = {
        currentStep: lesson.completedSteps,
        answers: {},
        startTime: new Date(),
        timeSpent: 0
      };
    });
    setLessonProgress(savedProgress);
  }, [sampleLessons]);

  const startLesson = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentStep(0);
    setUserAnswers({});
    setShowFeedback({});
  };

  const nextStep = () => {
    if (currentStep < currentLesson.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitAnswer = (stepId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [stepId]: answer
    }));
    
    // Show feedback after submission
    setShowFeedback(prev => ({
      ...prev,
      [stepId]: true
    }));

    // Update progress
    const progressKey = currentLesson.id;
    setLessonProgress(prev => ({
      ...prev,
      [progressKey]: {
        ...prev[progressKey],
        currentStep: Math.max(prev[progressKey]?.currentStep || 0, currentStep + 1),
        answers: {
          ...prev[progressKey]?.answers,
          [stepId]: answer
        }
      }
    }));
  };

  const evaluateAnswer = (step, answer) => {
    switch (step.question.type) {
      case 'multiple-choice':
        return answer === step.question.correct;
      case 'code':
        // Simple keyword matching for demo
        return answer.toLowerCase().includes('function') && 
               answer.toLowerCase().includes('return');
      case 'essay':
        return answer.length >= 50; // Basic length check
      default:
        return true;
    }
  };

  const addLessonStep = () => {
    setNewLesson(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: `step-${prev.steps.length + 1}`,
          type: 'problem',
          title: '',
          content: '',
          question: {
            type: 'multiple-choice',
            prompt: '',
            options: ['', '', '', ''],
            correct: 0
          }
        }
      ]
    }));
  };

  const updateLessonStep = (index, field, value) => {
    setNewLesson(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const renderStep = (step) => {
    const userAnswer = userAnswers[step.id];
    const showingFeedback = showFeedback[step.id];
    const isCorrect = userAnswer && evaluateAnswer(step, userAnswer);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                {step.title}
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {step.content}
                </div>
              </div>
            </div>
          </div>
        </div>

        {step.question && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium">{step.question.prompt}</p>
              
              {step.question.type === 'multiple-choice' && (
                <div className="space-y-2">
                  {step.question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => submitAnswer(step.id, index)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        userAnswer === index
                          ? showingFeedback
                            ? isCorrect
                              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
                            : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step.question.type === 'code' && (
                <div className="space-y-4">
                  <Textarea
                    placeholder={step.question.placeholder}
                    className="font-mono min-h-32"
                    value={userAnswer || ''}
                    onChange={(e) => setUserAnswers(prev => ({
                      ...prev,
                      [step.id]: e.target.value
                    }))}
                  />
                  <Button 
                    onClick={() => submitAnswer(step.id, userAnswer)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Submit Code
                  </Button>
                  {step.question.hints && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Hints:
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {step.question.hints.map((hint, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-xs mt-1">•</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {step.question.type === 'essay' && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts..."
                    className="min-h-32"
                    value={userAnswer || ''}
                    onChange={(e) => setUserAnswers(prev => ({
                      ...prev,
                      [step.id]: e.target.value
                    }))}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {userAnswer?.length || 0} / {step.question.wordLimit} words
                    </span>
                    <Button 
                      onClick={() => submitAnswer(step.id, userAnswer)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Submit Response
                    </Button>
                  </div>
                </div>
              )}

              {showingFeedback && step.question.explanation && (
                <Alert className={isCorrect ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-orange-200 bg-orange-50 dark:bg-orange-900/20"}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    )}
                    <AlertDescription>
                      <strong>{isCorrect ? 'Correct!' : 'Not quite right.'}</strong> {step.question.explanation}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderLessonBuilder = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lesson Builder</h2>
        <Button onClick={() => setIsBuilding(!isBuilding)} className="bg-red-600 hover:bg-red-700">
          {isBuilding ? 'Cancel' : 'Create New Lesson'}
        </Button>
      </div>

      {isBuilding && (
        <Card>
          <CardHeader>
            <CardTitle>New Interactive Lesson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson(prev => ({...prev, title: e.target.value}))}
                  placeholder="Enter lesson title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newLesson.category} onValueChange={(value) => setNewLesson(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="machine-learning">Machine Learning</SelectItem>
                    <SelectItem value="ai-ethics">AI Ethics</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="deep-learning">Deep Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newLesson.description}
                onChange={(e) => setNewLesson(prev => ({...prev, description: e.target.value}))}
                placeholder="Describe what students will learn"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={newLesson.difficulty} onValueChange={(value) => setNewLesson(prev => ({...prev, difficulty: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Estimated Time (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  value={newLesson.estimatedTime}
                  onChange={(e) => setNewLesson(prev => ({...prev, estimatedTime: parseInt(e.target.value)}))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lesson Steps</h3>
                <Button onClick={addLessonStep} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              {newLesson.steps.map((step, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Step {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewLesson(prev => ({
                          ...prev,
                          steps: prev.steps.filter((_, i) => i !== index)
                        }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Step Title</Label>
                        <Input
                          value={step.title}
                          onChange={(e) => updateLessonStep(index, 'title', e.target.value)}
                          placeholder="Enter step title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Step Type</Label>
                        <Select value={step.type} onValueChange={(value) => updateLessonStep(index, 'type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="problem">Problem Introduction</SelectItem>
                            <SelectItem value="interactive">Interactive Challenge</SelectItem>
                            <SelectItem value="simulation">Simulation</SelectItem>
                            <SelectItem value="reflection">Reflection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Content (Markdown supported)</Label>
                      <Textarea
                        value={step.content}
                        onChange={(e) => updateLessonStep(index, 'content', e.target.value)}
                        placeholder="Enter step content..."
                        className="min-h-24"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button className="bg-red-600 hover:bg-red-700">
                <Save className="h-4 w-4 mr-2" />
                Save Lesson
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="capitalize">
                    {lesson.category}
                  </Badge>
                  <Badge variant={lesson.difficulty === 'beginner' ? 'default' : lesson.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                    {lesson.difficulty}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{lesson.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {lesson.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{lesson.progress || 0}%</span>
                  </div>
                  <Progress value={lesson.progress || 0} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{lesson.completedSteps || 0}/{lesson.totalSteps || lesson.steps?.length || 0} steps</span>
                    <span>{lesson.estimatedTime}min</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => startLesson(lesson)}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    {lesson.progress > 0 ? 'Continue' : 'Start'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLessonView = () => {
    if (!currentLesson) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a lesson to start learning
          </h3>
          <p className="text-gray-500">
            Choose from the available interactive lessons to begin your journey.
          </p>
        </div>
      );
    }

    const progress = ((currentStep + 1) / currentLesson.steps.length) * 100;
    const currentStepData = currentLesson.steps[currentStep];

    return (
      <div className="space-y-6">
        {/* Lesson Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{currentLesson.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {currentLesson.description}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setCurrentLesson(null)}
              >
                Exit Lesson
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>Step {currentStep + 1} of {currentLesson.steps.length}</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(progress)}% complete</span>
                <span>{currentLesson.estimatedTime}min estimated</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        {renderStep(currentStepData)}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {currentLesson.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep 
                    ? 'bg-red-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            disabled={currentStep === currentLesson.steps.length - 1}
            className="bg-red-600 hover:bg-red-700"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 mt-16">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interactive Problem-First Lessons</h1>
            <p className="text-red-100 max-w-xl">
              Learn through real-world challenges, hands-on problem solving, and immediate feedback.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-red-100 text-sm">Your Learning Streak</p>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                <span className="text-xl font-bold">7 days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Lessons Completed</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold">7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Achievements</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
                <p className="text-2xl font-bold">24h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="student-view" className="space-y-6">
        <TabsList>
          <TabsTrigger value="student-view">Student View</TabsTrigger>
          <TabsTrigger value="lesson-builder">Lesson Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="student-view">
          {renderLessonView()}
        </TabsContent>

        <TabsContent value="lesson-builder">
          {renderLessonBuilder()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveLessonSystem; 
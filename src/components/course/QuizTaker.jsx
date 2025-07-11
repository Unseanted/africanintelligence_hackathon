import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Flag, 
  X, 
  HelpCircle,
  Save 
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTourLMS } from '../../contexts/TourLMSContext';

const storageKey = (quizId) => `quiz_progress_${quizId}`;

const QuizTaker = ({ 
  course,
  quiz, 
  onSubmit, 
  onClose, 
  courseId, 
  moduleId, 
  isFacilitator = false 
}) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const { token, API_URL, setEnrolledCourses } = useTourLMS();

  useEffect(() => {
    if (!quiz) return;
    
    const duration = (quiz.duration || 30) * 60;
    
    const savedProgress = localStorage.getItem(storageKey(quiz.id || moduleId));
    if (savedProgress) {
      const { answers: savedAnswers, flagged, remainingTime, startTime } = JSON.parse(savedProgress);
      
      setAnswers(savedAnswers || {});
      setFlaggedQuestions(flagged || []);
      
      const timeElapsedSinceLastSave = Math.floor((Date.now() - startTime) / 1000);
      const adjustedTimeLeft = Math.max(0, remainingTime - timeElapsedSinceLastSave);
      
      setTimeLeft(adjustedTimeLeft);
      startTimeRef.current = Date.now() - ((duration - adjustedTimeLeft) * 1000);
    } else {
      setTimeLeft(duration);
      startTimeRef.current = Date.now();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz, moduleId]);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          
          if (prev % 5 === 0) {
            saveProgress(newTime);
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, quizCompleted]);

  const saveProgress = (remainingTime) => {
    if (!quiz || quizCompleted) return;
    
    localStorage.setItem(
      storageKey(quiz.id || moduleId),
      JSON.stringify({
        answers,
        flagged: flaggedQuestions,
        remainingTime: remainingTime || timeLeft,
        startTime: startTimeRef.current
      })
    );
  };

  const clearSavedProgress = () => {
    localStorage.removeItem(storageKey(quiz.id || moduleId));
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: "Your quiz is being submitted automatically.",
      variant: "default"
    });
    
    submitQuiz();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    saveProgress();
  };

  const toggleFlagged = (questionIndex) => {
    setFlaggedQuestions(prev => {
      if (prev.includes(questionIndex)) {
        return prev.filter(idx => idx !== questionIndex);
      } else {
        return [...prev, questionIndex];
      }
    });
    saveProgress();
  };

  const calculateScore = () => {
    let correct = 0;
    let total = quiz.questions.length;
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[question.id];
      
      if (question.type === 'multiple-choice') {
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
        if (userAnswer !== undefined && userAnswer === correctOptionIndex.toString()) {
          correct++;
        }
      } else if (question.type === 'true-false') {
        if (userAnswer === question.answer) {
          correct++;
        }
      } else {
        // Short answers require manual grading
      }
    });
    
    return {
      score: Math.round((correct / total) * 100),
      correct,
      total,
      passed: (correct / total) * 100 >= (quiz.passScore || 70),
      timeSpent: ((quiz.duration || 30) * 60) - timeLeft
    };
  };

  const submitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const results = calculateScore();
      setScore(results.score);
      setResultsData(results);
      setQuizCompleted(true);
      
      const quizData = {
        answers,
        score: results.score,
        passed: results.passed,
        timeSpent: results.timeSpent,
        completedAt: new Date().toISOString(),
      };

      if (!isFacilitator) {
        const response = await fetch(`${API_URL}/learner/courses/${courseId}/modules/${moduleId}/quiz/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ quizData }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit quiz');
        }

        const data = await response.json();
        const updatedProgress = data.progress;

        const Course = { ...course };
        Course.enrollment.moduleProgress = course.enrollment.moduleProgress.map(mp => {
          if (mp.moduleId === moduleId) {
            return { ...mp, quizAttempt: quizData };
          }
          return mp;
        });
        Course.enrollment.progress = updatedProgress;
        setEnrolledCourses(prev => (
          prev.map(crs => (crs.courseId === Course.courseId || crs._id === Course._id ? Course : crs))
        ));
      }

      if (onSubmit) {
        await onSubmit(quizData);
      }
      
      clearSavedProgress();
      
      toast({
        title: results.passed ? "Quiz completed successfully!" : "Quiz completed",
        description: results.passed 
          ? `Congratulations! You scored ${results.score}% and passed the quiz.` 
          : `You scored ${results.score}%. The required passing score was ${quiz.passScore || 70}%.`,
        variant: results.passed ? "default" : "secondary"
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error submitting quiz",
        description: "There was a problem submitting your answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentQuestion(index);
    }
  };

  if (!quiz) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No quiz available</p>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Quiz Results</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="text-center py-8 space-y-8">
            <div className="relative inline-block">
              <div className="w-48 h-48 rounded-full border-8 flex items-center justify-center mx-auto">
                <div className="text-center">
                  <div className="text-5xl font-bold">{score}%</div>
                  <div className="text-sm mt-2">
                    {score >= (quiz.passScore || 70) ? "PASSED" : "FAILED"}
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0">
                {score >= (quiz.passScore || 70) ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Questions</p>
                <p className="text-xl font-bold">{resultsData?.total || 0}</p>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Correct</p>
                <p className="text-xl font-bold text-green-600">{resultsData?.correct || 0}</p>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Time Spent</p>
                <p className="text-xl font-bold">
                  {Math.floor(resultsData?.timeSpent / 60)}m {resultsData?.timeSpent % 60}s
                </p>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Pass Score</p>
                <p className="text-xl font-bold">{quiz.passScore || 70}%</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-6">
            <h3 className="font-semibold text-lg">Questions & Answers</h3>
            
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              let isCorrect = false;
              
              if (question.type === 'multiple-choice') {
                const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
                isCorrect = userAnswer === correctOptionIndex.toString();
              } else if (question.type === 'true-false') {
                isCorrect = userAnswer === question.answer;
              }
              
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : (userAnswer !== undefined ? 'border-red-200 bg-red-50' : 'border-gray-200')
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        userAnswer !== undefined ? (
                          <X className="h-5 w-5 text-red-500" />
                        ) : (
                          <HelpCircle className="h-5 w-5 text-gray-400" />
                        )
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-2">{question.text}</div>
                      
                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2 pl-2">
                          {question.options.map((option, optIdx) => (
                            <div 
                              key={optIdx} 
                              className={`text-sm p-2 rounded ${
                                userAnswer === optIdx.toString() && !option.isCorrect
                                  ? 'bg-red-100'
                                  : option.isCorrect
                                    ? 'bg-green-100'
                                    : 'bg-gray-100'
                              }`}
                            >
                              {option.text}
                              {userAnswer === optIdx.toString() && (
                                <span className="ml-2">(Your answer)</span>
                              )}
                              {option.isCorrect && (
                                <span className="ml-2 font-semibold">(Correct answer)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'true-false' && (
                        <div className="space-y-2 pl-2">
                          <div className={`text-sm p-2 rounded ${
                            userAnswer === 'true' && question.answer !== 'true'
                              ? 'bg-red-100'
                              : question.answer === 'true'
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                          }`}>
                            True
                            {userAnswer === 'true' && (
                              <span className="ml-2">(Your answer)</span>
                            )}
                            {question.answer === 'true' && (
                              <span className="ml-2 font-semibold">(Correct answer)</span>
                            )}
                          </div>
                          <div className={`text-sm p-2 rounded ${
                            userAnswer === 'false' && question.answer !== 'false'
                              ? 'bg-red-100'
                              : question.answer === 'false'
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                          }`}>
                            False
                            {userAnswer === 'false' && (
                              <span className="ml-2">(Your answer)</span>
                            )}
                            {question.answer === 'false' && (
                              <span className="ml-2 font-semibold">(Correct answer)</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {question.type === 'short-answer' && (
                        <div className="space-y-2 pl-2">
                          {userAnswer && (
                            <div className="bg-gray-100 p-2 rounded text-sm">
                              <p className="font-semibold">Your answer:</p>
                              <p>{userAnswer}</p>
                            </div>
                          )}
                          <div className="bg-green-100 p-2 rounded text-sm mt-2">
                            <p className="font-semibold">Sample answer:</p>
                            <p>{question.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end mt-8">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const isAnswered = answers[currentQ.id] !== undefined;
  const isFlagged = flaggedQuestions.includes(currentQuestion);
  
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / quiz.questions.length) * 100;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <p className="text-gray-600 text-sm">{quiz.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 py-1 px-3 rounded-full">
              <Clock className="h-4 w-4 text-gray-600 mr-1" />
              <span className={`font-mono ${timeLeft < 60 ? 'text-red-600 animate-pulse' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                toast({
                  title: "Cannot close quiz",
                  description: "You must complete the quiz or wait for the timer to finish before closing.",
                  variant: "destructive",
                });
              }}
              disabled={true}
            >
              <X className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>{answeredCount} of {quiz.questions.length} answered</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        
        <div className="grid grid-cols-6 md:grid-cols-10 gap-2 mb-6">
          {quiz.questions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestion ? "default" : "outline"}
              className={`h-8 w-8 p-0 relative ${
                answers[quiz.questions[index].id] !== undefined 
                  ? 'bg-gray-200 hover:bg-gray-300 border-gray-300' 
                  : ''
              }`}
              onClick={() => goToQuestion(index)}
            >
              {index + 1}
              {flaggedQuestions.includes(index) && (
                <span className="absolute -top-1 -right-1">
                  <Flag className="h-3 w-3 text-red-500" />
                </span>
              )}
            </Button>
          ))}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <Badge variant="outline" className="mb-2">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm flex items-center gap-1"
              onClick={() => toggleFlagged(currentQuestion)}
            >
              <Flag className={`h-4 w-4 ${isFlagged ? 'text-red-500 fill-red-500' : ''}`} />
              {isFlagged ? 'Unflag' : 'Flag for review'}
            </Button>
          </div>
          
          <div className="text-lg font-medium mb-4">{currentQ.text}</div>
          
          <div className="py-2">
            {currentQ.type === 'multiple-choice' && (
              <RadioGroup 
                value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : ""}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
                className="space-y-3"
              >
                {currentQ.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-white hover:bg-gray-50 p-3 rounded-md border">
                    <RadioGroupItem value={idx.toString()} id={`${currentQ.id}-option-${idx}`} />
                    <Label htmlFor={`${currentQ.id}-option-${idx}`} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {currentQ.type === 'true-false' && (
              <RadioGroup 
                value={answers[currentQ.id] || ""}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 bg-white hover:bg-gray-50 p-3 rounded-md border">
                  <RadioGroupItem value="true" id={`${currentQ.id}-true`} />
                  <Label htmlFor={`${currentQ.id}-true`} className="flex-1 cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2 bg-white hover:bg-gray-50 p-3 rounded-md border">
                  <RadioGroupItem value="false" id={`${currentQ.id}-false`} />
                  <Label htmlFor={`${currentQ.id}-false`} className="flex-1 cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}
            
            {currentQ.type === 'short-answer' && (
              <Textarea 
                placeholder="Type your answer here..."
                className="min-h-[150px]"
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              />
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => goToQuestion(currentQuestion - 1)}
            disabled={isFirstQuestion}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {isLastQuestion ? (
              <Button 
                onClick={submitQuiz}
                disabled={isSubmitting}
                className="flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Submit Quiz
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => goToQuestion(currentQuestion + 1)}
                className="flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizTaker;
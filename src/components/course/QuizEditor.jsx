import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus, Minus, CheckSquare, CheckCircle, Save, Clock } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const QuizEditor = ({ initialQuiz, onSave, onCancel }) => {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState(initialQuiz);

  const updateQuiz = (field, value) => {
    setQuiz(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addQuestion = (type = 'multiple-choice') => {
    const newQuestion = {
      id: Date.now(),
      type,
      text: '',
      options: type === 'multiple-choice' ? [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false }
      ] : [],
      answer: type === 'true-false' ? null : '',
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionIndex) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== questionIndex)
    }));
  };

  const updateQuestion = (questionIndex, field, value) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const addOption = (questionIndex) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const optionId = updatedQuestions[questionIndex].options.length + 1;
      updatedQuestions[questionIndex].options.push({ 
        id: optionId, 
        text: '', 
        isCorrect: false 
      });
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex].options[optionIndex] = {
        ...updatedQuestions[questionIndex].options[optionIndex],
        [field]: value
      };
      
      // For single-choice questions, uncheck other options if this one is checked
      if (field === 'isCorrect' && value === true && updatedQuestions[questionIndex].type === 'multiple-choice') {
        updatedQuestions[questionIndex].options.forEach((option, i) => {
          if (i !== optionIndex) {
            updatedQuestions[questionIndex].options[i].isCorrect = false;
          }
        });
      }
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const validateQuiz = () => {
    // Quiz-level validation
    if (!quiz.title || quiz.title.trim() === "") {
      toast({
        title: "Missing quiz title",
        description: "Please provide a title for the quiz.",
        variant: "destructive",
      });
      return false;
    }

    if (!quiz.passScore || quiz.passScore < 1 || quiz.passScore > 100) {
      toast({
        title: "Invalid pass score",
        description: "Pass score must be a number between 1 and 100.",
        variant: "destructive",
      });
      return false;
    }

    if (!quiz.duration || quiz.duration < 1 || quiz.duration > 180) {
      toast({
        title: "Invalid duration",
        description: "Duration must be a number between 1 and 180 minutes.",
        variant: "destructive",
      });
      return false;
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      toast({
        title: "Missing quiz questions",
        description: "Please add at least one question to the quiz.",
        variant: "destructive",
      });
      return false;
    }

    // Question-level validation
    let questionValidationFailed = false;
    quiz.questions.forEach((question, questionIndex) => {
      if (!question.text || question.text.trim() === "") {
        toast({
          title: "Missing question text",
          description: `Question ${questionIndex + 1} is missing question text.`,
          variant: "destructive",
        });
        questionValidationFailed = true;
      }

      if (question.type === "multiple-choice") {
        if (!question.options || question.options.length < 2) {
          toast({
            title: "Insufficient options",
            description: `Question ${questionIndex + 1} must have at least 2 options.`,
            variant: "destructive",
          });
          questionValidationFailed = true;
        } else {
          question.options.forEach((option, optionIndex) => {
            if (!option.text || option.text.trim() === "") {
              toast({
                title: "Missing option text",
                description: `Option ${optionIndex + 1} in Question ${questionIndex + 1} is missing text.`,
                variant: "destructive",
              });
              questionValidationFailed = true;
            }
          });

          const correctOptions = question.options.filter((option) => option.isCorrect);
          if (correctOptions.length !== 1) {
            toast({
              title: "Invalid correct answer",
              description: `Question ${questionIndex + 1} must have exactly one correct answer selected.`,
              variant: "destructive",
            });
            questionValidationFailed = true;
          }
        }
      } else if (question.type === "true-false") {
        if (question.answer !== "true" && question.answer !== "false") {
          toast({
            title: "Missing true/false answer",
            description: `Question ${questionIndex + 1} must have a True or False answer selected.`,
            variant: "destructive",
          });
          questionValidationFailed = true;
        }
      } else if (question.type === "short-answer") {
        if (!question.answer || question.answer.trim() === "") {
          toast({
            title: "Missing sample answer",
            description: `Question ${questionIndex + 1} must have a sample answer.`,
            variant: "destructive",
          });
          questionValidationFailed = true;
        }
      }
    });

    if (questionValidationFailed) {
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateQuiz()) return;
    onSave(quiz);
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-red-900 via-gray-900 to-red-900 text-gold-300 !important p-4 rounded-lg" style={{ color: '#f6e05e' }}>
      <div className="sm:flex items-center justify-between">
        <div className="flex items-center gap-2 text-gold-300 !important" style={{ color: '#f6e05e' }}>
          <HelpCircle className="h-5 w-5 text-gold-300 !important" style={{ color: '#f6e05e' }} />
          <h2 className="text-lg font-semibold text-gold-300 !important" style={{ color: '#f6e05e' }}>Module Quiz</h2>
        </div>

        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-red-800 text-gold-400 hover:bg-gray-700"
            style={{ color: '#ecc94b' }}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-gold-200 hover:from-red-600 hover:to-gold-100 text-white"
          >
            <Save className="h-4 w-4" />
            Save Quiz
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-gold-400 !important" style={{ color: '#ecc94b' }}>Quiz Title</Label>
            <Input
              value={quiz.title}
              onChange={(e) => updateQuiz('title', e.target.value)}
              placeholder="Enter quiz title"
              className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300"
              style={{ color: '#f6e05e' }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gold-400 !important" style={{ color: '#ecc94b' }}>Pass Score (%)</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={quiz.passScore}
              onChange={(e) => updateQuiz('passScore', e.target.value || 0)}
              placeholder="Passing percentage"
              className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300"
              style={{ color: '#f6e05e' }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gold-400 !important" style={{ color: '#ecc94b' }}>Duration (minutes)</Label>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gold-400 !important mr-2" style={{ color: '#ecc94b' }} />
              <Input
                type="number"
                min="1"
                max="180"
                value={quiz.duration}
                onChange={(e) => updateQuiz('duration', parseInt(e.target.value, 10) || 0)}
                placeholder="Time limit in minutes"
                className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300"
                style={{ color: '#f6e05e' }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gold-400 !important" style={{ color: '#ecc94b' }}>Quiz Description</Label>
          <Textarea
            value={quiz.description}
            onChange={(e) => updateQuiz('description', e.target.value)}
            placeholder="Instructions for students taking this quiz"
            className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300"
            style={{ color: '#f6e05e' }}
          />
        </div>
      </div>

      <div className="sm:flex items-center justify-between border-t border-b border-red-800 py-4">
        <h3 className="font-medium text-gold-300 !important" style={{ color: '#f6e05e' }}>Questions</h3>
        <div className="sm:flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => addQuestion('multiple-choice')}
            className="border-red-800 text-gold-400 hover:bg-gray-700"
            style={{ color: '#ecc94b' }}
          >
            <Plus className="mr-1 h-3 w-3" />
            Multiple Choice
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => addQuestion('true-false')}
            className="border-red-800 text-gold-400 hover:bg-gray-700"
            style={{ color: '#ecc94b' }}
          >
            <Plus className="mr-1 h-3 w-3" />
            True/False
          </Button>
          {/* <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => addQuestion('short-answer')}
            className="border-red-800 text-gold-400 hover:bg-gray-700"
            style={{ color: '#ecc94b' }}
          >
            <Plus className="mr-1 h-3 w-3" />
            Short Answer
          </Button> */}
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, questionIndex) => (
          <Card key={questionIndex} className="p-4 border-2 border-red-800 bg-gray-800/50">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-700 text-gold-200 font-semibold px-2 py-1 rounded text-sm">
                      Q{questionIndex + 1}: {question.type === 'multiple-choice' 
                        ? 'Multiple Choice' 
                        : question.type === 'true-false' 
                          ? 'True/False' 
                          : 'Short Answer'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gold-400 !important" style={{ color: '#ecc94b' }}>Question Text</Label>
                    <Textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                      placeholder="Enter your question"
                      className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300"
                      style={{ color: '#f6e05e' }}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => removeQuestion(questionIndex)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>

              {question.type === 'multiple-choice' && (
                <div className="space-y-3">
                  <div className="sm:flex justify-between items-center">
                    <Label className="text-gold-400 !important" style={{ color: '#ecc94b' }}>Answer Options</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addOption(questionIndex)}
                      disabled={question.options.length >= 6}
                      className="border-red-800 text-gold-400 hover:bg-gray-700"
                      style={{ color: '#ecc94b' }}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Option
                    </Button>
                  </div>

                  {question.options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex} 
                      className="flex items-center gap-2 border border-red-800 p-2 rounded"
                    >
                      <Checkbox
                        id={`q${questionIndex}-option${optionIndex}`}
                        checked={option.isCorrect}
                        onCheckedChange={(checked) => 
                          updateOption(questionIndex, optionIndex, 'isCorrect', checked)
                        }
                        className="border-red-800 text-gold-300"
                      />
                      <Input
                        className="flex-1 bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300"
                        value={option.text}
                        onChange={(e) => 
                          updateOption(questionIndex, optionIndex, 'text', e.target.value)
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        style={{ color: '#f6e05e' }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        disabled={question.options.length <= 2}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'true-false' && (
                <div className="space-y-2">
                  <Label className="text-gold-400 !important" style={{ color: '#ecc94b' }}>Correct Answer</Label>
                  <RadioGroup
                    value={question.answer}
                    onValueChange={(value) => updateQuestion(questionIndex, 'answer', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`q${questionIndex}-true`} className="border-red-800 text-gold-300" />
                      <Label htmlFor={`q${questionIndex}-true`} className="text-gold-300 !important" style={{ color: '#f6e05e' }}>True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`q${questionIndex}-false`} className="border-red-800 text-gold-300" />
                      <Label htmlFor={`q${questionIndex}-false`} className="text-gold-300 !important" style={{ color: '#f6e05e' }}>False</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {question.type === 'short-answer' && (
                <div className="space-y-2">
                  <Label className="text-gold-400 !important" style={{ color: '#ecc94b' }}>Sample Answer (for reference)</Label>
                  <Textarea
                    value={question.answer || ''}
                    onChange={(e) => updateQuestion(questionIndex, 'answer', e.target.value)}
                    placeholder="Sample answer or key points to look for"
                    className="bg-gray-700/50 border-red-800 text-gold-300 !important placeholder-gold-400 focus:ring-gold-300 focus:border-gold-300"
                    style={{ color: '#f6e05e' }}
                  />
                </div>
              )}
            </div>
          </Card>
        ))}

        {quiz.questions.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-red-800 rounded-lg">
            <HelpCircle className="h-10 w-10 mx-auto text-gold-400 !important mb-2" style={{ color: '#ecc94b' }} />
            <h3 className="text-lg font-medium text-gold-300 !important" style={{ color: '#f6e05e' }}>No Questions Added Yet</h3>
            <p className="text-gold-400 !important mb-4" style={{ color: '#ecc94b' }}>Add different types of questions to your quiz</p>
            <div className="flex justify-center gap-2">
              <Button 
                type="button" 
                onClick={() => addQuestion('multiple-choice')} 
                variant="outline"
                className="border-red-800 text-gold-400 hover:bg-gray-700"
                style={{ color: '#ecc94b' }}
              >
                <Plus className="mr-1 h-3 w-3" /> Multiple Choice
              </Button>
              <Button 
                type="button" 
                onClick={() => addQuestion('true-false')} 
                variant="outline"
                className="border-red-800 text-gold-400 hover:bg-gray-700"
                style={{ color: '#ecc94b' }}
              >
                <Plus className="mr-1 h-3 w-3" /> True/False
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizEditor;
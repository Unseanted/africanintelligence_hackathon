import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Video, Edit2, Save, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

const ContentAnalyzer = () => {
  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState('mcq');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const fileInputRef = useRef(null);

  const questionTypes = [
    { id: 'mcq', label: 'Multiple Choice' },
    { id: 'true-false', label: 'True/False' },
    { id: 'short-answer', label: 'Short Answer' }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setGenerationProgress(0);
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // Analyze content and generate questions
      const generatedQuestions = await contentAnalysisService.analyzeContent(file);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setContent({
        type: file.type.includes('pdf') ? 'pdf' : 'video',
        name: file.name,
        size: file.size,
        file: file
      });

      setQuestions(generatedQuestions);
      toast.success(`Generated ${generatedQuestions.length} questions successfully!`);
    } catch (error) {
      toast.error('Failed to analyze content');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
      setGenerationProgress(0);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: selectedQuestionType,
      question: '',
      options: selectedQuestionType === 'mcq' ? ['', '', '', ''] : [],
      correctAnswer: selectedQuestionType === 'mcq' ? 0 : 
                    selectedQuestionType === 'true-false' ? true : '',
      sampleAnswer: selectedQuestionType === 'short-answer' ? '' : undefined
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(newQuestion.id);
  };

  const handleEditQuestion = (questionId) => {
    setEditingQuestion(questionId);
  };

  const handleSaveQuestion = (questionId, updatedQuestion) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updatedQuestion } : q
    ));
    setEditingQuestion(null);
    toast.success('Question saved successfully');
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    toast.success('Question deleted');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf,video/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    {content?.type === 'pdf' ? <FileText className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
                    Upload Content
                  </>
                )}
              </Button>
              {content && (
                <Badge variant="secondary">
                  {content.name} ({Math.round(content.size / 1024)}KB)
                </Badge>
              )}
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Generating questions...</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            )}

            {content && !isAnalyzing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Generated Questions</h3>
                    <p className="text-sm text-gray-500">
                      {questions.length} questions generated ({questions.filter(q => q.type === 'mcq').length} MCQ,{' '}
                      {questions.filter(q => q.type === 'true-false').length} True/False,{' '}
                      {questions.filter(q => q.type === 'short-answer').length} Short Answer)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedQuestionType}
                      onValueChange={setSelectedQuestionType}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Question Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddQuestion}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {questions.map(question => (
                      <Card key={question.id}>
                        <CardContent className="pt-6">
                          {editingQuestion === question.id ? (
                            <div className="space-y-4">
                              <Textarea
                                value={question.question}
                                onChange={(e) => handleSaveQuestion(question.id, {
                                  ...question,
                                  question: e.target.value
                                })}
                                placeholder="Enter your question"
                              />
                              {question.type === 'mcq' && (
                                <div className="space-y-2">
                                  {question.options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...question.options];
                                          newOptions[index] = e.target.value;
                                          handleSaveQuestion(question.id, {
                                            ...question,
                                            options: newOptions
                                          });
                                        }}
                                        placeholder={`Option ${index + 1}`}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSaveQuestion(question.id, {
                                          ...question,
                                          correctAnswer: index
                                        })}
                                        className={question.correctAnswer === index ? 'bg-green-100' : ''}
                                      >
                                        Correct
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {question.type === 'true-false' && (
                                <div className="flex gap-2">
                                  <Button
                                    variant={question.correctAnswer === true ? 'default' : 'outline'}
                                    onClick={() => handleSaveQuestion(question.id, {
                                      ...question,
                                      correctAnswer: true
                                    })}
                                  >
                                    True
                                  </Button>
                                  <Button
                                    variant={question.correctAnswer === false ? 'default' : 'outline'}
                                    onClick={() => handleSaveQuestion(question.id, {
                                      ...question,
                                      correctAnswer: false
                                    })}
                                  >
                                    False
                                  </Button>
                                </div>
                              )}
                              {question.type === 'short-answer' && (
                                <Textarea
                                  value={question.sampleAnswer}
                                  onChange={(e) => handleSaveQuestion(question.id, {
                                    ...question,
                                    sampleAnswer: e.target.value
                                  })}
                                  placeholder="Enter sample answer"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <p className="font-medium">{question.question}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {question.type === 'mcq' ? 'Multiple Choice' :
                                     question.type === 'true-false' ? 'True/False' :
                                     'Short Answer'}
                                  </Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditQuestion(question.id)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {question.type === 'mcq' && (
                                <div className="space-y-1">
                                  {question.options.map((option, index) => (
                                    <div
                                      key={index}
                                      className={`p-2 rounded ${
                                        question.correctAnswer === index
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100'
                                      }`}
                                    >
                                      {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {question.type === 'true-false' && (
                                <Badge variant="secondary">
                                  Correct Answer: {question.correctAnswer ? 'True' : 'False'}
                                </Badge>
                              )}
                              {question.type === 'short-answer' && (
                                <div className="bg-gray-100 p-2 rounded">
                                  <p className="text-sm font-medium">Sample Answer:</p>
                                  <p className="text-sm">{question.sampleAnswer}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAnalyzer; 
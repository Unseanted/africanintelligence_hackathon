import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Video, Edit2, Trash2, Plus, Download } from 'lucide-react';
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

  const analyzeContent = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze-content', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setGenerationProgress(0);

    try {
      // Real-time progress simulation (replace with actual progress updates if available)
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const generatedQuestions = await analyzeContent(file);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setContent({
        type: file.type.includes('pdf') ? 'pdf' : 'video',
        name: file.name,
        size: file.size
      });

      setQuestions(generatedQuestions);
      toast.success('Content analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
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

  const handleSaveQuestion = (questionId, updatedQuestion) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updatedQuestion } : q
    ));
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleExportQuestions = async () => {
    try {
      const response = await fetch('/api/export-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          questions
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions-${content?.name || 'export'}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Questions exported successfully');
    } catch (error) {
      toast.error('Failed to export questions');
    }
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
                accept=".pdf,.mp4,.webm,.mov"
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
                  'Upload Content'
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
                <div className="flex justify-between text-sm text-muted-foreground">
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
                    <p className="text-sm text-muted-foreground">
                      {questions.length} questions
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
                    <Button onClick={handleAddQuestion} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                    <Button 
                      onClick={handleExportQuestions} 
                      variant="secondary" 
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[500px] pr-4">
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
                                placeholder="Enter question"
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
                                        variant={question.correctAnswer === index ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSaveQuestion(question.id, {
                                          ...question,
                                          correctAnswer: index
                                        })}
                                      >
                                        Correct
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setEditingQuestion(null)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => setEditingQuestion(null)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{question.question}</p>
                                  <Badge variant="outline" className="mt-1">
                                    {question.type}
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
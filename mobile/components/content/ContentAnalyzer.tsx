import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Card, Button, TextInput, ProgressBar } from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { contentAnalysisService } from '../../../services/contentAnalysisService';
import { cn } from '@/lib/utils';
import { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface Question {
  id: string;
  type: 'mcq' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

const ContentAnalyzer = () => {
  const [content, setContent] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<Question['type']>('mcq');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const fileInputRef = useRef<any>(null);

  const questionTypes = [
    { id: 'mcq', label: 'Multiple Choice' },
    { id: 'true-false', label: 'True/False' },
    { id: 'short-answer', label: 'Short Answer' }
  ];

  const handleFileUpload = async (file: any) => {
    setIsAnalyzing(true);
    setGenerationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    try {
      // Simulate content analysis
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const sampleContent = 'This is a sample content extracted from the uploaded file.';
      setContent(sampleContent);

      // Generate questions based on content length
      const questionCount = sampleContent.length > 1000 ? 10 : 5;
      const generatedQuestions = generateQuestions(sampleContent, questionCount);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setGenerationProgress(0);
    }
  };

  const generateQuestions = (content: string, count: number): Question[] => {
    const questions: Question[] = [];
    const mcqCount = Math.floor(count * 0.3);
    const trueFalseCount = Math.floor(count * 0.2);
    const shortAnswerCount = count - mcqCount - trueFalseCount;

    // Generate MCQs
    for (let i = 0; i < mcqCount; i++) {
      questions.push({
        id: `mcq-${i}`,
        type: 'mcq',
        question: `Sample MCQ ${i + 1} about the content?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: 'This is the correct answer because...',
      });
    }

    // Generate True/False questions
    for (let i = 0; i < trueFalseCount; i++) {
      questions.push({
        id: `tf-${i}`,
        type: 'true-false',
        question: `Sample True/False ${i + 1} about the content?`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'This is true because...',
      });
    }

    // Generate Short Answer questions
    for (let i = 0; i < shortAnswerCount; i++) {
      questions.push({
        id: `sa-${i}`,
        type: 'short-answer',
        question: `Sample Short Answer ${i + 1} about the content?`,
        correctAnswer: 'Sample answer',
        explanation: 'This is a good answer because...',
      });
    }

    return questions;
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      type: selectedQuestionType,
      question: '',
      options: selectedQuestionType === 'mcq' ? ['', '', '', ''] : [],
      correctAnswer: selectedQuestionType === 'mcq' ? 'Option A' : 
                    selectedQuestionType === 'true-false' ? 'True' : '',
      explanation: selectedQuestionType === 'short-answer' ? '' : undefined
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(newQuestion);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleSaveQuestion = (updatedQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const renderQuestionCard = (question: Question) => (
    <Card key={question.id} className="p-4">
      {editingQuestion?.id === question.id ? (
        <View className="space-y-4">
          <Input
            label="Question"
            value={editingQuestion.question}
            onChangeText={(text) =>
              setEditingQuestion({ ...editingQuestion, question: text })
            }
          />
          {editingQuestion.type === 'mcq' && (
            <View className="space-y-2">
              {editingQuestion.options?.map((option, index) => (
                <Input
                  key={index}
                  label={`Option ${index + 1}`}
                  value={option}
                  onChangeText={(text) => {
                    const newOptions = [...(editingQuestion.options || [])];
                    newOptions[index] = text;
                    setEditingQuestion({
                      ...editingQuestion,
                      options: newOptions,
                    });
                  }}
                />
              ))}
            </View>
          )}
          <View className="flex-row justify-end space-x-2">
            <Button
              variant="outline"
              onPress={() => setEditingQuestion(null)}
            >
              Cancel
            </Button>
            <Button
              onPress={() => handleSaveQuestion(editingQuestion)}
            >
              Save
            </Button>
          </View>
        </View>
      ) : (
        <View>
          <Text className="text-lg font-medium">{question.question}</Text>
          {question.type === 'mcq' && (
            <View className="mt-2 space-y-2">
              {question.options?.map((option, index) => (
                <Text key={index} className="text-sm">
                  {String.fromCharCode(65 + index)}. {option}
                </Text>
              ))}
            </View>
          )}
          <View className="mt-4 flex-row justify-end space-x-2">
            <Button
              variant="outline"
              onPress={() => handleEditQuestion(question)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onPress={() => handleDeleteQuestion(question.id)}
            >
              Delete
            </Button>
          </View>
        </View>
      )}
    </Card>
  );

  return (
    <ScrollView className="flex-1 p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Content Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onPress={() => fileInputRef.current?.click()}
            className="mb-4"
          >
            Upload PDF or Video
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.mp4,.mov"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Card className="mb-4">
          <CardContent>
            <View className="items-center">
              <ActivityIndicator size="large" />
              <Text className="mt-2">Analyzing content... {generationProgress}%</Text>
            </View>
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-4">
              {questions.map(renderQuestionCard)}
            </View>
          </CardContent>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  mainCard: {
    marginBottom: 16,
  },
  uploadSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
  },
  loader: {
    marginRight: 8,
  },
  fileInfo: {
    marginTop: 8,
    color: '#666',
  },
  progressSection: {
    marginVertical: 16,
  },
  progressText: {
    marginBottom: 8,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  questionsSection: {
    flex: 1,
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionsCount: {
    color: '#666',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionsList: {
    flex: 1,
  },
  questionCard: {
    marginBottom: 16,
  },
  editingContainer: {
    gap: 16,
  },
  questionInput: {
    backgroundColor: '#fff',
  },
  optionsContainer: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#fff',
  },
  correctButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  correctButtonActive: {
    backgroundColor: '#e6f4ea',
  },
  correctButtonText: {
    color: '#666',
  },
  trueFalseContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  trueFalseButton: {
    flex: 1,
  },
  sampleAnswerInput: {
    backgroundColor: '#fff',
    minHeight: 100,
  },
  questionView: {
    gap: 8,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  questionType: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  questionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  correctOption: {
    backgroundColor: '#e6f4ea',
  },
  optionText: {
    color: '#333',
  },
  answerText: {
    color: '#666',
    fontSize: 14,
  },
  sampleAnswerContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
  },
  sampleAnswerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sampleAnswerText: {
    color: '#333',
  },
});

export default ContentAnalyzer; 
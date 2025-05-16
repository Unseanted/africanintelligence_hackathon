import React, { useState, useEffect } from 'react';
import { Lesson, Problem, UserProgress } from '../../types/lesson';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { ProblemComponent } from './ProblemComponent';
import { TextContent } from './TextContent';
import { CodeEditor } from './CodeEditor';

interface LessonViewerProps {
  lesson: Lesson;
  onProgressUpdate: (progress: UserProgress) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, onProgressUpdate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState<UserProgress>({
    userId: '', // Will be set from auth context
    lessonId: lesson.id,
    completed: false,
    score: 0,
    lastAttempted: new Date(),
    attempts: [],
  });

  const handleAnswer = (answer: string | string[], problemId: string) => {
    // Evaluate answer and update progress
    const currentContent = lesson.content[currentStep];
    if (currentContent.type === 'problem') {
      const problem = JSON.parse(currentContent.content) as Problem;
      const isCorrect = Array.isArray(problem.correctAnswer)
        ? JSON.stringify(answer.sort()) === JSON.stringify(problem.correctAnswer.sort())
        : answer === problem.correctAnswer;

      const newAttempt = {
        id: Date.now().toString(),
        timestamp: new Date(),
        answers: { [problemId]: answer },
        score: isCorrect ? problem.points : 0,
        feedback: [isCorrect ? 'Correct!' : 'Try again!'],
      };

      setProgress(prev => ({
        ...prev,
        attempts: [...prev.attempts, newAttempt],
        score: prev.score + newAttempt.score,
      }));
    }
  };

  const renderContent = () => {
    const content = lesson.content[currentStep];
    switch (content.type) {
      case 'text':
        return <TextContent content={content.content} />;
      case 'problem':
        return (
          <ProblemComponent
            problem={JSON.parse(content.content) as Problem}
            onAnswer={handleAnswer}
          />
        );
      case 'code':
        return <CodeEditor content={content.content} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    onProgressUpdate(progress);
  }, [progress]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
          <Progress value={(currentStep / lesson.content.length) * 100} />
        </CardHeader>
        <CardContent>
          {renderContent()}
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep(prev => Math.min(lesson.content.length - 1, prev + 1))}
              disabled={currentStep === lesson.content.length - 1}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
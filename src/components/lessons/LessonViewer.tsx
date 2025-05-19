import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

interface Problem {
  id: string;
  question: string;
  solution: string;
  hints: string[];
  feedback: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  problems: Problem[];
}

interface LessonViewerProps {
  lessonId: string;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({ lessonId }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // TODO: Fetch lesson data from API
    const fetchLesson = async () => {
      try {
        // Mock data for now
        const mockLesson: Lesson = {
          id: lessonId,
          title: "Sample Lesson",
          description: "This is a sample lesson",
          problems: [
            {
              id: "1",
              question: "What is the capital of France?",
              solution: "Paris",
              hints: ["It's known as the City of Light"],
              feedback: "Correct! Paris is the capital of France."
            }
          ]
        };
        setLesson(mockLesson);
      } catch (error) {
        console.error('Error fetching lesson:', error);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleSubmit = () => {
    setShowFeedback(true);
    // TODO: Implement answer validation and progress tracking
    const currentProblem = lesson?.problems[currentProblemIndex];
    if (currentProblem && userAnswer.toLowerCase() === currentProblem.solution.toLowerCase()) {
      setProgress((currentProblemIndex + 1) / (lesson?.problems.length || 1) * 100);
    }
  };

  const handleNext = () => {
    if (lesson && currentProblemIndex < lesson.problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      setUserAnswer('');
      setShowFeedback(false);
    }
  };

  if (!lesson) {
    return <div>Loading...</div>;
  }

  const currentProblem = lesson.problems[currentProblemIndex];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="text-gray-600">{lesson.description}</p>
      </div>

      <Progress value={progress} className="mb-4" />

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Problem {currentProblemIndex + 1}</h2>
            <p className="text-lg">{currentProblem.question}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your Answer</label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Enter your answer here..."
            />
          </div>

          {showFeedback && (
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Feedback</h3>
              <p>{currentProblem.feedback}</p>
              {currentProblem.hints.map((hint, index) => (
                <p key={index} className="text-sm text-gray-600 mt-1">
                  Hint {index + 1}: {hint}
                </p>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFeedback(true)}
              disabled={showFeedback}
            >
              Show Hints
            </Button>
            {!showFeedback ? (
              <Button onClick={handleSubmit}>Submit Answer</Button>
            ) : (
              <Button onClick={handleNext}>
                {currentProblemIndex < lesson.problems.length - 1 ? 'Next Problem' : 'Complete Lesson'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}; 
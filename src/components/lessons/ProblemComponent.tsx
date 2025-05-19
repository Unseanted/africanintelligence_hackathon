import React, { useState } from 'react';
import { Problem } from '../../types/lesson';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';

interface ProblemComponentProps {
  problem: Problem;
  onAnswer: (answer: string | string[], problemId: string) => void;
}

export const ProblemComponent: React.FC<ProblemComponentProps> = ({ problem, onAnswer }) => {
  const [answer, setAnswer] = useState<string | string[]>([]);
  const [feedback, setFeedback] = useState<string>('');

  const handleSubmit = () => {
    onAnswer(answer, problem.id);
    setFeedback(problem.explanation);
  };

  const renderQuestionType = () => {
    switch (problem.type) {
      case 'multiple-choice':
        return (
          <RadioGroup
            value={answer as string}
            onValueChange={(value) => setAnswer(value)}
            className="space-y-2"
          >
            {problem.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'text':
        return (
          <Textarea
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[100px]"
          />
        );

      case 'matching':
        return (
          <div className="space-y-4">
            {problem.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Label>{option}</Label>
                <Input
                  value={(answer as string[])[index] || ''}
                  onChange={(e) => {
                    const newAnswer = [...(answer as string[])];
                    newAnswer[index] = e.target.value;
                    setAnswer(newAnswer);
                  }}
                  placeholder="Match here..."
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{problem.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderQuestionType()}
          <Button onClick={handleSubmit} className="w-full">
            Submit Answer
          </Button>
          {feedback && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">{feedback}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 
import React from 'react';
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from 'lucide-react';

const QuizSummary = ({ quiz, quizAttempts }) => {
  const { score, passed, timeSpent } = quizAttempts || {};

  return (
    <Card className="p-4 border rounded-lg flex justify-between items-center bg-green-100">
      <div className="flex items-center gap-2">
        {passed ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <AlertCircle className="w-6 h-6 text-red-500" />
        )}
        <div>
          <h4 className="font-medium text-purple-600">{quiz.title}</h4>
          <p className="text-sm text-gray-600 font-bold">
            Score: {score}% | {passed ? 'Passed' : 'Failed'} | Time Spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
          </p>
        </div>
      </div>
    </Card>
  );
};

export default QuizSummary;
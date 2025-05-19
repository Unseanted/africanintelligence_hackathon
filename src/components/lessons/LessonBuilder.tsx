import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';

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

export const LessonBuilder: React.FC = () => {
  const [lesson, setLesson] = useState<Lesson>({
    id: '',
    title: '',
    description: '',
    problems: []
  });

  const [currentProblem, setCurrentProblem] = useState<Problem>({
    id: '',
    question: '',
    solution: '',
    hints: [],
    feedback: ''
  });

  const addProblem = () => {
    setLesson(prev => ({
      ...prev,
      problems: [...prev.problems, { ...currentProblem, id: Date.now().toString() }]
    }));
    setCurrentProblem({
      id: '',
      question: '',
      solution: '',
      hints: [],
      feedback: ''
    });
  };

  const saveLesson = async () => {
    try {
      // TODO: Implement API call to save lesson
      console.log('Saving lesson:', lesson);
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Interactive Lesson Builder</h1>
      
      <Card className="p-4 mb-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Lesson Title</label>
            <Input
              value={lesson.title}
              onChange={(e) => setLesson(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter lesson title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={lesson.description}
              onChange={(e) => setLesson(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter lesson description"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4">Add Problem</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <Textarea
              value={currentProblem.question}
              onChange={(e) => setCurrentProblem(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter problem question"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Solution</label>
            <Textarea
              value={currentProblem.solution}
              onChange={(e) => setCurrentProblem(prev => ({ ...prev, solution: e.target.value }))}
              placeholder="Enter problem solution"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Feedback</label>
            <Textarea
              value={currentProblem.feedback}
              onChange={(e) => setCurrentProblem(prev => ({ ...prev, feedback: e.target.value }))}
              placeholder="Enter feedback for students"
            />
          </div>

          <Button onClick={addProblem}>Add Problem</Button>
        </div>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Preview</Button>
        <Button onClick={saveLesson}>Save Lesson</Button>
      </div>
    </div>
  );
}; 
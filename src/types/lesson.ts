export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: LessonContent[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // in minutes
  prerequisites: string[];
  tags: string[];
}

export interface LessonContent {
  type: "text" | "problem" | "quiz" | "code";
  content: string;
  order: number;
}

export interface Problem {
  id: string;
  type: "multiple-choice" | "coding" | "text" | "matching";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface UserProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  lastAttempted: Date;
  attempts: Attempt[];
}

export interface Attempt {
  id: string;
  timestamp: Date;
  answers: Record<string, string | string[]>;
  score: number;
  feedback: string[];
}

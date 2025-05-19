export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: LessonContent[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // in minutes
  prerequisites: string[];
  tags: string[];
  problems: Problem[];
}

export interface LessonContent {
  type: "text" | "problem" | "quiz" | "code";
  content: string;
  order: number;
}

export interface Problem {
  id: string;
  question: string;
  solution: string;
  hints: string[];
  feedback: string;
}

export interface UserProgress {
  userId: string;
  lessonId: string;
  completedProblems: string[];
  currentProblemIndex: number;
  score: number;
  lastAttempted: Date;
}

export interface LessonAttempt {
  id: string;
  userId: string;
  lessonId: string;
  timestamp: Date;
  answers: Record<string, string>;
  score: number;
  feedback: string[];
}

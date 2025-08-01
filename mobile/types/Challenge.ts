// types/Challenge.ts

export type SubmissionType = 'text' | 'quiz' | 'timed-quiz' | 'video' | 'image';

export type Question = {
  text: string;
  type?: string;
  options?: string[];
  multiple?: boolean;
};

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'upcoming' | 'completed';
  startTime: number;
  endTime: number;
  participants: number;
  maxScore: number;
  difficulty: string;
  requirements: string;
  rewards: string;
  submissionType: SubmissionType;
  questions: Question[];
  aiPowered?: boolean;
}

import { Lesson, Problem } from '../types/lesson';

interface UserProgress {
  userId: string;
  lessonId: string;
  completedProblems: string[];
  currentProblemIndex: number;
  score: number;
  lastAttempted: Date;
}

class LessonService {
  private static instance: LessonService;
  private lessons: Map<string, Lesson> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();

  private constructor() {}

  static getInstance(): LessonService {
    if (!LessonService.instance) {
      LessonService.instance = new LessonService();
    }
    return LessonService.instance;
  }

  async createLesson(lesson: Lesson): Promise<Lesson> {
    // TODO: Implement API call to save lesson
    this.lessons.set(lesson.id, lesson);
    return lesson;
  }

  async getLesson(lessonId: string): Promise<Lesson | null> {
    // TODO: Implement API call to fetch lesson
    return this.lessons.get(lessonId) || null;
  }

  async saveProgress(progress: UserProgress): Promise<void> {
    // TODO: Implement API call to save progress
    this.userProgress.set(`${progress.userId}-${progress.lessonId}`, progress);
  }

  async getProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
    // TODO: Implement API call to fetch progress
    return this.userProgress.get(`${userId}-${lessonId}`) || null;
  }

  async validateAnswer(problemId: string, answer: string): Promise<{
    correct: boolean;
    feedback: string;
  }> {
    const problem = Array.from(this.lessons.values())
      .flatMap(lesson => lesson.problems)
      .find(p => p.id === problemId);

    if (!problem) {
      throw new Error('Problem not found');
    }

    const isCorrect = answer.toLowerCase() === problem.solution.toLowerCase();
    return {
      correct: isCorrect,
      feedback: isCorrect ? problem.feedback : 'Try again!'
    };
  }

  async getNextProblem(userId: string, lessonId: string): Promise<Problem | null> {
    const progress = await this.getProgress(userId, lessonId);
    const lesson = await this.getLesson(lessonId);

    if (!progress || !lesson) {
      return lesson?.problems[0] || null;
    }

    const nextProblemIndex = progress.currentProblemIndex + 1;
    return lesson.problems[nextProblemIndex] || null;
  }
}

export const lessonService = LessonService.getInstance(); 
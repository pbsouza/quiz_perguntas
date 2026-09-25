export type QuestionType = 'multiple_choice' | 'multiple_select' | 'text' | 'boolean' | 'number';

export interface Question {
  id?: string | number;
  question: string;
  type?: QuestionType;
  options?: string[];
  correctOptionIndex?: number; // For multiple_choice and boolean
  correctOptionIndices?: number[]; // For multiple_select
  correctAnswer?: string | number; // For text and number
  correctAnswers?: string[]; // Alternative accepted text answers
  correctBoolean?: boolean; // For boolean questions
  explanation?: string;
  category?: string;
  hint?: string;
  placeholder?: string;
}

export interface QuizSchema {
  title?: string;
  description?: string;
  author?: string;
  videoUrl?: string; // YouTube video URL or ID (Parte 1)
  videoTitle?: string;
  videoDescription?: string;
  questions: Question[]; // Perguntas (Parte 2)
}

export interface QuestionAnswerState {
  answered: boolean;
  userAnswer: any; // index (number), indices (number[]), text (string), or boolean
  isCorrect: boolean;
}

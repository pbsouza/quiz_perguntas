import { QuizSchema, QuestionAnswerState } from '../types/quiz';

export interface SavedQuizItem {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  savedAt: number; // timestamp
  data: QuizSchema;
  lastScore?: {
    correct: number;
    wrong: number;
    total: number;
    percentage: number;
    completedAt: number;
  };
}

export interface ActiveQuizSession {
  quiz: QuizSchema;
  currentIndex: number;
  answers: Record<number, QuestionAnswerState>;
  updatedAt: number;
}

const STORAGE_KEY_SAVED_LIST = 'quizschema_saved_quizzes_v1';
const STORAGE_KEY_ACTIVE_SESSION = 'quizschema_active_session_v1';

/**
 * Retrieves all saved quizzes from LocalStorage
 */
export function getSavedQuizzes(): SavedQuizItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_LIST);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('Error reading saved quizzes from storage:', e);
    return [];
  }
}

/**
 * Saves a quiz into the library. If already exists (matching title or id), updates it.
 */
export function saveQuizToLibrary(quiz: QuizSchema, customTitle?: string): SavedQuizItem {
  const currentList = getSavedQuizzes();
  const effectiveTitle = customTitle || quiz.title || 'Questionário sem título';
  
  // Look for existing entry with same title or id
  const existingIndex = currentList.findIndex(
    item => item.title.trim().toLowerCase() === effectiveTitle.trim().toLowerCase()
  );

  const id = existingIndex >= 0 ? currentList[existingIndex].id : `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  const newItem: SavedQuizItem = {
    id,
    title: effectiveTitle,
    description: quiz.description,
    questionCount: quiz.questions.length,
    savedAt: Date.now(),
    data: {
      ...quiz,
      title: effectiveTitle,
    },
    lastScore: existingIndex >= 0 ? currentList[existingIndex].lastScore : undefined,
  };

  let updatedList: SavedQuizItem[];
  if (existingIndex >= 0) {
    updatedList = [...currentList];
    updatedList[existingIndex] = {
      ...newItem,
      lastScore: currentList[existingIndex].lastScore,
    };
  } else {
    updatedList = [newItem, ...currentList];
  }

  try {
    localStorage.setItem(STORAGE_KEY_SAVED_LIST, JSON.stringify(updatedList));
  } catch (e) {
    console.error('Error saving quiz to storage:', e);
  }

  return newItem;
}

/**
 * Updates the score of a saved quiz
 */
export function recordQuizScore(quizTitle: string, correct: number, wrong: number, total: number): void {
  try {
    const currentList = getSavedQuizzes();
    const cleanTitle = quizTitle.trim().toLowerCase();
    const index = currentList.findIndex(item => item.title.trim().toLowerCase() === cleanTitle);
    
    if (index >= 0) {
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      currentList[index].lastScore = {
        correct,
        wrong,
        total,
        percentage,
        completedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY_SAVED_LIST, JSON.stringify(currentList));
    }
  } catch (e) {
    console.error('Error recording score:', e);
  }
}

/**
 * Deletes a quiz from LocalStorage library
 */
export function deleteSavedQuiz(id: string): SavedQuizItem[] {
  try {
    const currentList = getSavedQuizzes();
    const filtered = currentList.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_SAVED_LIST, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Error deleting quiz from storage:', e);
    return getSavedQuizzes();
  }
}

/**
 * Saves current active session so the user never loses progress
 */
export function saveActiveSession(
  quiz: QuizSchema | null,
  currentIndex: number,
  answers: Record<number, QuestionAnswerState>
): void {
  try {
    if (!quiz) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
      return;
    }

    const session: ActiveQuizSession = {
      quiz,
      currentIndex,
      answers,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving active session:', e);
  }
}

/**
 * Loads the active session if available
 */
export function loadActiveSession(): ActiveQuizSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.quiz && Array.isArray(parsed.quiz.questions) && parsed.quiz.questions.length > 0) {
      return parsed;
    }
    return null;
  } catch (e) {
    console.error('Error loading active session:', e);
    return null;
  }
}

/**
 * Clears the active session
 */
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
  } catch (e) {
    // Ignore
  }
}
